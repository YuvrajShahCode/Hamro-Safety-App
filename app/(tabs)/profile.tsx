import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography, radii } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";

function Row({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: theme.border,
      }}
    >
      <Text style={{ color: theme.textPrimary, fontSize: typography.body.fontSize }}>{label}</Text>
      <Text style={{ color: theme.textSecondary }}>{"\u203A"}</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
          <View style={{ width: 80, height: 80, borderRadius: radii.full, backgroundColor: theme.surfaceAlt, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm }}>
            <Text style={{ fontSize: 28, fontWeight: "700", color: theme.textPrimary }}>
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={{ fontSize: typography.h3.fontSize, fontWeight: typography.h3.fontWeight, color: theme.textPrimary }}>
            {user?.fullName || "Your Name"}
          </Text>
          <Text style={{ color: theme.textSecondary }}>{user?.phone}</Text>
          <Text style={{ color: theme.textSecondary }}>{user?.email}</Text>
        </View>

        <Card style={{ marginBottom: spacing.md }}>
          <Row label="Emergency Contacts" onPress={() => router.push("/(tabs)/contacts")} />
          <Row label="Notifications" onPress={() => router.push("/notifications")} />
          <Row label="Appearance" onPress={() => router.push("/settings/appearance")} />
          <Row label="Privacy Settings" onPress={() => router.push("/settings/privacy")} />
          <Row label="Notification Settings" onPress={() => router.push("/settings/notifications")} />
          <Row label="Location Settings" onPress={() => router.push("/settings/location")} />
          <Row label="Security" onPress={() => router.push("/settings/security")} />
          <Row label="About Hamro Safety" onPress={() => router.push("/settings/about")} />
        </Card>

        <Card>
          <Pressable onPress={() => logout().then(() => router.replace("/(auth)/welcome"))} accessibilityRole="button">
            <Text style={{ color: theme.emergency, fontWeight: "700", textAlign: "center", paddingVertical: spacing.sm }}>
              Logout
            </Text>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
