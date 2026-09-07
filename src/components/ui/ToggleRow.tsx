import React from "react";
import { Switch, Text, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing } from "@/constants/theme";

export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm }}>
      <View style={{ flex: 1, marginRight: spacing.md }}>
        <Text style={{ color: theme.textPrimary, fontWeight: "600" }}>{label}</Text>
        {description ? <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.emergency, false: theme.border }}
        accessibilityLabel={label}
      />
    </View>
  );
}
