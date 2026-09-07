import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { useEmergencyStore } from "@/store/emergencyStore";
import { useContactsStore } from "@/store/contactsStore";
import { emergencyCallService, LOCAL_EMERGENCY_NUMBER } from "@/services/emergency/emergencyCallService";

const STAGE_LABEL: Record<string, string> = {
  getting_location: "Getting location...",
  activating: "Activating emergency mode...",
  notifying_contacts: "Notifying contacts...",
  active: "Emergency mode active",
  failed: "Something went wrong",
};

export default function EmergencyActiveScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { activeEvent, stage, errorMessage, cancelSOS } = useEmergencyStore();
  const { contacts } = useContactsStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async () => {
    await cancelSOS();
    router.replace("/(tabs)");
  };

  const handleCallEmergencyServices = async () => {
    if (!LOCAL_EMERGENCY_NUMBER) return;
    await emergencyCallService.call(LOCAL_EMERGENCY_NUMBER);
  };

  const contactsById = new Map(contacts.map((c) => [c.id, c]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.emergencyDark }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}>
        <Text style={{ color: "#fff", fontSize: typography.h1.fontSize, fontWeight: typography.h1.fontWeight, textAlign: "center", marginTop: spacing.lg }}>
          Emergency SOS Activated
        </Text>

        <View style={{ alignItems: "center", marginVertical: spacing.lg }}>
          {stage !== "active" && stage !== "failed" ? (
            <ActivityIndicator color="#fff" size="large" style={{ marginBottom: spacing.md }} />
          ) : null}
          <Text style={{ color: "#fff", fontSize: typography.bodyBold.fontSize }}>
            {STAGE_LABEL[stage] || ""}
          </Text>
        </View>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontWeight: "600", marginBottom: spacing.xs }}>Time activated</Text>
          <Text style={{ color: theme.textSecondary }}>{now.toLocaleString()}</Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontWeight: "600", marginBottom: spacing.xs }}>Location</Text>
          {activeEvent?.latitude != null ? (
            <Text style={{ color: theme.textSecondary }}>
              {activeEvent.latitude.toFixed(5)}, {activeEvent.longitude?.toFixed(5)}
              {activeEvent.accuracy ? ` (\u00B1${Math.round(activeEvent.accuracy)}m)` : ""}
            </Text>
          ) : (
            <Text style={{ color: theme.warn }}>
              {errorMessage || "Location unavailable - retrying"}
            </Text>
          )}
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontWeight: "600", marginBottom: spacing.xs }}>Contacts notified</Text>
          {(activeEvent?.contactsNotified || []).length === 0 ? (
            <Text style={{ color: theme.textSecondary }}>No contacts to notify yet.</Text>
          ) : (
            (activeEvent?.contactsNotified || []).map((n) => (
              <View key={n.contactId} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs }}>
                <Text style={{ color: theme.textPrimary }}>{contactsById.get(n.contactId)?.name || "Contact"}</Text>
                <Text style={{ color: n.state === "sent" || n.state === "delivered" ? theme.safe : theme.emergency }}>
                  {n.state === "sent" || n.state === "delivered" ? "Notified" : `Failed${n.error ? `: ${n.error}` : ""}`}
                </Text>
              </View>
            ))
          )}
          {!activeEvent?.syncedToServer && stage === "active" ? (
            <Text style={{ color: theme.warn, marginTop: spacing.xs }}>
              Offline - emergency data will be synchronized when connection is restored.
            </Text>
          ) : null}
        </Card>

        <View style={{ flex: 1 }} />

        <Button
          label={`Call Emergency Services (${LOCAL_EMERGENCY_NUMBER})`}
          variant="secondary"
          onPress={handleCallEmergencyServices}
          style={{ marginBottom: spacing.sm }}
        />
        <Button label="View Live Map" variant="secondary" onPress={() => router.push("/(tabs)/map")} style={{ marginBottom: spacing.sm }} />
        <Button label="Cancel Emergency" variant="ghost" onPress={handleCancel} style={{ borderColor: "#fff" }} />
      </ScrollView>
    </SafeAreaView>
  );
}
