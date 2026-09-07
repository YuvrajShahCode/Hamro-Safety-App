import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { useSettingsStore } from "@/store/settingsStore";

export default function PrivacySettingsScreen() {
  const theme = useAppTheme();
  const s = useSettingsStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.lg }}>
          Privacy
        </Text>
        <Card>
          <ToggleRow label="Location sharing" description="Share your location with trusted contacts during emergencies" value={s.locationSharingEnabled} onValueChange={() => s.toggle("locationSharingEnabled")} />
        </Card>
        <Text style={{ color: theme.textSecondary, marginTop: spacing.md, fontSize: 13 }}>
          Hamro Safety minimizes collection of sensitive data and does not log emergency details beyond what's required to operate the SOS feature.
        </Text>
      </View>
    </SafeAreaView>
  );
}
