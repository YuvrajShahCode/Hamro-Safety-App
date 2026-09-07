import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { activityService } from "@/services/activity/activityService";
import { ActivityEvent } from "@/types";

export default function ActivityDetailScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<ActivityEvent | null>(null);

  useEffect(() => {
    activityService.list().then((list) => setEvent(list.find((e) => e.id === id) || null));
  }, [id]);

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: spacing.lg }}>
        <Text style={{ color: theme.textSecondary }}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.md }}>
          {event.title}
        </Text>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontWeight: "600", marginBottom: 2 }}>Status</Text>
          <Text style={{ color: theme.textSecondary }}>{event.status}</Text>
        </Card>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={{ fontWeight: "600", marginBottom: 2 }}>Date & time</Text>
          <Text style={{ color: theme.textSecondary }}>{new Date(event.createdAt).toLocaleString()}</Text>
        </Card>

        {event.latitude != null && event.longitude != null ? (
          <Card style={{ marginBottom: spacing.md, padding: 0, overflow: "hidden" }}>
            <MapView
              style={{ height: 200 }}
              initialRegion={{
                latitude: event.latitude,
                longitude: event.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={{ latitude: event.latitude, longitude: event.longitude }} />
            </MapView>
          </Card>
        ) : null}

        <Card>
          <Text style={{ fontWeight: "600", marginBottom: spacing.sm }}>Timeline</Text>
          <View style={{ borderLeftWidth: 2, borderLeftColor: theme.border, paddingLeft: spacing.md }}>
            <Text style={{ color: theme.textSecondary, marginBottom: spacing.sm }}>
              {new Date(event.createdAt).toLocaleTimeString()} - Event created
            </Text>
            <Text style={{ color: theme.textSecondary }}>
              Current status: {event.status}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
