'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Camera, Search } from 'lucide-react';
import type { FarmRecord } from '@/lib/farms-data';
import { farmPath, formatInstalled } from '@/lib/farms-data';
import type { Reading } from '@/lib/simulation';
import { StateSwatch, StatusPill } from './ui';

type SortKey = 'name' | 'state' | 'bird_count' | 'installed_at' | 'temperature' | 'humidity' | 'air_quality' | 'status';

const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'name', label: 'Farm' },
  { key: 'state', label: 'State' },
  { key: 'bird_count', label: 'Birds', numeric: true },
  { key: 'installed_at', label: 'Installed' },
  { key: 'temperature', label: 'Temp °C', numeric: true },
  { key: 'humidity', label: 'Humidity %', numeric: true },
  { key: 'air_quality', label: 'NH₃ ppm', numeric: true },
  { key: 'status', label: 'Status' },
];

export default function FarmTable({ farms, live, searchable = true }: { farms: FarmRecord[]; live: Record<string, Reading>; searchable?: boolean }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'name', dir: 1 });
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const value = (farm: FarmRecord): string | number => {
      const reading = live[farm.id];
      switch (sort.key) {
        case 'temperature': case 'humidity': case 'air_quality': return reading?.[sort.key] ?? -Infinity;
        case 'status': return reading?.alarm_active ? 1 : 0;
        case 'bird_count': return farm.bird_count || 0;
        default: return (farm[sort.key] || '') as string;
      }
    };
    const q = query.trim().toLowerCase();
    return farms
      .filter(farm => !q || `${farm.name} ${farm.state} ${farm.location || ''} ${farm.id}`.toLowerCase().includes(q))
      .sort((a, b) => {
        const x = value(a), y = value(b);
        return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * sort.dir;
      });
  }, [farms, live, sort, query]);

  const toggle = (key: SortKey) => setSort(previous => previous.key === key ? { key, dir: previous.dir === 1 ? -1 : 1 } : { key, dir: columns.find(c => c.key === key)?.numeric ? -1 : 1 });

  return <div>
    {searchable && <label className="table-search"><Search size={15} /><span className="sr-only">Search farms</span><input type="search" placeholder="Search farms, states or device IDs" value={query} onChange={event => setQuery(event.target.value)} /></label>}
    <div className="table-scroll">
      <table className="farm-table">
        <thead><tr>{columns.map(column => <th key={column.key} scope="col" className={column.numeric ? 'num' : ''} aria-sort={sort.key === column.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
          <button type="button" onClick={() => toggle(column.key)}>{column.label}{sort.key === column.key && (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button>
        </th>)}</tr></thead>
        <tbody>
          {rows.map(farm => {
            const reading = live[farm.id];
            return <tr key={farm.id}>
              <th scope="row"><Link href={farmPath(farm)}>{farm.name}</Link><small>{farm.id}{farm.has_camera && <> · <Camera size={11} aria-label="AI camera" /></>}</small></th>
              <td><span className="state-cell"><StateSwatch state={farm.state} />{farm.state}</span></td>
              <td className="num">{(farm.bird_count || 0).toLocaleString()}</td>
              <td>{formatInstalled(farm.installed_at)}</td>
              <td className={`num ${reading?.temperature_high || reading?.temperature_low ? 'danger-text' : ''}`}>{reading?.temperature?.toFixed(1) ?? '—'}</td>
              <td className={`num ${reading?.humidity_high || reading?.humidity_low ? 'danger-text' : ''}`}>{reading?.humidity?.toFixed(1) ?? '—'}</td>
              <td className={`num ${reading?.air_quality_bad ? 'danger-text' : ''}`}>{reading?.air_quality?.toFixed(1) ?? '—'}</td>
              <td><StatusPill reading={reading} /></td>
            </tr>;
          })}
          {!rows.length && <tr><td colSpan={columns.length} className="table-empty">No farms match “{query}”.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>;
}
