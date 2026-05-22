import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardApi.summary,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    retry: false
  });

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: dashboardApi.notifications,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    retry: false
  });
