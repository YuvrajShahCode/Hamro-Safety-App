import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";

export default function WelcomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: "space-between" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              backgroundColor: theme.emergency,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800" }}>H</Text>
          </View>
          <Text style={{ color: theme.textPrimary, fontSize: typography.h1.fontSize, fontWeight: typography.h1.fontWeight }}>
            Hamro Safety
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: spacing.sm, textAlign: "center" }}>
            Help, one press away.{"\n"}For you and the people who love you.
          </Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Button label="Create Account" onPress={() => router.push("/(auth)/register")} />
          <Button label="Login" variant="secondary" onPress={() => router.push("/(auth)/login")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
