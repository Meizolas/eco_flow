import { create } from "zustand";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  setSession: (input: { accessToken: string; refreshToken: string; user: SessionUser }) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setSession: ({ accessToken, refreshToken, user }) =>
    set({
      accessToken,
      refreshToken,
      user
    }),
  signOut: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null
    })
}));
