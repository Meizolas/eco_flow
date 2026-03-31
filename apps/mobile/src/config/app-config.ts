import Constants from "expo-constants";

interface AppExtraConfig {
  apiUrl?: string;
  demoMode?: boolean;
  demoUserEmail?: string;
  demoUserPassword?: string;
}

const extra = (Constants.expoConfig?.extra as AppExtraConfig | undefined) ?? {};

export const appConfig = {
  apiUrl: extra.apiUrl ?? "http://localhost:3333/api",
  demoMode: extra.demoMode ?? true,
  demoUserEmail: extra.demoUserEmail ?? "admin@gmail.com",
  demoUserPassword: extra.demoUserPassword ?? "senha123"
} as const;
