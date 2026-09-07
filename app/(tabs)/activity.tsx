import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography, radii } from "@/constants/theme";
import { activityService } from "@/services/activity/activityService";
import { ActivityEvent } from "@/types";

function StatusPill({ status }: { status: string }) {
  const theme = useAppTheme();
  const isGood = /resolved|safe|completed|delivered/i.test(status);
  const isBad = /failed|expired/i.test(status);
  const color = isBad ? theme.emergency : isGood ? theme.safe : theme.warn;
  return (
    <View style={{ backgroundColor: theme.surfaceAlt, borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 }}>
      <Text style={{ color, fontSize: 12, fontWeight: "700" }}>{status}</Text>
    </View>
  );
}

export default function ActivityScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activityService.list().then((list) => {
      setEvents(list);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg, flex: 1 }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.md }}>
          Activity
        </Text>

        {loading ? (
          <View>
            {[0, 1, 2].map((i) => (
              <Card key={i} style={{ marginBottom: spacing.sm }}>
                <SkeletonBlock style={{ height: 14, width: "55%", marginBottom: 8 }} />
                <SkeletonBlock style={{ height: 12, width: "35%" }} />
              </Card>
            ))}
          </View>
        ) : events.length === 0 ? (
          <Card style={{ alignItems: "center", padding: spacing.xl }}>
            <Text style={{ color: theme.textSecondary }}>No safety activity yet</Text>
          </Card>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(e) => e.id}
            renderItem={({ item }) => (
              <Card
                style={{ marginBottom: spacing.sm }}
                onPress={() => router.push({ pathname: "/activity/[id]", params: { id: item.id } })}
                accessibilityLabel={`${item.title}, ${item.status}, ${new Date(item.createdAt).toLocaleString()}`}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: theme.textPrimary }}>{item.title}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: typography.caption.fontSize, marginTop: 2 }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <StatusPill status={item.status} />
                </View>
              </Card>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
