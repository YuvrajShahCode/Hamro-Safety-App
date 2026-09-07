import { useAuthStore } from "@/store/authStore";

jest.mock("@/services/auth/authService", () => ({
  authService: {
    login: jest.fn(async (payload) => {
      if (payload.identifier === "valid@test.com" && payload.password === "password123") {
        return { success: true, data: { id: "1", fullName: "Test User", phone: "123", email: payload.identifier, createdAt: "" } };
      }
      return { success: false, error: { message: "Invalid credentials" } };
    }),
    register: jest.fn(),
    logout: jest.fn(),
    restoreSession: jest.fn(async () => null),
  },
}));

describe("authStore", () => {
  it("logs in successfully with valid credentials", async () => {
    const ok = await useAuthStore.getState().login({ identifier: "valid@test.com", password: "password123" });
    expect(ok).toBe(true);
    expect(useAuthStore.getState().status).toBe("authenticated");
  });

  it("surfaces an error message on invalid credentials", async () => {
    const ok = await useAuthStore.getState().login({ identifier: "wrong@test.com", password: "bad" });
    expect(ok).toBe(false);
    expect(useAuthStore.getState().error).toBe("Invalid credentials");
  });
});
