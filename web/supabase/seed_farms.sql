-- AIPMS demo: 15 Youth4Climate farms + 7 days of simulated readings.
--
-- Before running:
--   1. Run supabase/schema.sql.
--   2. Create the admin account (Supabase → Authentication → Users → Add user).
--   3. Replace REPLACE_WITH_ADMIN_EMAIL below with that account's email.
--
-- Safe to re-run: farms are upserted and their readings are regenerated
-- so the history always ends "now". The formulas mirror src/lib/simulation.ts.

alter table public.devices
  add column if not exists state text,
  add column if not exists location text,
  add column if not exists bird_count integer,
  add column if not exists installed_at date,
  add column if not exists has_camera boolean not null default false,
  add column if not exists summary text;

create or replace function public.aipms_hash01(x double precision)
returns double precision language sql immutable as $$
  select (sin(x) * 43758.5453) - floor(sin(x) * 43758.5453);
$$;

create or replace function public.aipms_wave(seed double precision, t double precision)
returns double precision language sql immutable as $$
  select (
      0.5 * sin(2 * pi() * t / (47 * 60000.0)      + public.aipms_hash01(seed * 13.7 + 1) * 2 * pi())
    + 0.8 * sin(2 * pi() * t / (3.1 * 3600000.0)   + public.aipms_hash01(seed * 13.7 + 2) * 2 * pi())
    + 1.0 * sin(2 * pi() * t / (17 * 3600000.0)    + public.aipms_hash01(seed * 13.7 + 3) * 2 * pi())
    + 1.2 * sin(2 * pi() * t / (65 * 3600000.0)    + public.aipms_hash01(seed * 13.7 + 4) * 2 * pi())
  ) / 3.5;
$$;

create or replace function public.aipms_jitter(seed double precision, t double precision)
returns double precision language sql immutable as $$
  select public.aipms_hash01(seed * 7.31 + floor(t / 5000)) - 0.5;
$$;

do $$
declare
  admin_email text := 'REPLACE_WITH_ADMIN_EMAIL';
  admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = lower(admin_email);
  if admin_id is null then
    raise exception 'No user with email %. Create the admin account first, then re-run.', admin_email;
  end if;

  insert into public.devices (id, owner_user_id, name, state, location, bird_count, installed_at, has_camera, summary, claimed_at, status, last_seen_at)
  values
    ('AIPMS-BN-001', admin_id, 'Msendoo Farms',          'Benue',    'Makurdi', 3000, '2026-07-21', false, 'Improve environmental management within the poultry house and reduce risks from environmental fluctuations.', now(), 'online', now()),
    ('AIPMS-BN-002', admin_id, 'Wonderlust Farms',       'Benue',    null,      2000, '2026-07-21', false, 'Support more consistent management of poultry house conditions and reduce dependence on manual monitoring.', now(), 'online', now()),
    ('AIPMS-BN-003', admin_id, 'Dorcas Farms',           'Benue',    null,       800, '2026-06-17', false, 'Identify environmental changes early and respond before they affect poultry health and productivity.', now(), 'online', now()),
    ('AIPMS-BN-004', admin_id, 'Avadoo Farms',           'Benue',    null,      1400, '2026-08-02', false, 'Improve oversight of poultry house conditions through remote access to farm information.', now(), 'online', now()),
    ('AIPMS-BN-005', admin_id, 'Amazing Grace Farms',    'Benue',    null,      4000, '2026-06-30', true,  'Strengthen environmental management and poultry house security with camera-based monitoring.', now(), 'online', now()),
    ('AIPMS-BN-006', admin_id, 'Nanpo Farms',            'Benue',    null,       950, '2026-06-05', false, 'Better control of poultry house conditions and management of environmental risks to flock performance.', now(), 'online', now()),
    ('AIPMS-PL-007', admin_id, 'Musa Adamu Farms',       'Plateau',  null,       500, '2026-08-26', true,  'Automated environmental control and camera-based monitoring of bird behaviour and potential threats.', now(), 'online', now()),
    ('AIPMS-PL-008', admin_id, 'Sagira Farms',           'Plateau',  null,      2000, '2026-04-01', true,  'Improve environmental stability with additional monitoring for risks within the poultry house.', now(), 'online', now()),
    ('AIPMS-PL-009', admin_id, 'Osakuni Farms Limited',  'Plateau',  null,      2400, '2026-05-28', false, 'Reduce constant manual supervision through automatic responses to changing conditions.', now(), 'online', now()),
    ('AIPMS-PL-010', admin_id, 'Hadi Farms',             'Plateau',  null,       700, '2026-09-03', false, 'Maintain appropriate poultry house conditions and consistent daily environmental management.', now(), 'online', now()),
    ('AIPMS-PL-011', admin_id, 'Mercy Farms',            'Plateau',  null,      2800, '2026-09-19', false, 'Improve farm supervision and early identification of conditions that could contribute to losses.', now(), 'online', now()),
    ('AIPMS-PL-012', admin_id, 'RIT''S GARDEN FARMS',    'Plateau',  null,      1500, '2026-07-04', false, 'Simplify routine poultry house management and more consistent control of conditions.', now(), 'online', now()),
    ('AIPMS-NS-013', admin_id, 'Dominion Poultry Farms', 'Nasarawa', null,      3700, '2026-03-16', false, 'Strengthen environmental monitoring through automated equipment operation.', now(), 'online', now()),
    ('AIPMS-NS-014', admin_id, 'Glory Sada Farms',       'Nasarawa', null,       700, '2026-03-18', false, 'Monitor environmental changes and respond promptly to conditions that require attention.', now(), 'online', now()),
    ('AIPMS-NS-015', admin_id, 'Sisian Farms',           'Nasarawa', null,      4500, '2026-03-28', true,  'Improve environmental management and monitoring of poultry house activities with an AI-powered camera.', now(), 'online', now())
  on conflict (id) do update set
    owner_user_id = excluded.owner_user_id, name = excluded.name, state = excluded.state,
    location = excluded.location, bird_count = excluded.bird_count, installed_at = excluded.installed_at,
    has_camera = excluded.has_camera, summary = excluded.summary, status = 'online', last_seen_at = now(),
    claimed_at = coalesce(public.devices.claimed_at, now());

  delete from public.sensor_readings where device_id ~ '^AIPMS-(BN|PL|NS)-0[0-9]{2}$';

  insert into public.sensor_readings (
    device_id, temperature, humidity, air_quality, fan_on, humidifier_on, alarm_active,
    temperature_high, temperature_low, humidity_high, humidity_low, air_quality_bad,
    camera_live, detection_label, detection_confidence, detection_at, created_at)
  with farms as (
    select d.id, d.has_camera, d.installed_at, coalesce(d.bird_count, 1000) as birds,
      coalesce(nullif(right(regexp_replace(d.id, '\D', '', 'g'), 3), '')::int, 1)::double precision as seed,
      case d.state when 'Plateau' then 22.5 when 'Nasarawa' then 28.5 else 29   end as pt,
      case d.state when 'Plateau' then 4    else 3.5 end                            as pta,
      case d.state when 'Plateau' then 60   when 'Nasarawa' then 62   else 66   end as ph,
      case d.state when 'Plateau' then 10   else 9   end                            as pha
    from public.devices d
    where d.id ~ '^AIPMS-(BN|PL|NS)-0[0-9]{2}$'
  ), samples as (
    select f.*, ts, extract(epoch from ts)::double precision * 1000 as t
    from farms f,
      generate_series(to_timestamp(floor(extract(epoch from now()) / 600) * 600) - interval '7 days', now(), interval '10 minutes') ts
    where f.installed_at is null or ts >= f.installed_at
  ), values_ as (
    select s.*,
      -- Nigeria is UTC+1; temperature peaks around 15:00 local time.
      cos(2 * pi() * (s.t / 3600000.0 + 1 - 15) / 24) as day,
      floor(s.t / 10800000.0) as bucket
    from samples s
  ), readings as (
    select v.*,
      round((v.pt + v.pta * v.day + 2.6 * public.aipms_wave(v.seed, v.t) + 0.3 * public.aipms_jitter(v.seed, v.t))::numeric, 1) as temperature,
      round(greatest(25, least(95, v.ph - v.pha * v.day + 9 * public.aipms_wave(v.seed + 100, v.t) + 0.8 * public.aipms_jitter(v.seed + 100, v.t)))::numeric, 1) as humidity,
      round(greatest(2, least(60, 7 + 9 * v.birds / 4500.0 + 2.5 * greatest(0, -v.day) + 6 * public.aipms_wave(v.seed + 200, v.t) + 0.5 * public.aipms_jitter(v.seed + 200, v.t)))::numeric, 1) as air,
      v.bucket * 10800000 + floor(public.aipms_hash01(v.seed * 17.9 + v.bucket) * 10800000) as detection_ms,
      v.has_camera and public.aipms_hash01(v.seed * 31.3 + v.bucket) < 0.15 as bucket_has_detection
    from values_ v
  ), final as (
    select r.*,
      r.bucket_has_detection and r.detection_ms >= r.t and r.detection_ms < r.t + 600000 as detected
    from readings r
  )
  select
    id, temperature, humidity, air,
    temperature > 30 or air > 18,
    humidity < 50,
    temperature > 32 or temperature < 18 or humidity > 80 or humidity < 40 or air > 22,
    temperature > 32, temperature < 18, humidity > 80, humidity < 40, air > 22,
    case when has_camera then public.aipms_hash01(seed * 3.3 + floor(t / 21600000.0)) > 0.05 end,
    case when detected then case when public.aipms_hash01(seed * 5.7 + bucket) < 0.8 then 'rat' else 'snake' end end,
    case when detected then round((0.7 + 0.27 * public.aipms_hash01(seed * 11.3 + bucket))::numeric, 2) end,
    case when detected then to_timestamp(detection_ms / 1000.0) end,
    ts
  from final;
end;
$$;
