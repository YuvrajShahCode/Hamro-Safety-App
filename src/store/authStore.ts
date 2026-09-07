import { create } from "zustand";
import { User } from "@/types";
import { authService, LoginPayload, RegisterPayload } from "@/services/auth/authService";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  restoreSession: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  error: null,

  restoreSession: async () => {
    set({ status: "loading" });
    const user = await authService.restoreSession();
    set({ user, status: user ? "authenticated" : "unauthenticated" });
  },

  login: async (payload) => {
    set({ status: "loading", error: null });
    const result = await authService.login(payload);
    if (result.success) {
      set({ user: result.data, status: "authenticated" });
      return true;
    }
    set({ status: "unauthenticated", error: result.error.message });
    return false;
  },

  register: async (payload) => {
    set({ status: "loading", error: null });
    const result = await authService.register(payload);
    if (result.success) {
      set({ user: result.data, status: "authenticated" });
      return true;
    }
    set({ status: "unauthenticated", error: result.error.message });
    return false;
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, status: "unauthenticated" });
  },

  clearError: () => set({ error: null }),
}));
