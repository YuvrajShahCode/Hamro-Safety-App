import { localStore, StorageKeys } from "@/services/api/localStore";
import { ActivityEvent } from "@/types";

export const activityService = {
  async list(): Promise<ActivityEvent[]> {
    const list = (await localStore.getJSON<ActivityEvent[]>(StorageKeys.ACTIVITY)) || [];
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async record(event: Omit<ActivityEvent, "id" | "createdAt">): Promise<ActivityEvent> {
    const list = (await localStore.getJSON<ActivityEvent[]>(StorageKeys.ACTIVITY)) || [];
    const entry: ActivityEvent = {
      ...event,
      id: `activity_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await localStore.setJSON(StorageKeys.ACTIVITY, [entry, ...list]);
    return entry;
  },
};
