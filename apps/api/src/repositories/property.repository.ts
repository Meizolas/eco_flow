import { prisma } from "../lib/prisma";
import { CreateMeterInput, CreatePropertyInput } from "../schemas/property.schemas";

export const propertyRepository = {
  listByUser(userId: string) {
    return prisma.property.findMany({
      where: { userId },
      include: {
        waterMeters: true
      },
      orderBy: { createdAt: "asc" }
    });
  },
  create(userId: string, input: CreatePropertyInput) {
    return prisma.property.create({
      data: {
        userId,
        name: input.name,
        addressLine: input.addressLine,
        city: input.city,
        state: input.state,
        reference: input.reference
      }
    });
  },
  createMeter(input: CreateMeterInput) {
    return prisma.waterMeter.create({
      data: {
        propertyId: input.propertyId,
        name: input.name,
        serialNumber: input.serialNumber,
        installedAt: input.installedAt ? new Date(input.installedAt) : undefined
      }
    });
  },
  findAccessibleMeter(userId: string, meterId: string) {
    return prisma.waterMeter.findFirst({
      where: {
        id: meterId,
        property: {
          userId
        }
      },
      include: {
        property: true,
        limits: true
      }
    });
  },
  findDefaultProperty(userId: string) {
    return prisma.property.findFirst({
      where: { userId },
      include: {
        waterMeters: {
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "asc" }
    });
  },
  findAccessibleProperty(userId: string, propertyId: string) {
    return prisma.property.findFirst({
      where: {
        id: propertyId,
        userId
      },
      include: {
        waterMeters: {
          orderBy: { createdAt: "asc" }
        }
      }
    });
  }
};
