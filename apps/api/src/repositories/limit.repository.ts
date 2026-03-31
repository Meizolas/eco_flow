import { prisma } from "../lib/prisma";
import { UpsertLimitInput } from "../schemas/limit.schemas";

export const limitRepository = {
  listByProperty(propertyId: string) {
    return prisma.consumptionLimit.findMany({
      where: { propertyId },
      orderBy: { updatedAt: "desc" }
    });
  },
  findApplicableLimit(
    propertyId: string,
    waterMeterId: string | undefined,
    periodType: UpsertLimitInput["periodType"]
  ) {
    return prisma.consumptionLimit.findFirst({
      where: {
        propertyId,
        periodType,
        OR: [{ waterMeterId }, { waterMeterId: null }]
      },
      orderBy: [{ waterMeterId: "desc" }, { updatedAt: "desc" }]
    });
  },
  upsert(createdByUserId: string, input: UpsertLimitInput) {
    return prisma.consumptionLimit.upsert({
      where: {
        propertyId_waterMeterId_periodType: {
          propertyId: input.propertyId,
          waterMeterId: input.waterMeterId ?? null,
          periodType: input.periodType
        }
      },
      create: {
        createdByUserId,
        ...input
      },
      update: {
        limitLiters: input.limitLiters,
        warningPercentage: input.warningPercentage,
        criticalPercentage: input.criticalPercentage,
        minimumSampleSize: input.minimumSampleSize
      }
    });
  }
};
