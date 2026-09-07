import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SOSButton } from "@/components/sos/SOSButton";
import { Button } from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography, radii } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";
import { useEmergencyStore } from "@/store/emergencyStore";
import { useCheckInStore } from "@/store/checkinStore";
import { useContactsStore } from "@/store/contactsStore";
import { notificationService } from "@/services/notifications/notificationService";

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { safetyStatus, activateSOS, loadActiveEvent } = useEmergencyStore();
  const { activeCheckIn, load: loadCheckIn } = useCheckInStore();
  const { contacts, load: loadContacts } = useContactsStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadActiveEvent();
    loadCheckIn();
    loadContacts();
    notificationService.list().then((list) => setUnreadCount(list.filter((n) => !n.read).length));
  }, []);

  const handleActivate = async () => {
    await activateSOS();
    router.push("/emergency/active");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 44, height: 44, borderRadius: radii.full, backgroundColor: theme.surfaceAlt,
                alignItems: "center", justifyContent: "center", marginRight: spacing.sm,
              }}
            >
              <Text style={{ fontWeight: "700", color: theme.textPrimary }}>
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View>
              <Text style={{ color: theme.textPrimary, fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight }}>
                Hello, {user?.fullName?.split(" ")[0] || "there"}
              </Text>
              <View style={{ marginTop: spacing.xs }}>
                <StatusBadge status={safetyStatus} />
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/notifications")}
            accessibilityRole="button"
            accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontSize: 22 }}>{"\u{1F514}"}</Text>
            {unreadCount > 0 ? (
              <View
                style={{
                  position: "absolute", top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8,
                  backgroundColor: theme.emergency, alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {contacts.length === 0 ? (
          <Card style={{ marginBottom: spacing.lg, backgroundColor: theme.warnSurface }}>
            <Text style={{ color: theme.textPrimary, fontWeight: "600", marginBottom: spacing.xs }}>
              Add an emergency contact
            </Text>
            <Text style={{ color: theme.textSecondary, marginBottom: spacing.sm }}>
              You haven't added anyone to notify during an SOS yet.
            </Text>
            <Button label="Add Emergency Contact" variant="secondary" onPress={() => router.push("/contacts/add")} />
          </Card>
        ) : null}

        <Card style={{ alignItems: "center", paddingVertical: spacing.xl, marginBottom: spacing.lg }}>
          <SOSButton onActivate={handleActivate} />
        </Card>

        {activeCheckIn ? (
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={{ color: theme.textPrimary, fontWeight: "600", marginBottom: spacing.xs }}>Active check-in</Text>
            <Text style={{ color: theme.textSecondary }}>Heading to {activeCheckIn.destination}</Text>
            <Button label="View Check-in" variant="ghost" onPress={() => router.push("/checkin")} style={{ marginTop: spacing.sm }} />
          </Card>
        ) : (
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={{ color: theme.textPrimary, fontWeight: "600", marginBottom: spacing.xs }}>Going somewhere?</Text>
            <Text style={{ color: theme.textSecondary, marginBottom: spacing.sm }}>
              Start a safety check-in so we can look out for you.
            </Text>
            <Button label="Start Check-in" variant="secondary" onPress={() => router.push("/checkin")} />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
