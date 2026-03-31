import { prisma } from "../lib/prisma";

export const readingRepository = {
  create(data: {
    waterMeterId: string;
    measuredLiters: number;
    meterReading?: number;
    readingAt: Date;
    source: "API" | "SENSOR" | "MANUAL";
    isEstimated: boolean;
    anomalyScore?: number;
  }) {
    return prisma.consumptionReading.create({
      data: {
        waterMeterId: data.waterMeterId,
        measuredLiters: data.measuredLiters,
        meterReading: data.meterReading,
        readingAt: data.readingAt,
        source: data.source,
        isEstimated: data.isEstimated,
        anomalyScore: data.anomalyScore
      }
    });
  },
  findRecentReadings(waterMeterId: string, limit = 14) {
    return prisma.consumptionReading.findMany({
      where: { waterMeterId },
      orderBy: { readingAt: "desc" },
      take: limit
    });
  },
  findByRange(waterMeterId: string, start: Date, end: Date) {
    return prisma.consumptionReading.findMany({
      where: {
        waterMeterId,
        readingAt: {
          gte: start,
          lte: end
        }
      },
      orderBy: { readingAt: "asc" }
    });
  }
};
