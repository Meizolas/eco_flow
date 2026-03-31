export const PERIOD_TYPES = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;
export type PeriodType = (typeof PERIOD_TYPES)[number];

export const ALERT_SEVERITIES = ["INFO", "WARNING", "CRITICAL"] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export interface DashboardSummary {
  propertyId: string;
  period: PeriodType;
  totalConsumptionLiters: number;
  averageConsumptionLiters: number;
  previousPeriodConsumptionLiters: number;
  comparisonPercentage: number;
  trend: "up" | "down" | "stable";
  status: "healthy" | "attention" | "critical";
  message: string;
}
