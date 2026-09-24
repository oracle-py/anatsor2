# AIPMS mobile app

Expo Router application for Android, web and later iOS. Cloud data comes from
Supabase; MQTT credentials remain on the UNO Q and bridge. Camera video and
Socket.IO detections connect directly to the UNO Q on the farm LAN.

## Prerequisites

- Node.js 22.13 or newer (required by Expo SDK 57)
- A Supabase project
- The shared schema in `../../web/supabase/schema.sql`
- The MQTT bridge in `../../backend/worker.py`

## Setup

1. Copy `.env.example` to `.env` and enter the Supabase project URL and public
   anon/publishable key. Never put a service-role key or MQTT password here.
2. Run the shared schema in the Supabase SQL editor.
3. Provision each physical unit before it can be claimed:

   ```sql
   insert into public.devices (id, name, status, local_hostname)
   values ('AIPMS1234', 'Main poultry house', 'offline', 'aipms1234.local')
   on conflict (id) do nothing;
   ```

4. Install and start:

   ```bash
   npm install
   npx expo start
   ```

## Data paths

- Telemetry: UNO Q → HiveMQ TLS → Railway worker → Supabase → app Realtime.
- Camera: app → farm Wi-Fi → `http://<local-host>:4912/embed`.
- Local detections: app → farm Wi-Fi → Socket.IO on port `7000`.

The cloud dashboard shows the same finalized fields as the website: readings,
all environmental flags, automatic equipment states, human-readable alarm
types, camera live status and rat/snake detections. Buzzer patterns are not
sent to or displayed by clients.

## Local HTTP note

The final Android network-security rule must be added after the board hostname
and native build profile are finalized. It should allow cleartext traffic only
to the farm-local hostname, not globally. Cloud monitoring works independently
when the local camera is unreachable.
