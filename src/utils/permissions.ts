import * as Location from "expo-location";
import { Linking, Platform } from "react-native";

export type PermissionOutcome = "granted" | "denied" | "undetermined";

/**
 * Reusable permission utilities. Request permissions only when a feature
 * actually needs them, and never spam repeated prompts - if a permission
 * was already denied, direct the user to Settings instead of re-prompting.
 *
 * NOTE: expo-notifications is loaded lazily via require() inside a
 * try/catch, not a static import - the package runs a push-token
 * auto-registration side effect the instant it's imported, which throws in
 * Expo Go on Android (SDK 53+). A static `import` here would be hoisted
 * and crash the whole app before any of our own code could run, same as it
 * did in notificationService.ts. This is unaffected in a real dev build.
 */
type NotificationsModule = typeof import("expo-notifications");
let Notifications: NotificationsModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require("expo-notifications") as NotificationsModule;
} catch (err) {
  console.warn(
    "expo-notifications unavailable in this environment (expected in Expo Go on Android since SDK 53+).",
    err
  );
  Notifications = null;
}

export async function getForegroundLocationStatus(): Promise<PermissionOutcome> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status as PermissionOutcome;
}

export async function requestForegroundLocation(): Promise<PermissionOutcome> {
  const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted" && !canAskAgain) {
    return "denied";
  }
  return status as PermissionOutcome;
}

export async function requestBackgroundLocation(): Promise<PermissionOutcome> {
  // Background location is optional and only meaningful once foreground is granted.
  const fg = await getForegroundLocationStatus();
  if (fg !== "granted") return "denied";
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status as PermissionOutcome;
}

export async function requestNotificationPermission(): Promise<PermissionOutcome> {
  if (!Notifications) return "denied";
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === "granted") return "granted";
    if (!existing.canAskAgain) return "denied";
    const { status } = await Notifications.requestPermissionsAsync();
    return status as PermissionOutcome;
  } catch (err) {
    console.warn("expo-notifications: could not check/request notification permission.", err);
    return "denied";
  }
}

export function openAppSettings(): void {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    Linking.openSettings();
  }
}