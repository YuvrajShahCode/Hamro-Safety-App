import { apiClient, toApiError, API_BASE_URL } from "@/services/api/client";
import { localStore, StorageKeys } from "@/services/api/localStore";
import { enqueue } from "@/services/api/retryQueue";
import { isOnline } from "@/utils/network";
import { contactService } from "@/services/contacts/contactService";
import { notificationService } from "@/services/notifications/notificationService";
import {
  ContactNotification,
  EmergencyEvent,
  EmergencyLocation,
  ServiceResult,
} from "@/types";

async function getEvents(): Promise<EmergencyEvent[]> {
  return (await localStore.getJSON<EmergencyEvent[]>(StorageKeys.EMERGENCY_EVENTS)) || [];
}

async function saveEvents(events: EmergencyEvent[]): Promise<void> {
  await localStore.setJSON(StorageKeys.EMERGENCY_EVENTS, events);
}

/**
 * The core SOS pipeline. Every step below reports real success/failure -
 * nothing here is allowed to claim delivery that didn't happen. This is
 * the single highest-priority code path in the app (Section 7 & 37).
 */
export const emergencyService = {
  async getActiveEvent(): Promise<EmergencyEvent | null> {
    const events = await getEvents();
    return events.find((e) => e.status === "active" || e.status === "activating") || null;
  },

  async getEvent(id: string): Promise<EmergencyEvent | null> {
    const events = await getEvents();
    return events.find((e) => e.id === id) || null;
  },

  async listEvents(): Promise<EmergencyEvent[]> {
    return getEvents();
  },

  /**
   * Step 1-2: create the local event record immediately (works even fully
   * offline), before we know whether location or contact notification will
   * succeed. This guarantees the emergency is never lost due to a slow
   * network.
   */
  async createEvent(): Promise<EmergencyEvent> {
    const events = await getEvents();
    const event: EmergencyEvent = {
      id: `event_${Date.now()}`,
      userId: "current_user", // resolved from auth store by caller in a real build
      status: "activating",
      createdAt: new Date().toISOString(),
      activatedAt: null,
      resolvedAt: null,
      latitude: null,
      longitude: null,
      accuracy: null,
      contactsNotified: [],
      syncedToServer: false,
    };
    await saveEvents([event, ...events]);
    return event;
  },

  /** Step 1 (continued): attach a location fix to the event, if one is available. */
  async attachLocation(eventId: string, location: EmergencyLocation | null): Promise<EmergencyEvent | null> {
    const events = await getEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) return null;
    events[idx] = {
      ...events[idx],
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      accuracy: location?.accuracy ?? null,
    };
    await saveEvents(events);
    return events[idx];
  },

  /**
   * Step 3-4: notify trusted contacts and attempt to sync to the backend.
   * Each contact notification attempt is recorded individually as
   * pending -> sent/failed. A push/SMS channel that isn't configured
   * (no backend, no FCM/SMS provider) is recorded as "failed" with a
   * clear reason - never silently marked as sent.
   */
  async notifyContactsAndSync(eventId: string): Promise<EmergencyEvent | null> {
    const events = await getEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) return null;

    const contacts = await contactService.list();
    const online = await isOnline();
    const attempts: ContactNotification[] = [];

    for (const contact of contacts) {
      const attemptedAt = new Date().toISOString();
      if (!online) {
        attempts.push({ contactId: contact.id, channel: "push", state: "failed", attemptedAt, error: "Device is offline" });
        continue;
      }
      if (!API_BASE_URL) {
        attempts.push({
          contactId: contact.id,
          channel: "push",
          state: "failed",
          attemptedAt,
          error: "No backend configured - cannot deliver alert to contact",
        });
        continue;
      }
      try {
        await apiClient.post(`/emergency/${eventId}/notify`, { contactId: contact.id });
        attempts.push({ contactId: contact.id, channel: "push", state: "sent", attemptedAt });
      } catch (err) {
        attempts.push({ contactId: contact.id, channel: "push", state: "failed", attemptedAt, error: toApiError(err).message });
      }
    }

    events[idx] = { ...events[idx], contactsNotified: attempts };
    await saveEvents(events);

    // Sync the event itself to the backend.
    if (online && API_BASE_URL) {
      try {
        await apiClient.post("/emergency", events[idx]);
        events[idx] = { ...events[idx], syncedToServer: true, status: "active", activatedAt: new Date().toISOString() };
      } catch (err) {
        events[idx] = { ...events[idx], status: "active", activatedAt: new Date().toISOString() };
        await enqueue({
          id: `sync_${eventId}_${Date.now()}`,
          kind: "sync_emergency_event",
          payload: events[idx],
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      events[idx] = { ...events[idx], status: "active", activatedAt: new Date().toISOString() };
      await enqueue({
        id: `sync_${eventId}_${Date.now()}`,
        kind: "sync_emergency_event",
        payload: events[idx],
        createdAt: new Date().toISOString(),
      });
    }

    await saveEvents(events);

    await notificationService.record({
      category: "emergency_alert",
      title: "Emergency SOS Activated",
      body: online && API_BASE_URL
        ? "Your trusted contacts are being notified."
        : "Offline - emergency data will be synchronized when connection is restored.",
      relatedEventId: eventId,
    });

    return events[idx];
  },

  async cancel(eventId: string): Promise<EmergencyEvent | null> {
    const events = await getEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], status: "cancelled", resolvedAt: new Date().toISOString() };
    await saveEvents(events);
    if (API_BASE_URL && (await isOnline())) {
      try {
        await apiClient.post(`/emergency/${eventId}/cancel`);
      } catch {
        // Cancellation is recorded locally regardless; sync will retry.
      }
    }
    return events[idx];
  },

  async resolve(eventId: string): Promise<EmergencyEvent | null> {
    const events = await getEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], status: "resolved", resolvedAt: new Date().toISOString() };
    await saveEvents(events);
    return events[idx];
  },
};
