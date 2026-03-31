import { appConfig } from "../config/app-config";
import { demoSession } from "../mocks/demo-data";
import { apiRequest } from "./client";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  async login(input: { email: string; password: string }) {
    if (appConfig.demoMode) {
      await wait(350);

      if (
        input.email.toLowerCase() === appConfig.demoUserEmail.toLowerCase() &&
        input.password === appConfig.demoUserPassword
      ) {
        return demoSession({
          name: "Administrador EcoFlow",
          email: appConfig.demoUserEmail
        });
      }

      throw new Error(
        `Use as credenciais demo: ${appConfig.demoUserEmail} / ${appConfig.demoUserPassword}`
      );
    }

    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  async register(input: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    if (appConfig.demoMode) {
      await wait(350);
      return demoSession({
        name: input.name,
        email: input.email
      });
    }

    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  async forgotPassword(email: string) {
    if (appConfig.demoMode) {
      await wait(250);
      return {
        message: `Modo demo ativo. Use ${appConfig.demoUserEmail} / ${appConfig.demoUserPassword} para entrar.`
      };
    }

    return apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  }
};
