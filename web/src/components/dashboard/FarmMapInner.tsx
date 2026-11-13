'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import Link from 'next/link';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { latLngBounds } from 'leaflet';
import type { FarmRecord } from '@/lib/farms-data';
import { farmPath, stateColor } from '@/lib/farms-data';
import { Reading, activeAlarms } from '@/lib/simulation';

export type FarmMapProps = { farms: FarmRecord[]; live: Record<string, Reading>; height?: number };

function FitBounds({ farms }: { farms: FarmRecord[] }) {
  const map = useMap();
  const key = farms.map(farm => farm.id).join();
  useEffect(() => {
    if (!farms.length) return;
    map.fitBounds(latLngBounds(farms.map(farm => [farm.lat, farm.lng])), { padding: [36, 36], maxZoom: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export default function FarmMapInner({ farms, live, height = 420 }: FarmMapProps) {
  return <MapContainer center={[8.6, 8.6]} zoom={7} scrollWheelZoom={false} style={{ height, width: '100%' }} className="farm-map" attributionControl>
    <TileLayer
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      maxZoom={18}
    />
    <FitBounds farms={farms} />
    {farms.map(farm => {
      const reading = live[farm.id];
      const alarms = activeAlarms(reading || null);
      const radius = 7 + Math.sqrt((farm.bird_count || 0) / 4500) * 9;
      return <CircleMarker key={farm.id} center={[farm.lat, farm.lng]} radius={radius}
        pathOptions={{ color: alarms.length ? '#b91c1c' : '#ffffff', weight: alarms.length ? 3 : 2, fillColor: stateColor(farm.state), fillOpacity: 0.9 }}>
        <Tooltip direction="top" offset={[0, -radius]}>{farm.name}</Tooltip>
        <Popup>
          <div className="map-popup">
            <strong>{farm.name}</strong>
            <span>{farm.state} State · {(farm.bird_count || 0).toLocaleString()} birds</span>
            {reading && <span>{reading.temperature?.toFixed(1)}°C · {reading.humidity?.toFixed(1)}% · {reading.air_quality?.toFixed(1)} ppm</span>}
            <span className={alarms.length ? 'danger-text' : 'healthy-text'}>{alarms.length ? alarms.join(', ') : 'All readings within range'}</span>
            <Link href={farmPath(farm)}>Open farm →</Link>
          </div>
        </Popup>
      </CircleMarker>;
    })}
  </MapContainer>;
}
