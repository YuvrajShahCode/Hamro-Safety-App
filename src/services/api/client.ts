import axios, { AxiosError, AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { ApiError } from "@/types";

/**
 * API_BASE_URL must be configured via environment variable before this app
 * can talk to a real backend. Until then, requests will fail fast with a
 * clear error rather than silently pretending to succeed.
 *
 * Configure via app.config.js / eas.json / .env (see README "Backend
 * Configuration").
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "";

const AUTH_TOKEN_KEY = "hamro_safety_auth_token";

export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async set(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  },
};

function createClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
  });

  instance.interceptors.request.use(async (config) => {
    const token = await tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

export const apiClient = createClient();

/** Converts any thrown error into a user-safe ApiError. Never leaks stack traces. */
export function toApiError(err: unknown): ApiError {
  if (!API_BASE_URL) {
    return {
      message:
        "No backend is configured yet. Set API_BASE_URL to connect Hamro Safety to a real server.",
      code: "NO_BACKEND_CONFIGURED",
    };
  }
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (!axiosErr.response) {
      return {
        message: "Network error - please check your connection and try again.",
        code: "NETWORK_ERROR",
      };
    }
    return {
      message:
        axiosErr.response.data?.message ||
        "Something went wrong. Please try again.",
      status: axiosErr.response.status,
      code: "API_ERROR",
    };
  }
  return { message: "An unexpected error occurred. Please try again." };
}
