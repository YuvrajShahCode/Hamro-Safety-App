import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";

interface SettingsState {
  themePreference: ThemePreference;
  pushNotificationsEnabled: boolean;
  emergencyNotificationsEnabled: boolean;
  checkinRemindersEnabled: boolean;
  locationSharingEnabled: boolean;
  biometricLockEnabled: boolean;
  setThemePreference: (pref: ThemePreference) => void;
  toggle: (key: keyof Omit<SettingsState, "themePreference" | "setThemePreference" | "toggle">) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themePreference: "system",
  pushNotificationsEnabled: true,
  emergencyNotificationsEnabled: true,
  checkinRemindersEnabled: true,
  locationSharingEnabled: true,
  biometricLockEnabled: false,

  setThemePreference: (pref) => set({ themePreference: pref }),
  toggle: (key) => set((s) => ({ [key]: !s[key] } as Partial<SettingsState>)),
}));
