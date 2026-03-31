import { appConfig } from "../config/app-config";
import type { AuthResponse } from "../api/auth";
import type { DashboardSummaryResponse } from "../api/dashboard";

export const demoSession = (overrides?: Partial<AuthResponse["user"]>): AuthResponse => ({
  accessToken: "demo-access-token",
  refreshToken: "demo-refresh-token",
  user: {
    id: "demo-user-1",
    name: overrides?.name ?? "Administrador EcoFlow",
    email: overrides?.email ?? appConfig.demoUserEmail
  }
});

export const demoDashboardSummary: DashboardSummaryResponse = {
  propertyId: "demo-property-1",
  propertyName: "Residencia Principal",
  meterId: "demo-meter-1",
  period: "MONTHLY",
  totalConsumptionLiters: 120,
  averageConsumptionLiters: 100,
  previousPeriodConsumptionLiters: 96,
  comparisonPercentage: 25,
  trend: "up",
  status: "attention",
  message: "Consumo em zona de atencao",
  smartTip:
    "Voce esta consumindo mais agua do que o padrao recente. Vale revisar descargas, torneiras externas e horarios de maior uso.",
  activeAlerts: [
    {
      id: "demo-alert-1",
      title: "Consumo acima da media",
      severity: "WARNING",
      type: "HIGH_CONSUMPTION",
      detectedAt: new Date().toISOString()
    }
  ]
};

export const demoNotifications = [
  {
    id: "demo-notification-1",
    title: "Aviso",
    body: "Consumo acima da media nas ultimas 24 horas.",
    status: "SENT" as const,
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-notification-2",
    title: "Alerta critico",
    body: "Possivel vazamento detectado. Verifique agora.",
    status: "SENT" as const,
    createdAt: new Date().toISOString()
  }
];
