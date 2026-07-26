import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icon marker assets
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const customIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface Hotspot {
  id: string;
  fir_no: string;
  crime_head: string;
  latitude: number;
  longitude: number;
}

interface CrimeMapProps {
  hotspots: Hotspot[];
  center?: [number, number];
  zoom?: number;
}

export const CrimeMap: React.FC<CrimeMapProps> = ({
  hotspots,
  center = [12.9716, 77.5946], // Default Bengaluru Lat/Lng
  zoom = 11
}) => {
  return (
    <div className="w-full h-full min-h-[400px] border border-police-border rounded-xl overflow-hidden relative z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Station Hotspot Radius Circles */}
        <Circle
          center={[13.0324, 77.5186]}
          radius={2000}
          pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.15 }}
        />
        <Circle
          center={[12.3051, 76.6551]}
          radius={1800}
          pathOptions={{ color: '#D97706', fillColor: '#D97706', fillOpacity: 0.15 }}
        />

        {hotspots.map(h => (
          <Marker key={h.id} position={[h.latitude, h.longitude]} icon={customIcon}>
            <Popup>
              <div className="text-xs p-1 space-y-1 font-mono text-slate-900">
                <div className="font-bold border-b pb-1">{h.fir_no}</div>
                <div className="text-blue-700 font-semibold">{h.crime_head}</div>
                <div className="text-[10px] text-slate-600">Lat: {h.latitude.toFixed(4)}, Lng: {h.longitude.toFixed(4)}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
