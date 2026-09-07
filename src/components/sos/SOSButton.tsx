import React, { useCallback, useRef } from "react";
import { AccessibilityInfo, GestureResponderEvent, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { typography } from "@/constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const HOLD_DURATION_MS = 3000;
const SIZE = 220;
const STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface SOSButtonProps {
  onActivate: () => void;
  disabled?: boolean;
}

/**
 * The core SOS interaction: press and hold for 3 seconds to avoid
 * accidental activation. Shows a circular progress ring while holding,
 * and haptic feedback at start, midpoint, and completion.
 */
export function SOSButton({ onActivate, disabled }: SOSButtonProps) {
  const theme = useAppTheme();
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const hasFiredMidpoint = useRef(false);
  const completed = useRef(false);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const handlePressIn = useCallback(
    (_e: GestureResponderEvent) => {
      if (disabled) return;
      completed.current = false;
      hasFiredMidpoint.current = false;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      scale.value = withTiming(0.96, { duration: 150 });
      progress.value = withTiming(
        1,
        { duration: HOLD_DURATION_MS, easing: Easing.linear },
        (finished) => {
          if (finished) {
            completed.current = true;
          }
        }
      );

      // Midpoint haptic buzz, fired via a plain timeout (kept off the UI thread concerns).
      setTimeout(() => {
        if (!completed.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }, HOLD_DURATION_MS / 2);

      setTimeout(() => {
        if (completed.current) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          AccessibilityInfo.announceForAccessibility("Emergency SOS activated");
          onActivate();
        }
      }, HOLD_DURATION_MS + 20);
    },
    [disabled, onActivate, progress, scale]
  );

  const handlePressOut = useCallback(() => {
    if (completed.current) return;
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(1, { duration: 200 });
  }, [progress, scale]);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View
        accessible
        accessibilityRole="button"
        accessibilityLabel="SOS - Get help immediately"
        accessibilityHint="Press and hold for 3 seconds to activate emergency mode"
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
        style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}
      >
        <Svg width={SIZE} height={SIZE} style={{ position: "absolute" }}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={theme.border}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={theme.emergency}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
            animatedProps={animatedProps}
            fill="none"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <View
          style={{
            width: SIZE - STROKE_WIDTH * 4,
            height: SIZE - STROKE_WIDTH * 4,
            borderRadius: (SIZE - STROKE_WIDTH * 4) / 2,
            backgroundColor: disabled ? theme.border : theme.emergency,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 40, fontWeight: "800", letterSpacing: 2 }}>SOS</Text>
        </View>
      </View>
      <Text
        style={{
          marginTop: 16,
          textAlign: "center",
          color: theme.textSecondary,
          fontSize: typography.caption.fontSize,
          maxWidth: 220,
        }}
      >
        Press and hold for 3 seconds to activate emergency mode
      </Text>
    </View>
  );
}
