import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, Easing } from "react-native-reanimated";
import { useAppTheme } from "@/hooks/useAppTheme";
import { radii } from "@/constants/theme";

/** A single pulsing placeholder block, used to build skeleton loading states. */
export function SkeletonBlock({ style }: { style?: ViewStyle }) {
  const theme = useAppTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ backgroundColor: theme.surfaceAlt, borderRadius: radii.sm }, style, animatedStyle]}
    />
  );
}

/** A generic list-row skeleton: avatar + two lines of text, matching Card padding. */
export function SkeletonListRow() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <SkeletonBlock style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <SkeletonBlock style={{ height: 14, width: "50%", marginBottom: 8 }} />
        <SkeletonBlock style={{ height: 12, width: "70%" }} />
      </View>
    </View>
  );
}
