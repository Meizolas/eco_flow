import { AlertSeverity, AlertType, PeriodType, PrismaClient, ReadingSource } from "@prisma/client";
import { hashValue } from "../src/utils/hash";

const prisma = new PrismaClient();

const readings = [52, 66, 60, 85, 74, 95, 82, 78, 88, 92, 81, 76, 84, 90];

async function main() {
  const email = "demo@ecoflow.app";
  const passwordHash = await hashValue("senha12345");

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Helio Nunes Moraes Junior",
      passwordHash
    },
    create: {
      name: "Helio Nunes Moraes Junior",
      email,
      passwordHash
    }
  });

  const property = await prisma.property.upsert({
    where: { id: "demo-property-main" },
    update: {
      name: "Residencia Principal",
      userId: user.id
    },
    create: {
      id: "demo-property-main",
      userId: user.id,
      name: "Residencia Principal",
      city: "Salvador",
      state: "BA"
    }
  });

  const meter = await prisma.waterMeter.upsert({
    where: { serialNumber: "ECOFLOW-DEMO-001" },
    update: {
      propertyId: property.id,
      name: "Hidrometro Principal"
    },
    create: {
      propertyId: property.id,
      name: "Hidrometro Principal",
      serialNumber: "ECOFLOW-DEMO-001",
      installedAt: new Date()
    }
  });

  await prisma.consumptionLimit.upsert({
    where: {
      propertyId_waterMeterId_periodType: {
        propertyId: property.id,
        waterMeterId: meter.id,
        periodType: PeriodType.MONTHLY
      }
    },
    update: {
      limitLiters: 1200,
      warningPercentage: 15,
      criticalPercentage: 45
    },
    create: {
      propertyId: property.id,
      waterMeterId: meter.id,
      createdByUserId: user.id,
      periodType: PeriodType.MONTHLY,
      limitLiters: 1200,
      warningPercentage: 15,
      criticalPercentage: 45
    }
  });

  await prisma.consumptionReading.deleteMany({
    where: { waterMeterId: meter.id, source: ReadingSource.API, isEstimated: true }
  });

  const now = new Date();
  await prisma.consumptionReading.createMany({
    data: readings.map((measuredLiters, index) => ({
      waterMeterId: meter.id,
      measuredLiters,
      meterReading: readings.slice(0, index + 1).reduce((total, value) => total + value, 0),
      readingAt: new Date(now.getTime() - (readings.length - index - 1) * 24 * 60 * 60 * 1000),
      source: ReadingSource.API,
      isEstimated: true
    }))
  });

  const alert = await prisma.alert.create({
    data: {
      userId: user.id,
      propertyId: property.id,
      waterMeterId: meter.id,
      type: AlertType.HIGH_CONSUMPTION,
      severity: AlertSeverity.WARNING,
      title: "Consumo acima da media",
      message: "As ultimas leituras ficaram acima do padrao esperado.",
      triggerValue: 95,
      thresholdValue: 85
    }
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      propertyId: property.id,
      alertId: alert.id,
      title: "Consumo acima da media",
      body: "Revise torneiras, descargas e uso externo nas proximas horas."
    }
  });

  console.log("Seed criado: demo@ecoflow.app / senha12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
