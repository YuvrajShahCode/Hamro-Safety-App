import { localStore, StorageKeys } from "@/services/api/localStore";
import { notificationService } from "@/services/notifications/notificationService";
import { SafetyCheckIn, ServiceResult } from "@/types";

async function getCheckIns(): Promise<SafetyCheckIn[]> {
  return (await localStore.getJSON<SafetyCheckIn[]>(StorageKeys.CHECKINS)) || [];
}
async function saveCheckIns(list: SafetyCheckIn[]): Promise<void> {
  await localStore.setJSON(StorageKeys.CHECKINS, list);
}

export const checkInService = {
  async getActive(): Promise<SafetyCheckIn | null> {
    const list = await getCheckIns();
    return list.find((c) => c.status === "active") || null;
  },

  async list(): Promise<SafetyCheckIn[]> {
    return getCheckIns();
  },

  async create(input: {
    destination: string;
    expectedArrivalAt: string;
    notifyContactIds: string[];
  }): Promise<ServiceResult<SafetyCheckIn>> {
    const list = await getCheckIns();
    if (list.some((c) => c.status === "active")) {
      return { success: false, error: { message: "You already have an active check-in.", code: "CHECKIN_ALREADY_ACTIVE" } };
    }
    const entry: SafetyCheckIn = {
      id: `checkin_${Date.now()}`,
      userId: "current_user",
      destination: input.destination,
      expectedArrivalAt: input.expectedArrivalAt,
      notifyContactIds: input.notifyContactIds,
      status: "active",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    await saveCheckIns([entry, ...list]);
    await notificationService.scheduleLocal(
      "Check-in reminder",
      `Reminder: let us know you're safe at ${input.destination}.`,
      Math.max(0, (new Date(input.expectedArrivalAt).getTime() - Date.now()) / 1000)
    );
    return { success: true, data: entry };
  },

  async complete(id: string): Promise<ServiceResult<SafetyCheckIn>> {
    const list = await getCheckIns();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, error: { message: "Check-in not found.", code: "NOT_FOUND" } };
    list[idx] = { ...list[idx], status: "completed", completedAt: new Date().toISOString() };
    await saveCheckIns(list);
    return { success: true, data: list[idx] };
  },

  async cancel(id: string): Promise<ServiceResult<SafetyCheckIn>> {
    const list = await getCheckIns();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, error: { message: "Check-in not found.", code: "NOT_FOUND" } };
    list[idx] = { ...list[idx], status: "cancelled" };
    await saveCheckIns(list);
    return { success: true, data: list[idx] };
  },

  /**
   * Should be invoked by a background task / app-foreground check. If the
   * expected arrival time has passed without completion, mark expired and
   * trigger the same emergency workflow as a manual SOS.
   */
  async expireOverdue(): Promise<SafetyCheckIn[]> {
    const list = await getCheckIns();
    const now = Date.now();
    const updated = list.map((c) =>
      c.status === "active" && new Date(c.expectedArrivalAt).getTime() < now
        ? { ...c, status: "expired" as const }
        : c
    );
    await saveCheckIns(updated);
    return updated.filter((c) => c.status === "expired");
  },
};
