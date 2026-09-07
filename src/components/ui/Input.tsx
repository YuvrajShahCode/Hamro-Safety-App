import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radii, spacing, typography } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, ...rest }: InputProps) {
  const theme = useAppTheme();
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text
        accessibilityRole="text"
        style={{ color: theme.textSecondary, fontSize: typography.caption.fontSize, marginBottom: spacing.xs }}
      >
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.textSecondary}
        style={{
          borderWidth: 1,
          borderColor: error ? theme.emergency : theme.border,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 4,
          fontSize: typography.body.fontSize,
          color: theme.textPrimary,
          backgroundColor: theme.surface,
          minHeight: 44,
        }}
        {...rest}
      />
      {error ? (
        <Text style={{ color: theme.emergency, fontSize: typography.caption.fontSize, marginTop: spacing.xs }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
