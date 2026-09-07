import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography, radii } from "@/constants/theme";
import { useSettingsStore, ThemePreference } from "@/store/settingsStore";

const OPTIONS: { value: ThemePreference; label: string; description: string }[] = [
  { value: "light", label: "Light", description: "Always use light mode" },
  { value: "dark", label: "Dark", description: "Always use dark mode" },
  { value: "system", label: "System", description: "Match your device setting" },
];

export default function AppearanceSettingsScreen() {
  const theme = useAppTheme();
  const { themePreference, setThemePreference } = useSettingsStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.lg }}>
          Appearance
        </Text>
        <Card>
          {OPTIONS.map((opt, i) => (
            <Pressable
              key={opt.value}
              onPress={() => setThemePreference(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: themePreference === opt.value }}
              accessibilityLabel={`${opt.label}. ${opt.description}`}
              style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                paddingVertical: spacing.md,
                borderBottomWidth: i < OPTIONS.length - 1 ? 1 : 0,
                borderBottomColor: theme.border,
              }}
            >
              <View>
                <Text style={{ color: theme.textPrimary, fontWeight: "600" }}>{opt.label}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{opt.description}</Text>
              </View>
              <View
                style={{
                  width: 22, height: 22, borderRadius: radii.full, borderWidth: 2,
                  borderColor: themePreference === opt.value ? theme.emergency : theme.border,
                  alignItems: "center", justifyContent: "center",
                }}
              >
                {themePreference === opt.value ? (
                  <View style={{ width: 12, height: 12, borderRadius: radii.full, backgroundColor: theme.emergency }} />
                ) : null}
              </View>
            </Pressable>
          ))}
        </Card>
      </View>
    </SafeAreaView>
  );
}
