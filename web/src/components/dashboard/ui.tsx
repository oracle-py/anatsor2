'use client';

import Link from 'next/link';
import { ArrowUpRight, Bird, Camera, Droplets, MapPin, Thermometer, Wind } from 'lucide-react';
import type { FarmRecord } from '@/lib/farms-data';
import { farmPath, stateColor } from '@/lib/farms-data';
import { Reading, activeAlarms } from '@/lib/simulation';

export function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode }) {
  return <div className="farm-page-heading"><div>{eyebrow && <p className="farm-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{children && <div className="farm-heading-actions">{children}</div>}</div>;
}

export function StatCard({ icon, label, value, caption, danger }: { icon: React.ReactNode; label: string; value: React.ReactNode; caption?: string; danger?: boolean }) {
  return <article className="farm-metric"><div className="metric-top"><p>{label}</p><span>{icon}</span></div><p className="metric-value">{value}</p>{caption && <p className={`metric-caption ${danger ? 'danger-text' : ''}`}>{caption}</p>}</article>;
}

export function Panel({ title, subtitle, icon, actions, children, className = '', id }: { title: string; subtitle?: string; icon?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  return <section className={`farm-panel ${className}`} id={id} aria-label={title}>
    <div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{actions || (icon && <span>{icon}</span>)}</div>
    {children}
  </section>;
}

export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <div className="segmented" role="radiogroup" aria-label={label}>
    {options.map(option => <button key={option.value} type="button" role="radio" aria-checked={value === option.value} className={value === option.value ? 'active' : ''} onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div>;
}

export function StateSwatch({ state }: { state: string | null }) {
  return <span className="state-swatch" style={{ background: stateColor(state) }} aria-hidden="true" />;
}

export function StatusPill({ reading }: { reading?: Reading }) {
  const alarms = activeAlarms(reading || null);
  if (!reading) return <span className="farm-status neutral">—</span>;
  return <span className={`farm-status ${alarms.length ? 'danger' : 'healthy'}`} title={alarms.join(', ') || 'All readings within range'}>{alarms.length ? 'ATTENTION' : 'NORMAL'}</span>;
}

export function FarmCard({ farm, reading }: { farm: FarmRecord; reading?: Reading }) {
  const alarms = activeAlarms(reading || null);
  return <Link href={farmPath(farm)} className={`farm-card ${alarms.length ? 'attention' : ''}`}>
    <div className="farm-card-top">
      <div><h2>{farm.name}</h2><p><MapPin size={12} />{[farm.location, `${farm.state} State`].filter(Boolean).join(', ')}</p></div>
      <StatusPill reading={reading} />
    </div>
    <div className="farm-card-readings">
      <ReadingValue icon={<Thermometer size={14} />} value={reading?.temperature} unit="°C" danger={reading?.temperature_high || reading?.temperature_low} />
      <ReadingValue icon={<Droplets size={14} />} value={reading?.humidity} unit="%" danger={reading?.humidity_high || reading?.humidity_low} />
      <ReadingValue icon={<Wind size={14} />} value={reading?.air_quality} unit="ppm" danger={reading?.air_quality_bad} />
    </div>
    {alarms.length > 0 && <p className="alarm-note">{alarms.join(' · ')}</p>}
    <div className="farm-card-footer">
      <span><Bird size={13} />{(farm.bird_count || 0).toLocaleString()} birds</span>
      {farm.has_camera && <span><Camera size={13} />AI camera</span>}
      <span className="farm-card-link">Open <ArrowUpRight size={13} /></span>
    </div>
  </Link>;
}

function ReadingValue({ icon, value, unit, danger }: { icon: React.ReactNode; value?: number | null; unit: string; danger?: boolean }) {
  return <p className={danger ? 'danger-text' : ''}>{icon}<strong className={danger ? 'danger-text' : ''}>{value == null ? '—' : value.toFixed(1)}</strong><small>{unit}</small></p>;
}
