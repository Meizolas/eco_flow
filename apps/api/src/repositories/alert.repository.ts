import {
  AlertSeverity,
  AlertType,
  NotificationChannel,
  NotificationStatus,
  Prisma
} from "@prisma/client";
import { prisma } from "../lib/prisma";

export const alertRepository = {
  createAlertWithNotification(input: {
    userId: string;
    propertyId: string;
    waterMeterId?: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    triggerValue?: number;
    baselineValue?: number;
    thresholdValue?: number;
    anomalyScore?: number;
    metadata?: Prisma.InputJsonObject;
  }) {
    return prisma.alert.create({
      data: {
        userId: input.userId,
        propertyId: input.propertyId,
        waterMeterId: input.waterMeterId,
        type: input.type,
        severity: input.severity,
        title: input.title,
        message: input.message,
        triggerValue: input.triggerValue,
        baselineValue: input.baselineValue,
        thresholdValue: input.thresholdValue,
        anomalyScore: input.anomalyScore,
        metadata: input.metadata,
        notifications: {
          create: {
            userId: input.userId,
            propertyId: input.propertyId,
            channel: NotificationChannel.IN_APP,
            status: NotificationStatus.SENT,
            title: input.title,
            body: input.message,
            sentAt: new Date(),
            payload: input.metadata
          }
        }
      },
      include: {
        notifications: true
      }
    });
  },
  listByUser(userId: string) {
    return prisma.alert.findMany({
      where: { userId },
      orderBy: { detectedAt: "desc" },
      take: 50
    });
  },
  listNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  },
  markNotificationAsRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date()
      }
    });
  }
};
