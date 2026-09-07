import React, { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { locationService } from "@/services/location/locationService";
import { getForegroundLocationStatus, requestForegroundLocation, openAppSettings } from "@/utils/permissions";
import { useEmergencyStore } from "@/store/emergencyStore";
import { EmergencyLocation } from "@/types";

export default function MapScreen() {
  const theme = useAppTheme();
  const { activeEvent } = useEmergencyStore();
  const [permission, setPermission] = useState<"granted" | "denied" | "undetermined">("undetermined");
  const [location, setLocation] = useState<EmergencyLocation | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const status = await getForegroundLocationStatus();
    setPermission(status);
    if (status === "granted") {
      const result = await locationService.getCurrentLocation();
      if (result.success) setLocation(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const requestAccess = async () => {
    const status = await requestForegroundLocation();
    setPermission(status);
    if (status === "granted") load();
  };

  if (permission !== "granted") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, padding: spacing.lg, alignItems: "center", justifyContent: "center" }}>
          <Card style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "700", color: theme.textPrimary, marginBottom: spacing.xs, textAlign: "center" }}>
              Location access needed
            </Text>
            <Text style={{ color: theme.textSecondary, textAlign: "center", marginBottom: spacing.md }}>
              Hamro Safety needs your location to show it on the map and share it during an emergency.
            </Text>
            {permission === "denied" ? (
              <Button label="Open Settings" onPress={openAppSettings} />
            ) : (
              <Button label="Allow Location Access" onPress={requestAccess} />
            )}
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top"]}>
      {activeEvent ? (
        <View style={{ backgroundColor: theme.emergency, padding: spacing.sm, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>LIVE EMERGENCY LOCATION</Text>
        </View>
      ) : null}

      {location ? (
        <MapView
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
        >
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title={activeEvent ? "Emergency location" : "You"}
            pinColor={activeEvent ? theme.emergency : undefined}
          />
        </MapView>
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: theme.textSecondary }}>
            {loading ? "Getting your location..." : "Location unavailable right now."}
          </Text>
        </View>
      )}

      {location ? (
        <View style={{ position: "absolute", bottom: spacing.lg, left: spacing.lg, right: spacing.lg }}>
          <Card>
            <Text style={{ fontWeight: "700", color: theme.textPrimary }}>Current coordinates</Text>
            <Text style={{ color: theme.textSecondary }}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: typography.caption.fontSize }}>
              Accuracy: {location.accuracy ? `\u00B1${Math.round(location.accuracy)}m` : "unknown"}
            </Text>
          </Card>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
