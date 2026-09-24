# AIPMS Data Contracts

These contracts describe required meaning. An implementation may adapt exact column names to the existing Supabase schema, but it must preserve ownership and security semantics.

## Profiles

```ts
type Profile = {
  id: string;              // Supabase Auth user UUID
  fullName: string;
  createdAt: string;
};
```

## Devices

```ts
type Device = {
  id: string;              // database UUID
  deviceId: string;        // e.g. AIPMS1234, unique
  ownerUserId: string | null;
  displayName: string;
  localHostname: string | null;
  claimedAt: string | null;
  lastSeenAt: string | null;
  status: 'online' | 'offline' | 'unknown';
};
```

## Sensor readings

```ts
type SensorReading = {
  id: number | string;
  deviceId: string;
  recordedAt: string;
  temperatureC: number | null;
  humidityPercent: number | null;
  airQualityRaw: number | null;
  mqBaseline: number | null;
  fanOn: boolean;
  humidifierOn: boolean;
  alarmActive: boolean;
  tempHigh: boolean;
  tempLow: boolean;
  humHigh: boolean;
  humLow: boolean;
  airBad: boolean;
  aiLastDetection?: string | null;
  aiConfidence?: number | null;
};
```

Existing device telemetry resembles:

```json
{
  "temperature": 27.1,
  "humidity": 78,
  "airQuality": 412,
  "fanOn": true,
  "humidifierOn": false,
  "alarmActive": false,
  "tempHigh": false,
  "tempLow": false,
  "humHigh": false,
  "humLow": false,
  "airBad": false,
  "mqBaseline": 300,
  "ai_last_detection": "chicken",
  "ai_confidence": 0.91
}
```

Normalize this payload in the bridge or repository layer; UI components should not depend directly on mixed snake_case/camelCase transport fields.

## Daily records

```ts
type DailyRecord = {
  id: string;
  deviceId: string;
  ownerUserId: string;
  recordDate: string;       // YYYY-MM-DD in the farm's chosen timezone
  chicksHatched: number;
  birdsBred: number;
  eggsCollected: number;
  mortalityCount: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};
```

Enforce a unique constraint on `(device_id, record_date)` and use an upsert for edits.

## Alerts

```ts
type Alert = {
  id: string;
  deviceId: string;
  type: 'temp_high' | 'temp_low' | 'humidity_high' | 'humidity_low' | 'air_bad' | 'device_offline';
  severity: 'warning' | 'critical';
  startedAt: string;
  resolvedAt: string | null;
  readAt: string | null;    // app acknowledgement only
  message: string;
};
```

## MQTT topics

Initial telemetry topics:

```text
devices/{deviceId}/sensors
devices/{deviceId}/status
```

Expected retained status values:

```text
online
offline
```

No client or backend should introduce command topics in the first release because the UNO Q is not configured to receive remote commands.

## Local Socket.IO events

The existing local prototype uses:

```text
sensor_update
alarm_update
detection
```

Existing client requests include control messages, but the production AIPMS application must not expose or send them. Local integration should subscribe only to monitoring events unless the device firmware is deliberately redesigned later.

## Local camera configuration

```ts
type LocalDeviceConfig = {
  hostname: string;         // e.g. aipms1234.local or a LAN IP
  webUiPort: number;        // default 7000
  cameraPort: number;       // default 4912
  cameraPath: string;       // default /embed
};
```

Validate hostnames/IPs and never permit a remote server to inject arbitrary client-side URLs without validation.

