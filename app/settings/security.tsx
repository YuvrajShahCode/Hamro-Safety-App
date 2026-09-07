import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ToggleRow } from "@/components/ui/ToggleRow";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";

export default function SecuritySettingsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const s = useSettingsStore();
  const logout = useAuthStore((st) => st.logout);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.lg }}>
          Security
        </Text>
        <Card style={{ marginBottom: spacing.md }}>
          <ToggleRow label="Biometric lock" description="Require Face ID / fingerprint to open the app" value={s.biometricLockEnabled} onValueChange={() => s.toggle("biometricLockEnabled")} />
        </Card>
        <Card style={{ marginBottom: spacing.md }}>
          <Button label="Change Password" variant="secondary" onPress={() => router.push("/(auth)/forgot-password")} />
        </Card>
        <Card>
          <Button
            label="Logout of All Devices"
            variant="ghost"
            onPress={async () => { await logout(); router.replace("/(auth)/welcome"); }}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}
