import { apiClient, tokenStorage, toApiError, API_BASE_URL } from "@/services/api/client";
import { localStore, StorageKeys } from "@/services/api/localStore";
import { ServiceResult, User } from "@/types";

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  identifier: string; // phone or email
  password: string;
}

/**
 * ============================================================================
 * DEV-ONLY LOCAL AUTH FALLBACK - remove before shipping to real users.
 * ============================================================================
 * When no backend is configured (EXPO_PUBLIC_API_BASE_URL unset), register/
 * login create a LOCAL-ONLY fake account instead of failing, purely so you
 * can click through onboarding/Home/SOS/contacts while developing the UI.
 * This does NOT verify any credentials and is NOT secure - it exists only to
 * unblock local testing without a backend. Once you set
 * EXPO_PUBLIC_API_BASE_URL, this path is skipped entirely and the app goes
 * back to requiring a real server response, as originally designed.
 */
const DEV_FALLBACK_ENABLED = !API_BASE_URL;

async function devFallbackAuth(seed: { fullName?: string; email?: string; phone?: string }): Promise<User> {
  console.warn(
    "[DEV MODE] No backend configured - creating a local-only test account. " +
      "This is NOT a real account and will not sync anywhere. Set EXPO_PUBLIC_API_BASE_URL to disable this."
  );
  const existing = await localStore.getJSON<User>(StorageKeys.CURRENT_USER);
  const user: User = existing ?? {
    id: "dev_local_user",
    fullName: seed.fullName || "Test User",
    phone: seed.phone || "0000000000",
    email: seed.email || "test@example.com",
    createdAt: new Date().toISOString(),
  };
  await tokenStorage.set("dev-local-token");
  await localStore.setJSON(StorageKeys.CURRENT_USER, user);
  return user;
}
/** ======================= end dev-only fallback ======================= */

/**
 * Auth API layer. All calls require API_BASE_URL to be configured - see
 * README "Backend Configuration". Until a real backend exists, these calls
 * fall back to the dev-only local account above (or, with that removed,
 * would fail with a clear NO_BACKEND_CONFIGURED error) rather than silently
 * pretending a real server accepted the request.
 */
export const authService = {
  async register(payload: RegisterPayload): Promise<ServiceResult<User>> {
    if (!API_BASE_URL) {
      if (DEV_FALLBACK_ENABLED) {
        const user = await devFallbackAuth(payload);
        return { success: true, data: user };
      }
      return { success: false, error: { message: "No backend is configured yet.", code: "NO_BACKEND_CONFIGURED" } };
    }
    try {
      const res = await apiClient.post("/auth/register", payload);
      const { token, user } = res.data;
      await tokenStorage.set(token);
      await localStore.setJSON(StorageKeys.CURRENT_USER, user);
      return { success: true, data: user };
    } catch (err) {
      return { success: false, error: toApiError(err) };
    }
  },

  async login(payload: LoginPayload): Promise<ServiceResult<User>> {
    if (!API_BASE_URL) {
      if (DEV_FALLBACK_ENABLED) {
        const user = await devFallbackAuth({ email: payload.identifier });
        return { success: true, data: user };
      }
      return { success: false, error: { message: "No backend is configured yet.", code: "NO_BACKEND_CONFIGURED" } };
    }
    try {
      const res = await apiClient.post("/auth/login", payload);
      const { token, user } = res.data;
      await tokenStorage.set(token);
      await localStore.setJSON(StorageKeys.CURRENT_USER, user);
      return { success: true, data: user };
    } catch (err) {
      return { success: false, error: toApiError(err) };
    }
  },

  async requestPasswordReset(identifier: string): Promise<ServiceResult<null>> {
    if (!API_BASE_URL) {
      return { success: false, error: { message: "No backend is configured yet.", code: "NO_BACKEND_CONFIGURED" } };
    }
    try {
      await apiClient.post("/auth/forgot-password", { identifier });
      return { success: true, data: null };
    } catch (err) {
      return { success: false, error: toApiError(err) };
    }
  },

  async logout(): Promise<void> {
    await tokenStorage.clear();
    await localStore.remove(StorageKeys.CURRENT_USER);
  },

  async restoreSession(): Promise<User | null> {
    const token = await tokenStorage.get();
    if (!token) return null;
    return localStore.getJSON<User>(StorageKeys.CURRENT_USER);
  },
};