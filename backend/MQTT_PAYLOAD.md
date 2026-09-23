# AIPMS sensor payload

Publish JSON to `devices/<DEVICE_ID>/sensors`. `<DEVICE_ID>` must exactly match
the ID registered by the user on the website (for example, `AIPMS1234`).

```json
{
  "temperature": 28.4,
  "humidity": 61.0,
  "airQuality": 12.6,
  "tempHigh": false,
  "tempLow": false,
  "humHigh": false,
  "humLow": false,
  "airBad": false,
  "fanOn": false,
  "humidifierOn": false,
  "alarmActive": false,
  "cameraLive": true,
  "detectionLabel": null,
  "detectionConfidence": null,
  "detectionAt": null
}
```

When the camera detects a relevant threat, send only `rat` or `snake`:

```json
{
  "cameraLive": true,
  "detectionLabel": "rat",
  "detectionConfidence": 0.91,
  "detectionAt": "2026-09-23T12:30:00Z"
}
```

The bridge also accepts the Arduino's current `ai_last_detection` and
`ai_confidence` property names. Any label other than `rat` or `snake` is
discarded. Buzzer patterns remain internal to the device; the website derives
human-readable alarm types from the condition flags.

The bridge inserts readings only when the topic's device ID exists in the
Supabase `devices` table. It does not use the human-readable device name for
matching.
