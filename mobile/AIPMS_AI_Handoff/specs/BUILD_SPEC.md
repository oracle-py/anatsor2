# AIPMS Production Build Specification

## 1. Product definition

AIPMS is the farmer-facing application for the Anatsor Integrated Poultry Management System. A registered farmer uses it to monitor a physical AIPMS unit, review current and historical farm conditions, view automatic equipment state, record daily poultry production, receive alerts and view the UNO Q camera while connected to the farm's local network.

The application must support Android first, web second and iOS later. The recommended implementation is Expo React Native with TypeScript and Expo Router, sharing business logic and most UI across mobile and web.

## 2. Non-negotiable product rules

1. The application name is **AIPMS**.
2. The persistent expanded name is **Anatsor Integrated Poultry Management System**.
3. Device IDs use forms such as `AIPMS1234`.
4. One authenticated user may own one or more registered devices, although the first release may present one primary device.
5. The UNO Q makes all fan, humidifier and alarm decisions locally.
6. The app must not provide fan ON/OFF, humidifier ON/OFF, manual mode or remote alarm-reset commands.
7. Equipment state is read-only and must explain why an automatic action is active when the data supports that explanation.
8. Cloud monitoring and local-network camera viewing are two connection tracks within one application.
9. The camera stream is not stored in or proxied through Supabase in the initial release.
10. Never expose a Supabase service-role key, database password, MQTT password or device credential in client code.

## 3. Reference UI

Use `../mockup/aipms-functional-mockup.html` as the visual reference. Preserve its core visual system:

- Dark forest green primary surfaces.
- Amber accent colour.
- Warm paper backgrounds and pale green secondary surfaces.
- Rounded cards and compact mobile-first information density.
- Bricolage Grotesque-style display headings and DM Sans-style body typography, or production-safe equivalents.
- Clear good, warning and critical states.
- Bottom navigation on mobile.
- Responsive desktop/web presentation that does not render a decorative phone shell in production.

The production web application should use the same components in a responsive dashboard layout rather than permanently imitating a phone frame.

## 4. User journeys

### 4.1 New account and device claim

1. User opens AIPMS.
2. User chooses Sign up.
3. User enters full name, email, password and physical device ID.
4. Client validates fields without claiming the device locally.
5. Supabase Auth creates the account.
6. If email confirmation is enabled, show a verification-pending screen and resume the claim after sign-in.
7. A secure database function claims the device only if it exists, is claimable and is not owned by another user.
8. On success, load the dashboard for that device.
9. Handle invalid, unknown, already-claimed and temporarily unavailable device states distinctly.

The client must never directly update an arbitrary `owner_user_id` without a secure database function and Row Level Security.

### 4.2 Login

1. User enters email and password.
2. Show inline validation, loading and authentication errors.
3. Restore the authenticated session on relaunch.
4. Load the user's primary device.
5. If the account has no device, show device setup instead of an empty dashboard.
6. Support password reset and logout.

### 4.3 Cloud dashboard

The dashboard displays:

- Device name and ID.
- Cloud connection state.
- Device online/offline state from status telemetry and last-seen time.
- Temperature in degrees Celsius.
- Relative humidity percentage.
- Air-quality reading and interpreted condition.
- Alarm condition.
- Fan state, read-only.
- Humidifier state, read-only.
- Automatic-control label.
- Last update time.
- Active warning banner when readings are outside expected ranges.
- A concise daily insight derived from real readings or a clearly labelled unavailable state.

Use Supabase Realtime for new readings and a normal query for initial/current state. Do not rely on Realtime alone because the user may open the app after the last event.

### 4.4 Daily records

The user can create and update one farm record per device per calendar date. The initial fields are:

- Chicks hatched.
- Birds bred.
- Eggs collected.
- Optional mortality count.
- Optional note.

Requirements:

- Numeric values cannot be negative.
- Saving provides success/error feedback.
- Reopening today's record loads the saved values.
- History is sorted newest first.
- Users can view a record's details and edit records they own.

### 4.5 History and insights

History includes daily records and sensor trends. At minimum:

- Date-filtered record list.
- Temperature and humidity trend views.
- Alert history.
- Empty, loading and error states.

Insights must not present fabricated AI conclusions as real. Until a real insight service exists, use deterministic summaries based on available data and label them as summaries. Examples: time outside threshold, weekly averages and changes in egg count.

### 4.6 Alerts

Display active and resolved environmental alerts with timestamps and causes. App-level acknowledgement may mark an alert as read by the user, but it must not imply that the hardware alarm was reset.

### 4.7 Local-network camera mode

Local mode is available only when the client can reach the UNO Q on the same LAN.

Required flow:

1. User opens Camera.
2. App explains that the phone/computer must be connected to the farm Wi-Fi.
3. Attempt the saved local hostname/address, initially `aipms1234.local` or a device-specific value.
4. Permit manual local address entry as a fallback.
5. Perform a health check before displaying the stream.
6. Show Connecting, Connected, Unavailable and Permission Required states.
7. Display the camera stream when reachable.
8. Display local AI detections and confidence when supplied by the UNO Q.
9. Do not upload the continuous camera feed to Supabase.
10. When the local camera is unavailable, cloud monitoring must continue normally.

Expected legacy endpoints from the existing prototype are:

- Local Web UI / Socket.IO service: port `7000`.
- Camera embed: port `4912`, path `/embed`.

These endpoints must be treated as configurable because the final UNO Q API may change. Mobile builds must request the appropriate local-network permissions. Any HTTP cleartext exception must be narrowly scoped to local addresses and documented.

### 4.8 Settings

Settings display:

- Farmer name and email.
- Registered device and device ID.
- Automatic control mode.
- Alert notification preferences.
- Daily-summary preference.
- Local camera hostname/address.
- Logout.

Thresholds may be displayed as device configuration, but must not be editable unless a safe configuration channel is explicitly added to the UNO Q later.

## 5. Navigation

Mobile bottom navigation:

1. Home
2. Camera
3. Records
4. Insights/Alerts
5. Settings

History may be a nested Records screen. Authentication and device setup must be outside the authenticated tab navigation.

## 6. Connection model

The UI must derive an explicit connection mode:

- `local`: UNO Q local health check succeeds. Camera and local events may be used; cloud remains available.
- `cloud`: authenticated Supabase connection is available but the local unit is not reachable.
- `offline`: neither usable cloud data nor a reachable local service is available.

Do not conflate cloud connectivity with physical device connectivity. A user can have internet access while the device is offline.

## 7. Production architecture

### Device-to-cloud telemetry

`Arduino UNO Q -> HiveMQ Cloud -> always-on Railway MQTT bridge -> Supabase -> AIPMS clients`

The bridge subscribes to device telemetry and writes validated readings to Supabase. Unknown/unregistered device IDs must be rejected or quarantined rather than attached to arbitrary users.

### Local camera path

`AIPMS client -> farm LAN -> UNO Q camera / local service`

This path does not depend on Railway or Supabase, except that the saved device metadata may provide the preferred local hostname.

### Client layers

- UI components and screens.
- Authentication/session provider.
- Supabase cloud repository.
- Local-device repository.
- Connection manager choosing local/cloud/offline states.
- Domain models independent of transport payload naming.
- Secure configuration/environment handling.

## 8. State and error requirements

Every network-backed screen must implement:

- Initial loading.
- Refreshing.
- Empty data.
- Stale data.
- Offline.
- Permission denied.
- Retryable server error.
- Authentication expired.

Show the timestamp of the last valid sensor reading. Do not replace a stale reading with zero.

## 9. Accessibility and responsive behaviour

- Minimum touch target approximately 44 by 44 points.
- Text remains readable with system font scaling.
- Status is conveyed by text/icon in addition to colour.
- Forms have labels and accessible errors.
- Keyboard navigation works on web.
- Desktop layout uses available width without breaking the mobile hierarchy.

## 10. Recommended implementation sequence

1. Scaffold Expo/TypeScript app and navigation.
2. Port design tokens and reusable components from the mockup.
3. Implement auth screens and mocked repositories.
4. Implement all screens against typed mock data.
5. Add Supabase client and session handling.
6. Implement secure device claim.
7. Implement readings, Realtime subscription and daily records.
8. Implement alert/history queries.
9. Implement local-device health check, Socket.IO adapter and camera view.
10. Test fallback behaviour and physical device integration.
11. Produce Android test build and deploy web build.

## 11. Definition of done

The first production milestone is done when:

- A real user can sign up, verify email if required and sign in.
- The user can securely claim `AIPMS1234` if it is available.
- Another user cannot read or claim that device.
- Current readings appear and update without manual reload.
- Stale/offline readings are clearly identified.
- Automatic fan/humidifier/alarm state is visible but cannot be remotely controlled.
- Daily records save to Supabase and survive reinstall/login on another device.
- Users can view only their own records and readings.
- Local camera connects on the farm LAN and fails gracefully away from it.
- The app works on Android and as a responsive web application.
- No privileged key or MQTT credential is included in the client bundle.

## 12. Acceptance tests

1. Sign up with malformed device ID: claim is blocked with a helpful message.
2. Sign up with unknown device: account remains valid; device setup shows not found.
3. Attempt to claim an owned device from another account: denied.
4. Log in with no device: device setup is displayed.
5. Receive a new sensor row: dashboard updates through Realtime.
6. Disconnect Realtime: last valid values remain with a stale indicator.
7. Save today's record twice: update the same logical daily record rather than duplicate it.
8. Attempt to read another user's data: RLS denies access.
9. Open Camera away from farm LAN: unavailable state appears; cloud dashboard remains usable.
10. Open Camera on farm LAN: health check succeeds and stream appears.
11. Device reports fan ON: UI displays Running and Automatic, with no control button.
12. Log out: protected data and screens become inaccessible.

