'use client';

import dynamic from 'next/dynamic';
import { STATES } from '@/lib/farms-data';
import type { FarmMapProps } from './FarmMapInner';

// Leaflet touches `window`, so the map only renders in the browser.
const FarmMapInner = dynamic(() => import('./FarmMapInner'), {
  ssr: false,
  loading: () => <div className="farm-map-loading">Loading map…</div>,
});

export default function FarmMap(props: FarmMapProps & { states?: string[] }) {
  const shown = STATES.filter(state => !props.states || props.states.includes(state.name));
  return <div className="farm-map-wrap">
    <FarmMapInner {...props} />
    <div className="map-legend" aria-label="Map legend">
      {shown.map(state => <span key={state.slug}><i style={{ background: state.color }} />{state.name}</span>)}
      <span><i className="ring" />Needs attention</span>
      <span className="map-note">Dot size = flock size · positions approximate</span>
    </div>
  </div>;
}
