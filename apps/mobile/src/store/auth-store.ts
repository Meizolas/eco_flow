import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  profilePhotoUri: string | null;
  deviceName: string;
  setSession: (input: { accessToken: string; refreshToken: string; user: SessionUser }) => void;
  updateUser: (input: Partial<SessionUser>) => void;
  setProfilePhotoUri: (uri: string | null) => void;
  setDeviceName: (name: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      profilePhotoUri: null,
      deviceName: "Hidrometro Principal",
      setSession: ({ accessToken, refreshToken, user }) =>
        set({
          accessToken,
          refreshToken,
          user
        }),
      updateUser: (input) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...input } : state.user
        })),
      setProfilePhotoUri: (profilePhotoUri) => set({ profilePhotoUri }),
      setDeviceName: (deviceName) => set({ deviceName }),
      signOut: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null
        })
    }),
    {
      name: "ecoflow-auth",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
