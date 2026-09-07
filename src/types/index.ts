/**
 * Core domain types for Hamro Safety.
 * Keep these extensible - backend integrations should map onto these shapes,
 * not the other way around.
 */

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  profilePhotoUrl?: string;
  createdAt: string;
}

export type EmergencyPriority = 1 | 2 | 3 | 4 | 5;

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
  photoUrl?: string;
  priority: EmergencyPriority;
  isPrimary: boolean;
  createdAt: string;
}

export type EmergencyStatus =
  | "activating"
  | "active"
  | "resolved"
  | "cancelled"
  | "failed";

export interface EmergencyLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
}

export type ContactNotifyState = "pending" | "sent" | "failed" | "delivered";

export interface ContactNotification {
  contactId: string;
  channel: "push" | "sms" | "call";
  state: ContactNotifyState;
  attemptedAt: string;
  error?: string;
}

export interface EmergencyEvent {
  id: string;
  userId: string;
  status: EmergencyStatus;
  createdAt: string;
  activatedAt: string | null;
  resolvedAt: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  contactsNotified: ContactNotification[];
  notes?: string;
  syncedToServer: boolean;
}

export type CheckInStatus = "active" | "completed" | "expired" | "cancelled";

export interface SafetyCheckIn {
  id: string;
  userId: string;
  destination: string;
  expectedArrivalAt: string;
  notifyContactIds: string[];
  status: CheckInStatus;
  createdAt: string;
  completedAt: string | null;
}

export type NotificationCategory =
  | "emergency_alert"
  | "contact_response"
  | "checkin_reminder"
  | "checkin_expiration"
  | "safety_status"
  | "system";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  relatedEventId?: string;
}

export type ActivityEventType =
  | "sos"
  | "checkin"
  | "alert"
  | "location_share";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  createdAt: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  durationSeconds?: number;
}

export type SafetyStatus = "safe" | "checkin" | "emergency";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/** Generic result wrapper so services never silently swallow failures. */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };
