import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Donation, User } from '@/types';

interface MapViewProps {
  donations?: Donation[];
  ngos?: User[];
  volunteers?: User[];
  onDonationClick?: (d: Donation) => void;
  onNgoClick?: (u: User) => void;
  center?: { lat: number; lng: number };
  height?: string;
  showLegend?: boolean;
}

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createDivIcon(html: string, className: string) {
  return L.divIcon({
    html,
    className,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

export function MapView({
  donations = [],
  ngos = [],
  volunteers = [],
  onDonationClick,
  onNgoClick,
  center = { lat: 12.9716, lng: 77.5946 },
  height = '400px',
  showLegend = true,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    donations.forEach((d) => {
      if (d.status !== 'POSTED' && d.status !== 'CLAIMED') return;
      const isAvailable = d.status === 'POSTED';
      const color = isAvailable ? '#10b981' : '#3b82f6';
      const icon = createDivIcon(
        `<div style="position:relative;width:28px;height:28px;">
          <div style="position:absolute;inset:0;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 12px ${color}80;"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;">🍱</div>
        </div>`,
        'foodbridge-marker',
      );
      const marker = L.marker([d.pickupCoords.lat, d.pickupCoords.lng], { icon }).addTo(map);
      const expiryMin = Math.max(0, Math.floor((new Date(d.expiresAt).getTime() - Date.now()) / 60000));
      marker.bindPopup(`
        <div style="padding:12px;min-width:200px;font-family:'Plus Jakarta Sans',sans-serif;">
          <div style="font-weight:700;font-size:14px;color:#e2e8f0;margin-bottom:4px;">${d.foodName}</div>
          <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">${d.donorName}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
            <span style="background:rgba(16,185,129,0.15);color:#34d399;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;">${d.meals} meals</span>
            <span style="background:rgba(249,115,22,0.15);color:#fb923c;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;">${d.distanceKm} km</span>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">Expires in ${expiryMin} min</div>
          ${isAvailable && onDonationClick ? `<button onclick="window.__foodbridgeClaim('${d.id}')" style="width:100%;background:#10b981;color:white;border:none;padding:8px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;">Claim Donation</button>` : '<div style="text-align:center;color:#60a5fa;font-size:12px;font-weight:600;">Claimed</div>'}
        </div>
      `);
      marker.on('popupopen', () => {
        if (onDonationClick) {
          (window as unknown as { __foodbridgeClaim: (id: string) => void }).__foodbridgeClaim = (id: string) => {
            const donation = donations.find((dd) => dd.id === id);
            if (donation) onDonationClick(donation);
          };
        }
      });
    });

    ngos.forEach((n) => {
      if (n.role !== 'ngo') return;
      const color = n.verified === 'verified' ? '#3b82f6' : '#facc15';
      const icon = createDivIcon(
        `<div style="position:relative;width:28px;height:28px;">
          <div style="position:absolute;inset:0;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 12px ${color}80;"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;">🏠</div>
        </div>`,
        'foodbridge-marker',
      );
      const marker = L.marker([n.coords.lat, n.coords.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="padding:12px;min-width:200px;font-family:'Plus Jakarta Sans',sans-serif;">
          <div style="font-weight:700;font-size:14px;color:#e2e8f0;margin-bottom:4px;">${n.name}</div>
          <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;">${n.location}</div>
          <span style="background:rgba(59,130,246,0.15);color:#60a5fa;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;">${n.verified === 'verified' ? '✓ Verified' : 'Pending'}</span>
          <div style="font-size:11px;color:#94a3b8;margin-top:8px;">Capacity: ${n.capacity || 0} meals</div>
        </div>
      `);
      if (onNgoClick) marker.on('click', () => onNgoClick(n));
    });

    volunteers.forEach((v) => {
      if (v.role !== 'volunteer') return;
      const icon = createDivIcon(
        `<div style="position:relative;width:28px;height:28px;">
          <div style="position:absolute;inset:0;background:#f97316;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 12px #f9731680;"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;">🚴</div>
        </div>`,
        'foodbridge-marker',
      );
      const marker = L.marker([v.coords.lat, v.coords.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="padding:12px;min-width:180px;font-family:'Plus Jakarta Sans',sans-serif;">
          <div style="font-weight:700;font-size:14px;color:#e2e8f0;">${v.name}</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:4px;">${v.vehicleType} • ${v.totalDeliveries} deliveries</div>
          <div style="font-size:11px;color:#f59e0b;margin-top:4px;">★ ${v.rating}</div>
        </div>
      `);
    });
  }, [donations, ngos, volunteers, onDonationClick, onNgoClick]);

  return (
    <div className="relative">
      <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden" />
      {showLegend && (
        <div className="absolute bottom-4 left-4 glass-card rounded-xl shadow-float px-4 py-3 z-[1000] flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-500 shadow-glow" /> Available Donation</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" /> Verified NGO</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-accent-500" /> Volunteer</div>
        </div>
      )}
    </div>
  );
}
