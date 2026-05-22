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
  async upsert(createdByUserId: string, input: UpsertLimitInput) {
    const existingLimit = await prisma.consumptionLimit.findFirst({
      where: {
        propertyId: input.propertyId,
        waterMeterId: input.waterMeterId ?? null,
        periodType: input.periodType
      }
    });

    if (existingLimit) {
      return prisma.consumptionLimit.update({
        where: {
          id: existingLimit.id
        },
        data: {
          limitLiters: input.limitLiters,
          warningPercentage: input.warningPercentage,
          criticalPercentage: input.criticalPercentage,
          minimumSampleSize: input.minimumSampleSize
        }
      });
    }

    return prisma.consumptionLimit.create({
      data: {
        createdByUserId,
        propertyId: input.propertyId,
        waterMeterId: input.waterMeterId,
        periodType: input.periodType,
        limitLiters: input.limitLiters,
        warningPercentage: input.warningPercentage,
        criticalPercentage: input.criticalPercentage,
        minimumSampleSize: input.minimumSampleSize
      }
    });
  }
};
