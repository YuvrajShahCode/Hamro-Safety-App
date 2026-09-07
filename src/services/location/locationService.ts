import * as Location from "expo-location";
import { EmergencyLocation, ServiceResult } from "@/types";
import { getForegroundLocationStatus } from "@/utils/permissions";

/**
 * Location acquisition. Every caller must handle the failure case -
 * we never invent coordinates when a fix cannot be obtained.
 */
export const locationService = {
  async getCurrentLocation(): Promise<ServiceResult<EmergencyLocation>> {
    const status = await getForegroundLocationStatus();
    if (status !== "granted") {
      return {
        success: false,
        error: {
          message:
            "Location permission is not granted. Enable location access so Hamro Safety can share your position during an emergency.",
          code: "LOCATION_PERMISSION_DENIED",
        },
      };
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        success: true,
        data: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date(position.timestamp).toISOString(),
        },
      };
    } catch (err) {
      return {
        success: false,
        error: {
          message:
            "Could not determine your current location. Check that location services are enabled and try again.",
          code: "LOCATION_UNAVAILABLE",
        },
      };
    }
  },

  /** Subscribe to live location updates during an active emergency. Returns an unsubscribe fn. */
  async watchLocation(
    onUpdate: (loc: EmergencyLocation) => void
  ): Promise<() => void> {
    const status = await getForegroundLocationStatus();
    if (status !== "granted") {
      return () => {};
    }
    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (position) => {
        onUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date(position.timestamp).toISOString(),
        });
      }
    );
    return () => sub.remove();
  },
};
