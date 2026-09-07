import Constants from "expo-constants";
import { Platform } from "react-native";
import { AppNotification, NotificationCategory, ServiceResult } from "@/types";
import { localStore, StorageKeys } from "@/services/api/localStore";
import { requestNotificationPermission } from "@/utils/permissions";

/**
 * As of Expo SDK 53+, Expo Go on Android throws (or returns null) the
 * moment expo-notifications is loaded at all - not just when you call a
 * specific function. A static `import` can't be caught (it's hoisted and
 * evaluated before any of our own code runs), so we load it lazily via
 * require() inside a try/catch instead. This is unaffected in a real
 * development/production build.
 */
type NotificationsModule = typeof import("expo-notifications");
let Notifications: NotificationsModule | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loaded = require("expo-notifications") as NotificationsModule | null;
  if (loaded) {
    Notifications = loaded;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (err) {
  console.warn(
    "expo-notifications unavailable in this environment (expected in Expo Go on Android since SDK 53+). Notification features are disabled until you run a development build.",
    err
  );
  Notifications = null;
}

const NOT_AVAILABLE_ERROR = {
  message:
    "Notifications aren't available in Expo Go on this platform. Use a development build to enable them.",
  code: "NOTIFICATIONS_UNAVAILABLE",
} as const;

/**
 * Reusable notification service - screens should never build notification
 * logic themselves. Push delivery to OTHER devices (e.g. a contact's phone)
 * requires a real backend + FCM/APNs project; this layer only handles local
 * scheduling and device push-token registration until that's configured.
 * Every function degrades gracefully to a failure result if the native
 * module couldn't load at all (see guard above).
 */
export const notificationService = {
  async registerForPush(): Promise<ServiceResult<string>> {
    if (!Notifications) {
      return { success: false, error: NOT_AVAILABLE_ERROR };
    }
    if (!Constants.isDevice) {
      return {
        success: false,
        error: { message: "Push notifications require a physical device.", code: "SIMULATOR_UNSUPPORTED" },
      };
    }
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error: { message: "Notification permission was not granted.", code: "NOTIFICATION_PERMISSION_DENIED" },
      };
    }
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        return {
          success: false,
          error: {
            message:
              "Push notifications require an EAS project ID / FCM configuration. See README Firebase Configuration.",
            code: "PUSH_NOT_CONFIGURED",
          },
        };
      }
      const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("emergency", {
          name: "Emergency Alerts",
          importance: Notifications.AndroidImportance.MAX,
          sound: "default",
        });
      }
      return { success: true, data: tokenResponse.data };
    } catch (err) {
      return {
        success: false,
        error: { message: "Could not register for push notifications.", code: "PUSH_REGISTRATION_FAILED" },
      };
    }
  },

  async scheduleLocal(title: string, body: string, secondsFromNow = 0): Promise<void> {
    if (!Notifications) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger:
          secondsFromNow > 0
            ? {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: secondsFromNow,
                repeats: false,
              }
            : null,
      });
    } catch (err) {
      console.warn("expo-notifications: could not schedule local notification.", err);
    }
  },

  async record(notification: Omit<AppNotification, "id" | "createdAt" | "read">): Promise<AppNotification> {
    const list = (await localStore.getJSON<AppNotification[]>(StorageKeys.NOTIFICATIONS)) || [];
    const entry: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    await localStore.setJSON(StorageKeys.NOTIFICATIONS, [entry, ...list]);
    return entry;
  },

  async list(): Promise<AppNotification[]> {
    return (await localStore.getJSON<AppNotification[]>(StorageKeys.NOTIFICATIONS)) || [];
  },

  async markRead(id: string): Promise<void> {
    const list = (await localStore.getJSON<AppNotification[]>(StorageKeys.NOTIFICATIONS)) || [];
    await localStore.setJSON(
      StorageKeys.NOTIFICATIONS,
      list.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  },
};

export type { NotificationCategory };