import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/auth-store";

export const useLoginMutation = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user
      });
    }
  });
};
