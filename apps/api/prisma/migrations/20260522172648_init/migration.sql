-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "MeterStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ReadingSource" AS ENUM ('API', 'SENSOR', 'MANUAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('HIGH_CONSUMPTION', 'LEAK_SUSPECTED', 'ANOMALY_DETECTED', 'LIMIT_EXCEEDED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'PUSH', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'READ');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "reference" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_meters" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" "MeterStatus" NOT NULL DEFAULT 'ACTIVE',
    "installedAt" TIMESTAMP(3),
    "calibrationFactor" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "thresholdProfileJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_meters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumption_readings" (
    "id" TEXT NOT NULL,
    "waterMeterId" TEXT NOT NULL,
    "measuredLiters" DECIMAL(12,2) NOT NULL,
    "meterReading" DECIMAL(14,2),
    "readingAt" TIMESTAMP(3) NOT NULL,
    "source" "ReadingSource" NOT NULL DEFAULT 'API',
    "isEstimated" BOOLEAN NOT NULL DEFAULT false,
    "anomalyScore" DECIMAL(8,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumption_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumption_limits" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "waterMeterId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "limitLiters" DECIMAL(12,2) NOT NULL,
    "warningPercentage" INTEGER NOT NULL DEFAULT 15,
    "criticalPercentage" INTEGER NOT NULL DEFAULT 45,
    "minimumSampleSize" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumption_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "waterMeterId" TEXT,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "triggerValue" DECIMAL(12,2),
    "baselineValue" DECIMAL(12,2),
    "thresholdValue" DECIMAL(12,2),
    "anomalyScore" DECIMAL(8,4),
    "metadata" JSONB,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT,
    "alertId" TEXT,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "auth_sessions_userId_expiresAt_idx" ON "auth_sessions"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "properties_userId_createdAt_idx" ON "properties"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "water_meters_serialNumber_key" ON "water_meters"("serialNumber");

-- CreateIndex
CREATE INDEX "water_meters_propertyId_status_idx" ON "water_meters"("propertyId", "status");

-- CreateIndex
CREATE INDEX "consumption_readings_waterMeterId_readingAt_idx" ON "consumption_readings"("waterMeterId", "readingAt" DESC);

-- CreateIndex
CREATE INDEX "consumption_limits_propertyId_periodType_idx" ON "consumption_limits"("propertyId", "periodType");

-- CreateIndex
CREATE UNIQUE INDEX "consumption_limits_propertyId_waterMeterId_periodType_key" ON "consumption_limits"("propertyId", "waterMeterId", "periodType");

-- CreateIndex
CREATE INDEX "alerts_userId_severity_detectedAt_idx" ON "alerts"("userId", "severity", "detectedAt" DESC);

-- CreateIndex
CREATE INDEX "alerts_propertyId_detectedAt_idx" ON "alerts"("propertyId", "detectedAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_userId_status_createdAt_idx" ON "notifications"("userId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_alertId_idx" ON "notifications"("alertId");

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_meters" ADD CONSTRAINT "water_meters_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumption_readings" ADD CONSTRAINT "consumption_readings_waterMeterId_fkey" FOREIGN KEY ("waterMeterId") REFERENCES "water_meters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumption_limits" ADD CONSTRAINT "consumption_limits_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumption_limits" ADD CONSTRAINT "consumption_limits_waterMeterId_fkey" FOREIGN KEY ("waterMeterId") REFERENCES "water_meters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_waterMeterId_fkey" FOREIGN KEY ("waterMeterId") REFERENCES "water_meters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
