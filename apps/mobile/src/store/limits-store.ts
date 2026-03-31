import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";

const STORAGE_KEY = "ecoflow-limits";

interface LimitsState {
  monthlyLimitLiters: number;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  setMonthlyLimitLiters: (value: number) => Promise<void>;
}

const readStorage = async () => {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  }

  return AsyncStorage.getItem(STORAGE_KEY);
};

const writeStorage = async (value: number) => {
  const serialized = JSON.stringify({ monthlyLimitLiters: value });

  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(STORAGE_KEY, serialized);
    return;
  }

  await AsyncStorage.setItem(STORAGE_KEY, serialized);
};

export const useLimitsStore = create<LimitsState>((set) => ({
  monthlyLimitLiters: 120,
  hasHydrated: false,
  hydrate: async () => {
    try {
      const raw = await readStorage();

      if (!raw) {
        set({ hasHydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as { monthlyLimitLiters?: number };

      set({
        monthlyLimitLiters: parsed.monthlyLimitLiters ?? 120,
        hasHydrated: true
      });
    } catch {
      set({ hasHydrated: true });
    }
  },
  setMonthlyLimitLiters: async (value) => {
    set({ monthlyLimitLiters: value });
    await writeStorage(value);
  }
}));
