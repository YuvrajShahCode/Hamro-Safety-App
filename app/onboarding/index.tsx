import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Your Safety Comes First",
    body: "Hamro Safety keeps you connected to help and to the people you trust most, wherever you are.",
  },
  {
    title: "Get Help Quickly",
    body: "Press and hold the SOS button to instantly alert your emergency contacts with your location.",
  },
  {
    title: "Stay Connected",
    body: "Start a safety check-in before you head out, and share your live location when it matters.",
  },
];

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={{ width, padding: spacing.lg, alignItems: "center", justifyContent: "center", flex: 1 }}>
            <Text style={{ fontSize: typography.h1.fontSize, fontWeight: typography.h1.fontWeight, color: theme.textPrimary, textAlign: "center", marginBottom: spacing.md }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: typography.body.fontSize, color: theme.textSecondary, textAlign: "center" }}>
              {item.body}
            </Text>
          </View>
        )}
      />
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: spacing.md }}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: i === index ? theme.emergency : theme.border,
            }}
          />
        ))}
      </View>
      <View style={{ padding: spacing.lg }}>
        <Button label={index === SLIDES.length - 1 ? "Get Started" : "Next"} onPress={next} />
      </View>
    </SafeAreaView>
  );
}
