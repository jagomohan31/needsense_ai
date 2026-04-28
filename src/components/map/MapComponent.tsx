'use client';
import { useEffect, useRef } from 'react';
import type { NeedRequest } from '@/types';
import { getUrgencyMapColor, getCategoryEmoji } from '@/lib/utils';

interface Props {
  requests: NeedRequest[];
  onSelectRequest: (req: NeedRequest) => void;
  selectedRequest: NeedRequest | null;
}

export default function MapComponent({ requests, onSelectRequest, selectedRequest }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let map: unknown = null;

    const initMap = async () => {
      if (!containerRef.current) return;

      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Destroy any existing map on this container
      if ((containerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
        (containerRef.current as unknown as { _leaflet_id?: number })._leaflet_id = undefined;
      }

      const center: [number, number] = [20.5937, 78.9629];

      map = L.map(containerRef.current, {
        center,
        zoom: 5,
        zoomControl: true,
      });

      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map as L.Map);

      // Add markers
      requests.forEach(req => {
        if (!req.location) return;
        const color = getUrgencyMapColor(req.urgencyLevel);
        const emoji = getCategoryEmoji(req.category);
        const isCritical = req.urgencyLevel === 'critical';

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:36px;height:36px;cursor:pointer;">
              ${isCritical ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.3;"></div>` : ''}
              <div style="position:absolute;inset:4px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${emoji}</div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        (L.marker([req.location.lat, req.location.lng], { icon }) as L.Marker)
          .addTo(map as L.Map)
          .on('click', () => onSelectRequest(req));
      });
    };

    initMap();

    return () => {
      if (mapRef.current) {
        (mapRef.current as L.Map).remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
}