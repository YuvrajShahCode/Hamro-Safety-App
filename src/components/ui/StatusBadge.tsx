import React from "react";
import { Text, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radii, spacing, typography } from "@/constants/theme";
import { SafetyStatus } from "@/types";

const CONFIG: Record<SafetyStatus, { label: string; icon: string }> = {
  safe: { label: "SAFE", icon: "\u2713" },
  checkin: { label: "CHECK-IN ACTIVE", icon: "\u23F1" },
  emergency: { label: "EMERGENCY ACTIVE", icon: "\u26A0" },
};

export function StatusBadge({ status }: { status: SafetyStatus }) {
  const theme = useAppTheme();
  const { label, icon } = CONFIG[status];

  const bg = status === "safe" ? theme.safeSurface : status === "checkin" ? theme.warnSurface : theme.emergency;
  const fg = status === "emergency" ? "#FFFFFF" : status === "safe" ? theme.safe : theme.warn;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Safety status: ${label}`}
      style={{
        backgroundColor: bg,
        borderRadius: radii.full,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ marginRight: spacing.xs }}>{icon}</Text>
      <Text style={{ color: fg, fontWeight: typography.bodyBold.fontWeight, fontSize: typography.caption.fontSize }}>
        {label}
      </Text>
    </View>
  );
}
