import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { useCheckInStore } from "@/store/checkinStore";
import { useContactsStore } from "@/store/contactsStore";

const DURATIONS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
];

function useCountdown(target: string | null) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!target) return;
    const tick = () => setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);
  const totalSeconds = Math.floor(remaining / 1000);
  const mm = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const ss = (totalSeconds % 60).toString().padStart(2, "0");
  return { label: `${mm}:${ss}`, expired: remaining <= 0 };
}

export default function CheckInScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { activeCheckIn, create, complete, cancel, load, error } = useCheckInStore();
  const { contacts, load: loadContacts } = useContactsStore();
  const [destination, setDestination] = useState("");
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [customMinutes, setCustomMinutes] = useState("");

  useEffect(() => {
    load();
    loadContacts();
  }, []);

  const countdown = useCountdown(activeCheckIn?.expectedArrivalAt || null);

  const onStart = async () => {
    const minutes = customMinutes ? parseInt(customMinutes, 10) || selectedMinutes : selectedMinutes;
    const expectedArrivalAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    await create({
      destination,
      expectedArrivalAt,
      notifyContactIds: contacts.filter((c) => c.isPrimary).map((c) => c.id),
    });
  };

  if (activeCheckIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ padding: spacing.lg, flex: 1 }}>
          <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.md }}>
            Check-in Timer
          </Text>
          <Card style={{ alignItems: "center", padding: spacing.xl, marginBottom: spacing.lg }}>
            <Text style={{ color: theme.textSecondary, marginBottom: spacing.xs }}>Heading to {activeCheckIn.destination}</Text>
            <Text style={{ fontSize: 48, fontWeight: "800", color: countdown.expired ? theme.emergency : theme.textPrimary }}>
              {countdown.label}
            </Text>
            <Text style={{ color: theme.textSecondary }}>{countdown.expired ? "overdue" : "remaining"}</Text>
          </Card>
          <Button label="I'm Safe" onPress={() => complete()} style={{ marginBottom: spacing.sm }} />
          <Button label="Cancel Check-in" variant="ghost" onPress={() => cancel()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.xs }}>
          Start a Safety Check-in
        </Text>
        <Text style={{ color: theme.textSecondary, marginBottom: spacing.lg }}>
          "I'm going somewhere. Check on me if I don't arrive."
        </Text>

        <Input label="Destination" value={destination} onChangeText={setDestination} placeholder="e.g. Home, Office" />

        <Text style={{ color: theme.textSecondary, marginBottom: spacing.sm }}>Expected arrival</Text>
        <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md }}>
          {DURATIONS.map((d) => (
            <Button
              key={d.minutes}
              label={d.label}
              variant={selectedMinutes === d.minutes && !customMinutes ? "primary" : "secondary"}
              onPress={() => { setSelectedMinutes(d.minutes); setCustomMinutes(""); }}
              style={{ flex: 1 }}
            />
          ))}
        </View>
        <Input
          label="Or custom duration (minutes)"
          value={customMinutes}
          onChangeText={setCustomMinutes}
          keyboardType="number-pad"
          placeholder="e.g. 45"
        />

        {error ? <Text style={{ color: theme.emergency, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button label="Start Check-in" onPress={onStart} disabled={!destination} />
      </ScrollView>
    </SafeAreaView>
  );
}
