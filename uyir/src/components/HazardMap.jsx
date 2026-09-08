import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Lucide Icon Marker for Hazards
const createHazardIcon = () => {
  const iconHtml = renderToString(
    <div className="bg-red-500 rounded-full p-1.5 shadow-lg border-2 border-white flex items-center justify-center animate-bounce">
      <AlertTriangle size={20} color="white" />
    </div>
  );
  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

const UserLocationUpdater = ({ setCenter }) => {
  const map = useMap();
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latLng = [pos.coords.latitude, pos.coords.longitude];
          setCenter(latLng);
          map.flyTo(latLng, 14);
        },
        (err) => console.error("Geolocation failed", err)
      );
    }
  }, [map, setCenter]);
  return null;
};

export const HazardMap = ({ hazards, onMarkerClick }) => {
  const [center, setCenter] = useState([11.0513, 76.9414]); // Default to Coimbatore

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm relative z-0">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <UserLocationUpdater setCenter={setCenter} />
        
        {/* Render Hazard Markers */}
        {hazards && hazards.map((hazard) => (
          <Marker 
            key={hazard.id} 
            position={[hazard.latitude, hazard.longitude]}
            icon={createHazardIcon()}
            eventHandlers={{
              click: () => onMarkerClick(hazard)
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};
