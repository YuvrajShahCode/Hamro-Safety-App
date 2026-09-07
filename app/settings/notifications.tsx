import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { useSettingsStore } from "@/store/settingsStore";

export default function NotificationSettingsScreen() {
  const theme = useAppTheme();
  const s = useSettingsStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.lg }}>
          Notifications
        </Text>
        <Card>
          <ToggleRow label="Push notifications" value={s.pushNotificationsEnabled} onValueChange={() => s.toggle("pushNotificationsEnabled")} />
          <ToggleRow label="Emergency notifications" description="Cannot be disabled during an active SOS" value={s.emergencyNotificationsEnabled} onValueChange={() => s.toggle("emergencyNotificationsEnabled")} />
          <ToggleRow label="Check-in reminders" value={s.checkinRemindersEnabled} onValueChange={() => s.toggle("checkinRemindersEnabled")} />
        </Card>
      </View>
    </SafeAreaView>
  );
}
