import React from "react";
import { ActivityIndicator, Pressable, Text, ViewStyle } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radii, spacing, typography, MIN_TOUCH_TARGET } from "@/constants/theme";

type Variant = "primary" | "emergency" | "secondary" | "ghost";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: ViewStyle;
}

/** Reusable, accessible button used across the whole app for design consistency. */
export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  accessibilityHint,
  style,
}: ButtonProps) {
  const theme = useAppTheme();

  const backgroundColor =
    variant === "primary"
      ? theme.textPrimary
      : variant === "emergency"
      ? theme.emergency
      : variant === "secondary"
      ? theme.surfaceAlt
      : "transparent";

  const textColor =
    variant === "ghost" ? theme.textPrimary : variant === "secondary" ? theme.textPrimary : "#FFFFFF";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        {
          backgroundColor,
          borderRadius: radii.md,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          minHeight: MIN_TOUCH_TARGET,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontSize: typography.button.fontSize, fontWeight: typography.button.fontWeight }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
