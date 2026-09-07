import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography, radii } from "@/constants/theme";
import { notificationService } from "@/services/notifications/notificationService";
import { AppNotification } from "@/types";

const CATEGORY_LABEL: Record<AppNotification["category"], string> = {
  emergency_alert: "Emergency",
  contact_response: "Contact response",
  checkin_reminder: "Check-in reminder",
  checkin_expiration: "Check-in expired",
  safety_status: "Safety status",
  system: "System",
};

export default function NotificationsScreen() {
  const theme = useAppTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.list().then((list) => {
      setNotifications(list);
      setLoading(false);
    });
  }, []);

  const onOpen = async (notification: AppNotification) => {
    if (!notification.read) {
      await notificationService.markRead(notification.id);
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg, flex: 1 }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.md }}>
          Notifications
        </Text>

        {loading ? (
          <View>
            {[0, 1, 2].map((i) => (
              <Card key={i} style={{ marginBottom: spacing.sm, opacity: 0.5 }}>
                <View style={{ height: 14, width: "60%", backgroundColor: theme.surfaceAlt, borderRadius: radii.sm, marginBottom: 8 }} />
                <View style={{ height: 12, width: "40%", backgroundColor: theme.surfaceAlt, borderRadius: radii.sm }} />
              </Card>
            ))}
          </View>
        ) : notifications.length === 0 ? (
          <Card style={{ alignItems: "center", padding: spacing.xl }}>
            <Text style={{ color: theme.textSecondary }}>No notifications yet</Text>
          </Card>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(n) => n.id}
            renderItem={({ item }) => (
              <Card
                style={{ marginBottom: spacing.sm, borderLeftWidth: item.read ? 0 : 3, borderLeftColor: theme.emergency }}
                onPress={() => onOpen(item)}
                accessibilityLabel={`${item.title}. ${item.read ? "Read" : "Unread"}`}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: "700" }}>
                    {CATEGORY_LABEL[item.category]}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                <Text style={{ color: theme.textPrimary, fontWeight: "700", marginBottom: 2 }}>{item.title}</Text>
                <Text style={{ color: theme.textSecondary }}>{item.body}</Text>
              </Card>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
