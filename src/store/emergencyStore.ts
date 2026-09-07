import { create } from "zustand";
import { EmergencyEvent, SafetyStatus } from "@/types";
import { emergencyService } from "@/services/emergency/emergencyService";
import { locationService } from "@/services/location/locationService";
import { activityService } from "@/services/activity/activityService";

export type SOSStage =
  | "idle"
  | "getting_location"
  | "activating"
  | "notifying_contacts"
  | "active"
  | "failed";

interface EmergencyState {
  activeEvent: EmergencyEvent | null;
  stage: SOSStage;
  errorMessage: string | null;
  safetyStatus: SafetyStatus;
  loadActiveEvent: () => Promise<void>;
  activateSOS: () => Promise<void>;
  cancelSOS: () => Promise<void>;
  resolveSOS: () => Promise<void>;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  activeEvent: null,
  stage: "idle",
  errorMessage: null,
  safetyStatus: "safe",

  loadActiveEvent: async () => {
    const event = await emergencyService.getActiveEvent();
    set({
      activeEvent: event,
      stage: event ? "active" : "idle",
      safetyStatus: event ? "emergency" : "safe",
    });
  },

  activateSOS: async () => {
    set({ stage: "getting_location", errorMessage: null, safetyStatus: "emergency" });
    const event = await emergencyService.createEvent();
    set({ activeEvent: event, stage: "activating" });

    const locationResult = await locationService.getCurrentLocation();
    if (locationResult.success) {
      const updated = await emergencyService.attachLocation(event.id, locationResult.data);
      if (updated) set({ activeEvent: updated });
    } else {
      // Location failed - proceed anyway, but do not fabricate coordinates.
      set({ errorMessage: locationResult.error.message });
    }

    set({ stage: "notifying_contacts" });
    const finalEvent = await emergencyService.notifyContactsAndSync(event.id);
    if (finalEvent) {
      set({ activeEvent: finalEvent, stage: "active" });
      await activityService.record({
        type: "sos",
        title: "SOS Alert",
        status: finalEvent.syncedToServer ? "Active - Synced" : "Active - Pending sync",
        latitude: finalEvent.latitude,
        longitude: finalEvent.longitude,
      });
    } else {
      set({ stage: "failed", errorMessage: "Could not complete emergency activation." });
    }
  },

  cancelSOS: async () => {
    const event = get().activeEvent;
    if (!event) return;
    const updated = await emergencyService.cancel(event.id);
    set({ activeEvent: null, stage: "idle", safetyStatus: "safe" });
    if (updated) {
      await activityService.record({
        type: "sos",
        title: "SOS Alert",
        status: "Cancelled",
        latitude: updated.latitude,
        longitude: updated.longitude,
      });
    }
  },

  resolveSOS: async () => {
    const event = get().activeEvent;
    if (!event) return;
    await emergencyService.resolve(event.id);
    set({ activeEvent: null, stage: "idle", safetyStatus: "safe" });
  },
}));
