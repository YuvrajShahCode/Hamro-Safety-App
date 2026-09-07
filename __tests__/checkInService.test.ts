import { checkInService } from "@/services/checkin/checkInService";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

describe("checkInService", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("creates a check-in and prevents a second concurrent one", async () => {
    const first = await checkInService.create({
      destination: "Home", expectedArrivalAt: new Date(Date.now() + 60000).toISOString(), notifyContactIds: [],
    });
    expect(first.success).toBe(true);

    const second = await checkInService.create({
      destination: "Office", expectedArrivalAt: new Date(Date.now() + 60000).toISOString(), notifyContactIds: [],
    });
    expect(second.success).toBe(false);
  });

  it("completes an active check-in", async () => {
    const created = await checkInService.create({
      destination: "Home", expectedArrivalAt: new Date(Date.now() + 60000).toISOString(), notifyContactIds: [],
    });
    if (!created.success) throw new Error("setup failed");
    await checkInService.complete(created.data.id);
    const active = await checkInService.getActive();
    expect(active).toBeNull();
  });

  it("expires an overdue check-in", async () => {
    const created = await checkInService.create({
      destination: "Home", expectedArrivalAt: new Date(Date.now() - 1000).toISOString(), notifyContactIds: [],
    });
    if (!created.success) throw new Error("setup failed");
    const expired = await checkInService.expireOverdue();
    expect(expired.some((c) => c.id === created.data.id)).toBe(true);
  });
});
