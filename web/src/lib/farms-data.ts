// Demo catalog of the 15 Youth4Climate AIPMS deployments (2026).
// Farm records come from the deployment report. Map coordinates are
// APPROXIMATE (placed within the farm's state) until GPS positions are
// collected. Swap this module for a Supabase query when real data is ready.

import type { Farm } from './simulation';

export type FarmRecord = Farm & { lat: number; lng: number };

export type StateInfo = { name: string; slug: string; capital: string; color: string; center: [number, number] };

// Categorical state colors, validated for colour-blind separation on white.
export const STATES: StateInfo[] = [
  { name: 'Benue', slug: 'benue', capital: 'Makurdi', color: '#9A4A1E', center: [7.55, 8.55] },
  { name: 'Plateau', slug: 'plateau', capital: 'Jos', color: '#0E8A74', center: [9.85, 8.9] },
  { name: 'Nasarawa', slug: 'nasarawa', capital: 'Lafia', color: '#B98322', center: [8.55, 8.2] },
];

export const stateBySlug = (slug: string) => STATES.find(state => state.slug === slug.toLowerCase());
export const stateByName = (name: string | null | undefined) => STATES.find(state => state.name === name);
export const stateColor = (name: string | null | undefined) => stateByName(name)?.color || '#776C67';

type Row = [id: string, name: string, state: string, location: string | null, birds: number, installed: string, camera: boolean, lat: number, lng: number, summary: string];

const rows: Row[] = [
  ['AIPMS-BN-001', 'Msendoo Farms', 'Benue', 'Makurdi', 3000, '2026-07-21', false, 7.733, 8.522, 'Improve environmental management within the poultry house and reduce risks from environmental fluctuations.'],
  ['AIPMS-BN-002', 'Wonderlust Farms', 'Benue', null, 2000, '2026-07-21', false, 7.82, 8.71, 'Support more consistent management of poultry house conditions and reduce dependence on manual monitoring.'],
  ['AIPMS-BN-003', 'Dorcas Farms', 'Benue', null, 800, '2026-06-17', false, 7.6, 8.38, 'Identify environmental changes early and respond before they affect poultry health and productivity.'],
  ['AIPMS-BN-004', 'Avadoo Farms', 'Benue', null, 1400, '2026-08-02', false, 7.33, 8.97, 'Improve oversight of poultry house conditions through remote access to farm information.'],
  ['AIPMS-BN-005', 'Amazing Grace Farms', 'Benue', null, 4000, '2026-06-30', true, 7.2, 8.13, 'Strengthen environmental management and poultry house security with camera-based monitoring.'],
  ['AIPMS-BN-006', 'Nanpo Farms', 'Benue', null, 950, '2026-06-05', false, 7.96, 8.29, 'Better control of poultry house conditions and management of environmental risks to flock performance.'],
  ['AIPMS-PL-007', 'Musa Adamu Farms', 'Plateau', null, 500, '2026-08-26', true, 9.93, 8.89, 'Automated environmental control and camera-based monitoring of bird behaviour and potential threats.'],
  ['AIPMS-PL-008', 'Sagira Farms', 'Plateau', null, 2000, '2026-04-01', true, 9.78, 8.82, 'Improve environmental stability with additional monitoring for risks within the poultry house.'],
  ['AIPMS-PL-009', 'Osakuni Farms Limited', 'Plateau', null, 2400, '2026-05-28', false, 9.6, 8.97, 'Reduce constant manual supervision through automatic responses to changing conditions.'],
  ['AIPMS-PL-010', 'Hadi Farms', 'Plateau', null, 700, '2026-09-03', false, 10.05, 8.74, 'Maintain appropriate poultry house conditions and consistent daily environmental management.'],
  ['AIPMS-PL-011', 'Mercy Farms', 'Plateau', null, 2800, '2026-09-19', false, 9.7, 9.2, 'Improve farm supervision and early identification of conditions that could contribute to losses.'],
  ['AIPMS-PL-012', "RIT'S GARDEN FARMS", 'Plateau', null, 1500, '2026-07-04', false, 9.86, 8.68, 'Simplify routine poultry house management and more consistent control of conditions.'],
  ['AIPMS-NS-013', 'Dominion Poultry Farms', 'Nasarawa', null, 3700, '2026-03-16', false, 8.49, 8.52, 'Strengthen environmental monitoring through automated equipment operation.'],
  ['AIPMS-NS-014', 'Glory Sada Farms', 'Nasarawa', null, 700, '2026-03-18', false, 8.9, 7.92, 'Monitor environmental changes and respond promptly to conditions that require attention.'],
  ['AIPMS-NS-015', 'Sisian Farms', 'Nasarawa', null, 4500, '2026-03-28', true, 8.32, 8.24, 'Improve environmental management and monitoring of poultry house activities with an AI-powered camera.'],
];

export const FARMS: FarmRecord[] = rows.map(([id, name, state, location, bird_count, installed_at, has_camera, lat, lng, summary]) => ({
  id, name, state, location, bird_count, installed_at, has_camera, lat, lng, summary,
}));

export const farmById = (id: string) => FARMS.find(farm => farm.id === decodeURIComponent(id));
export const farmPath = (farm: Farm) => `/farms/${stateByName(farm.state)?.slug || 'other'}/${encodeURIComponent(farm.id)}`;
export const formatInstalled = (date: string | null) => date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
