import AsyncStorage from "@react-native-async-storage/async-storage";

/** Thin typed wrapper over AsyncStorage for local persistence of domain data. */
export const localStore = {
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async setJSON<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

export const StorageKeys = {
  EMERGENCY_EVENTS: "hamro:emergency_events",
  RETRY_QUEUE: "hamro:retry_queue",
  CONTACTS: "hamro:contacts",
  CHECKINS: "hamro:checkins",
  ACTIVITY: "hamro:activity",
  NOTIFICATIONS: "hamro:notifications",
  CURRENT_USER: "hamro:current_user",
};
