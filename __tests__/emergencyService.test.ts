import { emergencyService } from "@/services/emergency/emergencyService";
import { contactService } from "@/services/contacts/contactService";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@/services/api/client", () => ({
  apiClient: { post: jest.fn(() => Promise.reject(new Error("no backend"))) },
  toApiError: () => ({ message: "No backend is configured yet." }),
  API_BASE_URL: "",
}));

describe("emergencyService - SOS activation", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("creates an emergency event immediately, even offline", async () => {
    const event = await emergencyService.createEvent();
    expect(event.status).toBe("activating");
    expect(event.id).toBeTruthy();

    const active = await emergencyService.getActiveEvent();
    expect(active?.id).toBe(event.id);
  });

  it("attaches a real location fix and never fabricates coordinates", async () => {
    const event = await emergencyService.createEvent();
    const withLocation = await emergencyService.attachLocation(event.id, {
      latitude: 27.7,
      longitude: 85.3,
      accuracy: 10,
      capturedAt: new Date().toISOString(),
    });
    expect(withLocation?.latitude).toBe(27.7);

    const withoutLocation = await emergencyService.attachLocation(event.id, null);
    expect(withoutLocation?.latitude).toBeNull();
  });

  it("marks contact notifications as failed (never fake success) when no backend is configured", async () => {
    await contactService.add({
      userId: "u1",
      name: "Test Contact",
      phone: "1234567890",
      relationship: "Friend",
      priority: 1,
      isPrimary: true,
    });
    const event = await emergencyService.createEvent();
    const result = await emergencyService.notifyContactsAndSync(event.id);
    expect(result?.contactsNotified.length).toBe(1);
    expect(result?.contactsNotified[0].state).toBe("failed");
    expect(result?.syncedToServer).toBe(false);
  });

  it("cancels an active emergency event", async () => {
    const event = await emergencyService.createEvent();
    const cancelled = await emergencyService.cancel(event.id);
    expect(cancelled?.status).toBe("cancelled");
    const active = await emergencyService.getActiveEvent();
    expect(active).toBeNull();
  });
});
