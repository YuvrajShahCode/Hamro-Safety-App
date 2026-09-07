import React, { PropsWithChildren } from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radii, spacing } from "@/constants/theme";

interface CardProps {
  style?: ViewStyle;
  /** If provided, the card becomes an accessible, pressable element. */
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function Card({ children, style, onPress, accessibilityLabel }: PropsWithChildren<CardProps>) {
  const theme = useAppTheme();
  const cardStyle = [
    {
      backgroundColor: theme.surface,
      borderRadius: radii.lg,
      padding: spacing.md,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [...cardStyle, { opacity: pressed ? 0.85 : 1 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
