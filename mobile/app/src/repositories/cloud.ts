import { supabase } from '../lib/supabase';
import type { Alert, DailyRecord, Reading } from '../types';

export async function claimDevice(deviceId: string, displayName?: string) {
  const { data, error } = await supabase.rpc('claim_device', { requested_device_id: deviceId.trim().toUpperCase(), requested_name: displayName?.trim() || null });
  if (error) throw error;
  return data;
}
export async function latestReading(deviceId: string) {
  const { data, error } = await supabase.from('sensor_readings').select('*').eq('device_id', deviceId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error; return data as Reading | null;
}
export function subscribeToReadings(deviceId: string, onReading: (reading: Reading) => void) {
  const channel = supabase.channel(`mobile-readings-${deviceId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings', filter: `device_id=eq.${deviceId}` }, payload => onReading(payload.new as Reading)).subscribe();
  return () => { supabase.removeChannel(channel); };
}
export async function listRecords(deviceId: string) { const { data, error } = await supabase.from('daily_records').select('*').eq('device_id', deviceId).order('record_date', { ascending: false }); if (error) throw error; return data as DailyRecord[]; }
export async function saveRecord(input: Pick<DailyRecord, 'device_id' | 'record_date' | 'chicks_hatched' | 'birds_bred' | 'eggs_collected' | 'mortality_count' | 'note'>) { const { data: auth } = await supabase.auth.getUser(); if (!auth.user) throw new Error('Your session expired.'); const { data, error } = await supabase.from('daily_records').upsert({ ...input, owner_user_id: auth.user.id, updated_at: new Date().toISOString() }, { onConflict: 'device_id,record_date' }).select().single(); if (error) throw error; return data as DailyRecord; }
export async function listAlerts(deviceId: string) { const { data, error } = await supabase.from('alerts').select('*').eq('device_id', deviceId).order('started_at', { ascending: false }).limit(50); if (error) throw error; return data as Alert[]; }
