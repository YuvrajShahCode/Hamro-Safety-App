import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";

export default function AboutScreen() {
  const theme = useAppTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.md }}>
          About Hamro Safety
        </Text>
        <Text style={{ color: theme.textSecondary, marginBottom: spacing.sm }}>Version 1.0.0</Text>
        <Text style={{ color: theme.textSecondary }}>
          Hamro Safety helps you request help quickly during an emergency and lets your trusted contacts respond. This app is a foundation intended to be connected to a real backend, SMS provider, and push notification service before production use.
        </Text>
      </View>
    </SafeAreaView>
  );
}
