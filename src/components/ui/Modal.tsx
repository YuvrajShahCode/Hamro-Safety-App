import React, { PropsWithChildren } from "react";
import { Modal as RNModal, Pressable, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radii, spacing } from "@/constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function Modal({ visible, onClose, children }: PropsWithChildren<Props>) {
  const theme = useAppTheme();
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.surface,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            padding: spacing.lg,
          }}
        >
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
