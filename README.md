# Hamro Safety

A production-foundation React Native (Expo) personal safety and emergency SOS
application. Built for speed, clarity, and honesty under stress — the app
never claims an emergency alert, call, or location update succeeded unless it
actually did.

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Running locally](#running-locally)
- [Android build](#android-build)
- [iOS build](#ios-build)
- [Backend configuration](#backend-configuration)
- [Firebase / push notification configuration](#firebase--push-notification-configuration)
- [SMS provider configuration](#sms-provider-configuration)
- [Permissions](#permissions)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known platform limitations](#known-platform-limitations)
- [Project structure](#project-structure)

## Overview

Hamro Safety lets a user press and hold a single **SOS** button for 3 seconds
to activate an emergency: it captures the user's location, notifies their
trusted emergency contacts, and syncs the event to a backend, while showing
honest success/failure state for every step. It also supports proactive
safety check-ins ("check on me if I don't arrive"), a live emergency map, an
activity history, and full contact/profile/settings management.

This repository is a **real, runnable application foundation** — not a
mockup. Every screen is wired to a typed service layer and local
persistence. Features that require external infrastructure (a real backend,
Firebase/APNs push, an SMS provider) have complete integration
architecture and clearly marked configuration steps; until configured, the
app reports those operations as failed/pending rather than pretending they
succeeded.

## Features

- Press-and-hold SOS activation with animated progress ring and haptics
- Full SOS pipeline: location capture → local persistence → contact
  notification → backend sync, each step independently tracked
- Emergency contacts (up to 5): add/edit/delete/reorder/call/set primary,
  with a guard against deleting your primary contact
- Live emergency map (React Native Maps) with permission handling and a
  clear denied-permission fallback
- Safety check-ins with countdown timer, "I'm Safe" confirmation, and
  automatic expiration handling
- Activity history with per-event timeline detail view
- Centralized notification service (local scheduling + push token
  registration scaffold)
- Offline-first: every emergency event is created locally first and queued
  for retry when the network is unavailable — never silently dropped
- Light/dark/system theme support, accessible design (44pt touch targets,
  screen-reader labels, non-color-only status indicators)
- Auth (register/login/forgot password) with secure token storage

## Tech stack

- React Native + TypeScript, Expo (managed workflow) + Expo Router
- NativeWind / Tailwind tokens (see `src/constants/theme.ts` as the
  canonical source of truth; Tailwind config mirrors it)
- Zustand for global state (auth, emergency, contacts, check-in, settings)
- TanStack Query provider (wired for future server-state fetching)
- AsyncStorage (local persistence) + Expo SecureStore (auth token)
- Expo Location, Expo Notifications, React Native Maps
- React Native Reanimated + Gesture Handler (SOS button animation)
- React Hook Form + Zod (form validation)
- Axios (API client)
- Jest + Testing Library (tests)

## Architecture

```
UI screens (app/)  →  Zustand stores (src/store)  →  Services (src/services)  →  API / device APIs
```

- **Screens never call the API directly.** They call a Zustand store action,
  which calls a service function, which talks to `apiClient` / device SDKs
  and always returns a `ServiceResult<T>` (`{ success: true, data } | { success: false, error }`).
- **Local-first writes.** Emergency events, contacts, check-ins, and
  activity are written to `AsyncStorage` immediately, so the app is fully
  usable offline and nothing is lost if the network is unavailable.
- **Retry queue.** Failed server syncs are pushed onto a persisted retry
  queue (`src/services/api/retryQueue.ts`) and flushed automatically when
  connectivity returns (wired in `app/_layout.tsx` via `NetInfo`).
- **Honesty by construction.** `notifyContactsAndSync` in
  `emergencyService.ts` records a *per-contact* `pending → sent/failed`
  result. A missing backend, missing SMS/push config, or offline device all
  produce an explicit `failed` state with a human-readable reason — never a
  silent `sent`.

## Installation

```bash
git clone <this-repo>
cd hamro-safety
npm install
```

## Environment variables

Copy `.env.example` to `.env` and fill in real values before connecting to
production infrastructure:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Base URL of your backend (auth, contacts, emergency sync). Must carry the `EXPO_PUBLIC_` prefix or Expo will not inline it into the client bundle. |
| `FCM_SENDER_ID` / `FCM_API_KEY` | Firebase Cloud Messaging credentials for Android push (native config only - never prefix these with `EXPO_PUBLIC_`). |
| `SMS_PROVIDER_API_KEY` / `SMS_PROVIDER_FROM_NUMBER` | Credentials for an SMS provider (e.g. Twilio) used to alert contacts who don't have the app installed. These belong to your **backend**, never the client. |
| `APP_ENV` | `development` \| `staging` \| `production` |

**Without `EXPO_PUBLIC_API_BASE_URL` set, the app runs fully offline-capable
but every server sync and contact notification will correctly report as
failed** — this is intentional per the safety requirement that Hamro Safety
never fabricate success.

⚠️ Only prefix a variable with `EXPO_PUBLIC_` if it is safe to ship inside
the public client bundle. Never do this for API keys, SMS credentials, or
anything secret - those belong on your backend only.

## Running locally

```bash
npm run start        # opens Expo Dev Tools / QR code
npm run android       # run on a connected Android device/emulator
npm run ios           # run on iOS simulator (macOS only)
```

or directly:

```bash
npx expo start
```

Maps and background location require a physical device or a properly
configured emulator/simulator with Google Play services (Android) — they
will not render meaningfully in Expo Go on some simulators without
additional setup.

## Android build

1. Install [EAS CLI](https://docs.expo.dev/eas/): `npm install -g eas-cli`
2. `eas login`
3. Configure `eas.json` (run `eas build:configure` if not present)
4. `eas build --platform android --profile production`
5. For local builds instead of EAS: `npx expo prebuild` then open the
   generated `android/` project in Android Studio.

Android requires `google-services.json` from your Firebase project placed
at the project root and referenced in `app.json`/`app.config.js` before FCM
push will work.

## iOS build

1. `eas build --platform ios --profile production` (requires an Apple
   Developer account and provisioning profile configured via
   `eas credentials`)
2. For local builds: `npx expo prebuild` then open `ios/*.xcworkspace` in
   Xcode.

iOS push requires an APNs key/certificate registered with your Firebase
project (or a direct APNs integration) plus the `aps-environment`
entitlement, which EAS build can provision automatically.

## Backend configuration

Hamro Safety expects a REST backend exposing (at minimum):

- `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`
- `POST /contacts`
- `POST /emergency`, `POST /emergency/:id/notify`, `POST /emergency/:id/cancel`

All service files under `src/services/` are the single place that call
these endpoints — extend them there, not in screens. Until `API_BASE_URL`
is set, calls fail fast with a `NO_BACKEND_CONFIGURED` error surfaced to
the UI.

## Firebase / push notification configuration

1. Create a Firebase project and an Expo/EAS project
   (`eas project:init`).
2. Add `expo.extra.eas.projectId` to `app.json` (EAS does this
   automatically).
3. Add `google-services.json` (Android) / APNs key (iOS).
4. `notificationService.registerForPush()` will then return a real Expo
   push token; wire that token to your backend's `userService` so it can
   send push notifications to a user's device during emergencies from
   *other* users' devices (e.g. a contact accepting/responding).

Until this is configured, `registerForPush()` returns a clear
`PUSH_NOT_CONFIGURED` error rather than a fake token.

## SMS provider configuration

For contacts who may not have the app installed, wire an SMS provider
(e.g. Twilio) into your backend, and have `POST /emergency/:id/notify`
trigger both a push notification (if the contact has the app) and an SMS
fallback. The client only needs to know whether the call succeeded;
per-channel delivery detail can be extended in `ContactNotification.channel`.

## Permissions

| Permission | Why | Handling |
|---|---|---|
| Location (foreground) | Attach coordinates to an SOS event, show on map | Requested on first use; denial shows an explanation + Settings shortcut (`src/utils/permissions.ts`) |
| Location (background) | Keep sharing location during an active emergency when the app isn't in the foreground | Optional, requested separately after foreground is granted |
| Notifications | Local check-in reminders, emergency alerts, push registration | Requested once; never re-prompted after denial |
| Phone calling | Emergency calling to contacts / local emergency number | Uses `tel:` links, which always show a system confirmation — no silent calls |

## Testing

```bash
npm test
```

Covers (see `__tests__/`):

- SOS activation creates a local event immediately, even offline
- Location attachment never fabricates coordinates when unavailable
- Contact notification is honestly marked `failed` when no backend/SMS/push
  is configured (the single highest-priority test per the product spec)
- SOS cancellation
- Emergency contact add/limit/primary-deletion guard
- Check-in creation, single-active-check-in constraint, completion, and
  expiration
- Login success/failure and error surfacing

Extend this suite with API-failure and permission-denied integration tests
once a real backend/mocking layer (e.g. MSW) is wired in.

## Deployment

1. Set all environment variables for the target environment (`staging` /
   `production`) in EAS secrets: `eas secret:create`.
2. `eas build --profile production --platform all`
3. `eas submit` to publish to the App Store / Google Play.
4. Configure over-the-air updates via `expo-updates` if you want to push
   JS-only fixes without a full store review.

## Known platform limitations

- iOS does not allow a fully silent/programmatic phone call — the `tel:`
  link always surfaces a system confirmation dialog. This is a platform
  restriction, not a bug; it also protects against accidental emergency
  calls.
- Background location on iOS requires the "Always" permission and
  additional App Store review justification; some users may only grant
  "While Using the App", in which case live location during a
  backgrounded emergency will not update until the app is reopened.
- Push notifications to *other* users' devices (e.g. notifying a contact)
  require your own backend + FCM/APNs — this client cannot deliver
  cross-device push on its own.
- SMS delivery to contacts without the app requires a paid SMS provider
  integration; none is included by default to avoid incurring costs
  without explicit configuration.
- Maps require Google Play services on Android and may not fully render
  inside some CI/emulator environments without additional setup.

## Project structure

```
app/                     Expo Router routes (screens)
  (auth)/                Welcome, login, register, forgot password
  (tabs)/                Home, Map, Contacts, Activity, Profile
  emergency/              Active SOS confirmation/status screen
  onboarding/             3-screen onboarding
  contacts/                Add/edit contact routes
  checkin/                Check-in screen
  activity/               Activity detail route
  settings/               Notifications/location/privacy/security/about
src/
  components/ui/          Button, Card, Input, Modal, StatusBadge, ToggleRow, ErrorBoundary
  components/sos/         SOSButton (press-and-hold + animated ring)
  constants/theme.ts       Design tokens (colors, spacing, radii, typography)
  hooks/useAppTheme.ts     Resolves light/dark/system theme
  services/                api, auth, emergency, location, notifications, contacts, checkin, activity
  store/                   Zustand stores: auth, emergency, contacts, checkin, settings
  types/index.ts           Domain models (User, EmergencyContact, EmergencyEvent, etc.)
  utils/                   validation (Zod schemas), permissions, network
__tests__/                 Jest test suite
```
