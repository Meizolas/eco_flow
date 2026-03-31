import { AlertSeverity, AlertType, PeriodType } from "@prisma/client";
import { alertRepository } from "../repositories/alert.repository";
import { limitRepository } from "../repositories/limit.repository";
import { propertyRepository } from "../repositories/property.repository";
import { readingRepository } from "../repositories/reading.repository";
import { CreateReadingInput } from "../schemas/reading.schemas";
import { getDateRangeByPeriod } from "../utils/date-range";
import { evaluateConsumptionSignal } from "../utils/anomaly";
import { toNumber } from "../utils/number";

export const readingService = {
  async ingest(userId: string, meterId: string, input: CreateReadingInput) {
    const meter = await propertyRepository.findAccessibleMeter(userId, meterId);

    if (!meter) {
      throw new Error("Hidrometro nao encontrado.");
    }

    const recentReadings = await readingRepository.findRecentReadings(meterId, 14);
    const monthlyLimit = await limitRepository.findApplicableLimit(
      meter.propertyId,
      meter.id,
      PeriodType.MONTHLY
    );

    const historicalSeries = recentReadings
      .slice(0, 10)
      .map((reading) => toNumber(reading.measuredLiters))
      .reverse();

    const signal = evaluateConsumptionSignal({
      currentLiters: input.measuredLiters,
      historicalSeries,
      limitLiters: monthlyLimit ? toNumber(monthlyLimit.limitLiters) : undefined,
      warningPercentage: monthlyLimit?.warningPercentage ?? 15,
      criticalPercentage: monthlyLimit?.criticalPercentage ?? 45,
      minimumSampleSize: monthlyLimit?.minimumSampleSize ?? 7
    });

    const reading = await readingRepository.create({
      waterMeterId: meterId,
      measuredLiters: input.measuredLiters,
      meterReading: input.meterReading,
      readingAt: new Date(input.readingAt),
      source: input.source,
      isEstimated: input.isEstimated,
      anomalyScore: signal.anomalyScore
    });

    let generatedAlert: Awaited<ReturnType<typeof alertRepository.createAlertWithNotification>> | null =
      null;

    if (signal.shouldTriggerCritical) {
      generatedAlert = await alertRepository.createAlertWithNotification({
        userId,
        propertyId: meter.propertyId,
        waterMeterId: meterId,
        type: AlertType.LEAK_SUSPECTED,
        severity: AlertSeverity.CRITICAL,
        title: "Possivel vazamento detectado",
        message:
          "Detectamos consumo continuo acima do padrao historico. Recomendamos verificacao imediata.",
        triggerValue: input.measuredLiters,
        baselineValue: signal.baseline,
        thresholdValue: signal.baseline * (1 + (monthlyLimit?.criticalPercentage ?? 45) / 100),
        anomalyScore: signal.anomalyScore,
        metadata: {
          deviationPercentage: signal.deviationPercentage,
          suspectedLeak: true
        }
      });
    } else if (signal.shouldWarn) {
      generatedAlert = await alertRepository.createAlertWithNotification({
        userId,
        propertyId: meter.propertyId,
        waterMeterId: meterId,
        type: AlertType.HIGH_CONSUMPTION,
        severity: AlertSeverity.WARNING,
        title: "Consumo acima do esperado",
        message:
          "O consumo recente ultrapassou o limite moderado configurado para este hidrometro.",
        triggerValue: input.measuredLiters,
        baselineValue: signal.baseline,
        thresholdValue: signal.baseline * (1 + (monthlyLimit?.warningPercentage ?? 15) / 100),
        anomalyScore: signal.anomalyScore,
        metadata: {
          deviationPercentage: signal.deviationPercentage,
          suspectedLeak: false
        }
      });
    }

    return {
      reading,
      signal,
      generatedAlert
    };
  },

  async listByPeriod(userId: string, meterId: string, period: PeriodType) {
    const meter = await propertyRepository.findAccessibleMeter(userId, meterId);

    if (!meter) {
      throw new Error("Hidrometro nao encontrado.");
    }

    const { currentStart, currentEnd } = getDateRangeByPeriod(period);
    const readings = await readingRepository.findByRange(meterId, currentStart, currentEnd);

    const totals = readings.reduce(
      (accumulator, reading) => {
        const value = toNumber(reading.measuredLiters);
        accumulator.total += value;
        accumulator.peak = Math.max(accumulator.peak, value);
        accumulator.min = accumulator.min === 0 ? value : Math.min(accumulator.min, value);
        return accumulator;
      },
      { total: 0, peak: 0, min: 0 }
    );

    return {
      meterId,
      period,
      totalConsumptionLiters: totals.total,
      averageConsumptionLiters: readings.length ? totals.total / readings.length : 0,
      peakConsumptionLiters: totals.peak,
      minimumConsumptionLiters: totals.min,
      readings: readings.map((reading) => ({
        id: reading.id,
        measuredLiters: toNumber(reading.measuredLiters),
        meterReading: toNumber(reading.meterReading),
        readingAt: reading.readingAt,
        anomalyScore: toNumber(reading.anomalyScore)
      }))
    };
  }
};
