'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FARMS, FarmRecord } from '@/lib/farms-data';
import { LIVE_TICK_MS, Reading, simulateReading } from '@/lib/simulation';

type FarmData = {
  farms: FarmRecord[];
  /** Current time, refreshed every LIVE_TICK_MS. Null before hydration. */
  now: number | null;
  /** Live reading per farm id. Empty before hydration. */
  live: Record<string, Reading>;
  user: { name: string; email: string };
};

const FarmDataContext = createContext<FarmData | null>(null);

export function FarmDataProvider({ user, children }: { user: FarmData['user']; children: React.ReactNode }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), LIVE_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const value = useMemo<FarmData>(() => {
    const live: Record<string, Reading> = {};
    if (now) for (const farm of FARMS) live[farm.id] = simulateReading(farm, now);
    return { farms: FARMS, now, live, user };
  }, [now, user]);

  return <FarmDataContext.Provider value={value}>{children}</FarmDataContext.Provider>;
}

export function useFarmData() {
  const value = useContext(FarmDataContext);
  if (!value) throw new Error('useFarmData must be used inside FarmDataProvider');
  return value;
}
