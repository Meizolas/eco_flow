import { PeriodType } from "@prisma/client";
import { alertRepository } from "../repositories/alert.repository";
import { propertyRepository } from "../repositories/property.repository";
import { readingRepository } from "../repositories/reading.repository";
import { getDateRangeByPeriod } from "../utils/date-range";
import { toNumber } from "../utils/number";

const summarizeReadings = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const dashboardService = {
  async getSummary(userId: string, propertyId?: string, period: PeriodType = PeriodType.MONTHLY) {
    const property = propertyId
      ? await propertyRepository.findAccessibleProperty(userId, propertyId)
      : await propertyRepository.findDefaultProperty(userId);

    if (!property) {
      throw new Error("Nenhuma propriedade cadastrada para este usuario.");
    }

    const primaryMeter = property.waterMeters[0];

    if (!primaryMeter) {
      return {
        propertyId: property.id,
        propertyName: property.name,
        period,
        totalConsumptionLiters: 0,
        averageConsumptionLiters: 0,
        previousPeriodConsumptionLiters: 0,
        comparisonPercentage: 0,
        trend: "stable",
        status: "healthy",
        message: "Cadastre um hidrometro para iniciar o monitoramento.",
        activeAlerts: [],
        smartTip: "Defina um limite mensal para receber avisos automaticos."
      };
    }

    const { currentStart, currentEnd, previousStart, previousEnd, bucketCount } =
      getDateRangeByPeriod(period);

    const [currentReadings, previousReadings, alerts] = await Promise.all([
      readingRepository.findByRange(primaryMeter.id, currentStart, currentEnd),
      readingRepository.findByRange(primaryMeter.id, previousStart, previousEnd),
      alertRepository.listByUser(userId)
    ]);

    const currentValues = currentReadings.map((reading) => toNumber(reading.measuredLiters));
    const previousValues = previousReadings.map((reading) => toNumber(reading.measuredLiters));
    const totalConsumptionLiters = summarizeReadings(currentValues);
    const previousPeriodConsumptionLiters = summarizeReadings(previousValues);
    const averageConsumptionLiters = bucketCount ? totalConsumptionLiters / bucketCount : 0;
    const comparisonPercentage = previousPeriodConsumptionLiters
      ? ((totalConsumptionLiters - previousPeriodConsumptionLiters) / previousPeriodConsumptionLiters) *
        100
      : 0;

    const trend =
      comparisonPercentage > 5 ? "up" : comparisonPercentage < -5 ? "down" : "stable";
    const status =
      comparisonPercentage >= 35
        ? "critical"
        : comparisonPercentage >= 10
          ? "attention"
          : "healthy";

    const smartTip =
      status === "critical"
        ? "Seu consumo subiu muito em relacao ao periodo anterior. Verifique descargas, torneiras e areas externas."
        : status === "attention"
          ? "Existe uma variacao moderada no consumo. Considere revisar horarios de maior uso e reaproveitamento."
          : "Seu consumo esta dentro de um padrao saudavel. Continue acompanhando para manter previsibilidade.";

    return {
      propertyId: property.id,
      propertyName: property.name,
      meterId: primaryMeter.id,
      period,
      totalConsumptionLiters,
      averageConsumptionLiters,
      previousPeriodConsumptionLiters,
      comparisonPercentage,
      trend,
      status,
      message:
        status === "critical"
          ? "Consumo fortemente acima do esperado"
          : status === "attention"
            ? "Consumo em zona de atencao"
            : "Consumo equilibrado",
      smartTip,
      activeAlerts: alerts.slice(0, 5).map((alert) => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        detectedAt: alert.detectedAt
      }))
    };
  }
};
