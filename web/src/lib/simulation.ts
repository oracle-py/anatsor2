// Deterministic demo simulation for AIPMS farm readings.
//
// Every value is a pure function of (farm, time): all viewers see the same
// numbers, history and "live" values join without a seam, and
// supabase/seed_farms.sql uses the same formulas to pre-populate
// sensor_readings. If you change a formula here, change it there too.

export type Farm = {
  id: string;
  name: string;
  state: string | null;
  location: string | null;
  bird_count: number | null;
  installed_at: string | null;
  has_camera: boolean | null;
  summary?: string | null;
  status?: string;
  last_seen_at?: string;
};

/** Columns selected from public.devices for farm views. */
export const FARM_COLUMNS = 'id,name,state,location,bird_count,installed_at,has_camera,summary,status,last_seen_at';

export type Reading = {
  id?: number;
  device_id: string;
  temperature: number | null;
  humidity: number | null;
  air_quality: number | null;
  fan_on: boolean;
  humidifier_on: boolean;
  alarm_active: boolean;
  temperature_high: boolean;
  temperature_low: boolean;
  humidity_high: boolean;
  humidity_low: boolean;
  air_quality_bad: boolean;
  camera_live: boolean | null;
  detection_label: 'rat' | 'snake' | null;
  detection_confidence: number | null;
  detection_at: string | null;
  created_at: string;
};

const TAU = Math.PI * 2;
const MIN = 60_000;
const HOUR = 60 * MIN;

/** Spacing of historical samples (matches the SQL seed). */
export const SIM_STEP_MS = 10 * MIN;
/** How often the UI recomputes the live reading. */
export const LIVE_TICK_MS = 5_000;
const DETECTION_BUCKET_MS = 3 * HOUR;

export const THRESHOLDS = { tempHigh: 32, tempLow: 18, humidityHigh: 80, humidityLow: 40, airBad: 22 };

const PROFILES: Record<string, { t: number; ta: number; h: number; ha: number }> = {
  Benue: { t: 29, ta: 3.5, h: 66, ha: 9 },
  Nasarawa: { t: 28.5, ta: 3.5, h: 62, ha: 9 },
  Plateau: { t: 22.5, ta: 4, h: 60, ha: 10 }, // Jos Plateau runs noticeably cooler
};

/** Pseudo-random value in [0, 1). Same formula as aipms_hash01() in SQL. */
export function hash01(x: number) {
  const v = Math.sin(x) * 43758.5453;
  return v - Math.floor(v);
}

/** Farm seed = trailing number of the device ID (AIPMS-BN-003 → 3). */
export function farmSeed(id: string) {
  const digits = id.replace(/\D/g, '').slice(-3);
  return Number(digits) || 1;
}

/** Smooth drift in roughly [-1, 1] made of incommensurate sine waves. */
function wave(seed: number, t: number) {
  const p = (k: number) => hash01(seed * 13.7 + k) * TAU;
  return (
    0.5 * Math.sin((TAU * t) / (47 * MIN) + p(1)) +
    0.8 * Math.sin((TAU * t) / (3.1 * HOUR) + p(2)) +
    1.0 * Math.sin((TAU * t) / (17 * HOUR) + p(3)) +
    1.2 * Math.sin((TAU * t) / (65 * HOUR) + p(4))
  ) / 3.5;
}

/** Small sensor noise that changes every 5 seconds, in [-0.5, 0.5). */
function jitter(seed: number, t: number) {
  return hash01(seed * 7.31 + Math.floor(t / 5000)) - 0.5;
}

const round = (x: number, digits: number) => Math.round(x * 10 ** digits) / 10 ** digits;
const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

export function simulateReading(farm: Farm, t: number): Reading {
  const seed = farmSeed(farm.id);
  const profile = PROFILES[farm.state || ''] || PROFILES.Benue;
  const birds = farm.bird_count || 1000;

  // Nigeria is UTC+1; temperature peaks around 15:00 local time.
  const localHour = (((t / HOUR + 1) % 24) + 24) % 24;
  const day = Math.cos((TAU * (localHour - 15)) / 24);

  const temperature = round(profile.t + profile.ta * day + 2.6 * wave(seed, t) + 0.3 * jitter(seed, t), 1);
  const humidity = round(clamp(profile.h - profile.ha * day + 9 * wave(seed + 100, t) + 0.8 * jitter(seed + 100, t), 25, 95), 1);
  const air = round(clamp(7 + (9 * birds) / 4500 + 2.5 * Math.max(0, -day) + 6 * wave(seed + 200, t) + 0.5 * jitter(seed + 200, t), 2, 60), 1);

  const temperature_high = temperature > THRESHOLDS.tempHigh;
  const temperature_low = temperature < THRESHOLDS.tempLow;
  const humidity_high = humidity > THRESHOLDS.humidityHigh;
  const humidity_low = humidity < THRESHOLDS.humidityLow;
  const air_quality_bad = air > THRESHOLDS.airBad;

  return {
    device_id: farm.id,
    temperature,
    humidity,
    air_quality: air,
    fan_on: temperature > 30 || air > 18,
    humidifier_on: humidity < 50,
    alarm_active: temperature_high || temperature_low || humidity_high || humidity_low || air_quality_bad,
    temperature_high,
    temperature_low,
    humidity_high,
    humidity_low,
    air_quality_bad,
    camera_live: farm.has_camera ? hash01(seed * 3.3 + Math.floor(t / (6 * HOUR))) > 0.05 : null,
    detection_label: null,
    detection_confidence: null,
    detection_at: null,
    created_at: new Date(t).toISOString(),
  };
}

function detectionInBucket(farm: Farm, bucket: number): Reading | null {
  const seed = farmSeed(farm.id);
  if (hash01(seed * 31.3 + bucket) >= 0.15) return null;
  const at = bucket * DETECTION_BUCKET_MS + Math.floor(hash01(seed * 17.9 + bucket) * DETECTION_BUCKET_MS);
  return {
    ...simulateReading(farm, at),
    detection_label: hash01(seed * 5.7 + bucket) < 0.8 ? 'rat' : 'snake',
    detection_confidence: round(0.7 + 0.27 * hash01(seed * 11.3 + bucket), 2),
    detection_at: new Date(at).toISOString(),
  };
}

/** Simulated rat/snake detections in (from, to], newest first. Camera farms only. */
export function detectionsBetween(farm: Farm, from: number, to: number): Reading[] {
  if (!farm.has_camera || to <= from) return [];
  const result: Reading[] = [];
  for (let b = Math.floor(to / DETECTION_BUCKET_MS); b >= Math.floor(from / DETECTION_BUCKET_MS); b--) {
    const detection = detectionInBucket(farm, b);
    if (!detection) continue;
    const at = Date.parse(detection.detection_at!);
    if (at > from && at <= to) result.push(detection);
  }
  return result;
}

const installedAt = (farm: Farm) => (farm.installed_at ? Date.parse(farm.installed_at) : -Infinity);

/**
 * Stored readings for the window, topped up with simulated samples from the
 * last stored reading up to `now`, ending with a live sample at `now`.
 */
export function buildHistory(farm: Farm, stored: Reading[], now: number, windowMs = 24 * HOUR): Reading[] {
  const from = Math.max(now - windowMs, installedAt(farm));
  const rows = stored
    .filter(row => Date.parse(row.created_at) >= from && Date.parse(row.created_at) <= now)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  const last = rows.length ? Date.parse(rows[rows.length - 1].created_at) : from - 1;
  for (let t = Math.floor(last / SIM_STEP_MS) * SIM_STEP_MS + SIM_STEP_MS; t < now; t += SIM_STEP_MS) {
    if (t >= from) rows.push(simulateReading(farm, t));
  }
  rows.push(simulateReading(farm, now));
  return rows.slice(-300);
}

/** Stored detections merged with simulated ones after the newest stored reading. */
export function mergeDetections(farm: Farm, stored: Reading[], latestStoredAt: number | null, now: number, limit = 10) {
  const from = Math.max(latestStoredAt ?? now - 7 * 24 * HOUR, now - 7 * 24 * HOUR, installedAt(farm));
  const time = (row: Reading) => Date.parse(row.detection_at || row.created_at);
  return [...detectionsBetween(farm, from, now), ...stored]
    .sort((a, b) => time(b) - time(a))
    .slice(0, limit);
}

export function activeAlarms(reading: Reading | null) {
  if (!reading) return [];
  return [
    reading.temperature_high && 'High temperature',
    reading.temperature_low && 'Low temperature',
    reading.humidity_high && 'High humidity',
    reading.humidity_low && 'Low humidity',
    reading.air_quality_bad && 'Poor air quality / high ammonia',
  ].filter((alarm): alarm is string => Boolean(alarm));
}
