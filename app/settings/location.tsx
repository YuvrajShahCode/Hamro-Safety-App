import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { getForegroundLocationStatus, openAppSettings, requestForegroundLocation, requestBackgroundLocation } from "@/utils/permissions";

export default function LocationSettingsScreen() {
  const theme = useAppTheme();
  const [foreground, setForeground] = useState<string>("undetermined");

  useEffect(() => {
    getForegroundLocationStatus().then(setForeground);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.lg }}>
          Location
        </Text>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontWeight: "600", marginBottom: spacing.xs }}>Foreground location</Text>
          <Text style={{ color: theme.textSecondary, marginBottom: spacing.sm }}>Status: {foreground}</Text>
          {foreground !== "granted" ? (
            <Button
              label="Grant Access"
              onPress={async () => setForeground(await requestForegroundLocation())}
            />
          ) : (
            <Button label="Open Device Settings" variant="secondary" onPress={openAppSettings} />
          )}
        </Card>
        <Card>
          <Text style={{ fontWeight: "600", marginBottom: spacing.xs }}>Background location</Text>
          <Text style={{ color: theme.textSecondary, marginBottom: spacing.sm }}>
            Lets Hamro Safety keep sharing your location during an emergency even when the app isn't open (platform support varies).
          </Text>
          <Button label="Enable Background Location" variant="secondary" onPress={requestBackgroundLocation} />
        </Card>
      </View>
    </SafeAreaView>
  );
}
