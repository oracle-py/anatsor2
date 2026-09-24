# AIPMS Security Requirements

## Credentials

- Rotate the MQTT device password that appeared in earlier development material.
- Store MQTT credentials only on the UNO Q and trusted bridge infrastructure.
- Use only the Supabase public/anonymous key in the client.
- Keep the Supabase service-role key and database credentials on trusted servers.
- Do not commit `.env` files or secrets.

## Supabase ownership

- Enable Row Level Security on all user/device data tables.
- A user may select readings only for devices they own.
- A user may select and modify only their own daily records.
- Device claiming must occur through an atomic, security-definer database function or equivalent trusted server operation.
- The claim operation must reject unknown and already-owned device IDs.
- The Railway bridge authenticates separately and is the only component allowed to insert device telemetry broadly.

## MQTT

- Keep HiveMQ authentication enabled.
- Use TLS.
- Restrict each device identity to its own topic namespace through broker permissions where possible.
- Validate payload size, type, numeric ranges and device registration before database insertion.
- Do not trust the MQTT topic alone; reconcile the authenticated device identity and payload device identity if both exist.

## Local network

- Treat local-device responses as untrusted input.
- Time out health checks and stream attempts.
- Validate the configured host/address.
- Scope Android cleartext/local-network exceptions narrowly.
- Do not silently send user credentials, Supabase tokens or private cloud data to the local device.

## Privacy

- Do not upload continuous video by default.
- If snapshots or detections are later uploaded, obtain explicit product consent and define retention.
- Avoid exposing farm location, local IP addresses or camera URLs in logs and analytics.

## Prohibited shortcuts

- No service-role key in the app.
- No anonymous public MQTT broker.
- No client-side direct reassignment of device ownership.
- No fabricated AI insights presented as measured facts.
- No remote control buttons until firmware, authorization, acknowledgement and fail-safe behaviour are intentionally designed.

