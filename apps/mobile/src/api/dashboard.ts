import { appConfig } from "../config/app-config";
import { demoDashboardSummary, demoNotifications } from "../mocks/demo-data";
import { apiRequest } from "./client";

export interface DashboardSummaryResponse {
  propertyId: string;
  propertyName: string;
  meterId?: string;
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  totalConsumptionLiters: number;
  averageConsumptionLiters: number;
  previousPeriodConsumptionLiters: number;
  comparisonPercentage: number;
  trend: "up" | "down" | "stable";
  status: "healthy" | "attention" | "critical";
  message: string;
  smartTip: string;
  activeAlerts: Array<{
    id: string;
    title: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    type: string;
    detectedAt: string;
  }>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardApi = {
  async summary() {
    if (appConfig.demoMode) {
      await wait(200);
      return demoDashboardSummary;
    }

    return apiRequest<DashboardSummaryResponse>("/dashboard/summary?period=MONTHLY");
  },
  async notifications() {
    if (appConfig.demoMode) {
      await wait(200);
      return demoNotifications;
    }

    return apiRequest<
      Array<{
        id: string;
        title: string;
        body: string;
        status: "PENDING" | "SENT" | "READ";
        createdAt: string;
      }>
    >("/notifications");
  }
};
