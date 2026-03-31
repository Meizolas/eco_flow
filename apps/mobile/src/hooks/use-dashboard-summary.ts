import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardApi.summary,
    retry: false
  });

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: dashboardApi.notifications,
    retry: false
  });
