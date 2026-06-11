import React, { useState } from "react";
import { GoogleMap, Marker as GoogleMarker } from "@react-google-maps/api";
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
import styles from "./ReportCard.module.css";

export const ReportCard = ({
  type,
  location,
  longitude,
  latitude,
  date,
  status,
  imageUrl,
}) => {
  const [showMap, setShowMap] = useState(false); // State to toggle map visibility
  const [mapProvider, setMapProvider] = useState("osm");

  const statusClassName = `${styles.status} ${
    status === "Resolved" ? styles.statusFixed : styles.statusPending
  }`;

  // Function to format the address
  const formatAddress = (address) => {
    if (!address) return "Address not available";
    return address.length > 50
      ? address.substring(0, 50) + "..." // Truncate if too long
      : address;
  };

  // Format the date to show only "DD-MM-YYYY"
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Google Maps container style
  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  // Map center position
  const center = {
    lat: latitude,
    lng: longitude,
  };

  console.log("Latitude:", latitude, "Longitude:", longitude);

  return (
    <article className={styles.reportCard}>
      <div className={styles.cardContent}>
        <div className={styles.mainSection}>
          <div className={styles.reportDetails}>
            <div
              className={styles.imageContainer}
              onClick={() => setShowMap(true)} // Show map on image click
              style={{ cursor: "pointer" }}
            >
              <img
                className={styles.reportImage}
                src={
                  imageUrl ||
                  "https://img.freepik.com/premium-photo/map-city-street-cartography-direction-icon-road-town-district-pattern-geography-travel-navigation-plan-downtown-gps-location-place-symbol-navigator-transportation-route-system-background_79161-2128.jpg?semt=ais_hybrid"
                }
                alt={`Road issue: ${type} at ${location}`}
                loading="lazy"
              />
            </div>
            <div className={styles.infoContainer}>
              <div className={styles.reportInfo}>
                <div>Type: {type}</div>
                <div className={styles.location}>
                  Location: {formatAddress(location)}
                </div>
                <div className={styles.coordinates}>
                  <div>Longitude: {longitude}</div>
                  <div>Latitude: {latitude}</div>
                </div>
                <time className={styles.date} dateTime={formattedDate}>
                  Date: {formattedDate}
                </time>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.statusContainer}>
          <div
            className={statusClassName}
            role="status"
            aria-label={`Report status: ${status}`}
          >
            {status}
          </div>
        </div>
      </div>

      {/* Map Popup */}
      {showMap && (
        <div className={styles.mapOverlay}>
          <div className={styles.mapContainer} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#e5e7eb', padding: '4px', borderRadius: '8px' }}>
                <button
                  type="button"
                  style={{ padding: '4px 12px', fontSize: '12px', fontWeight: '500', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: mapProvider === 'osm' ? 'white' : 'transparent', color: mapProvider === 'osm' ? 'var(--primary-color, #1d4ed8)' : '#6b7280', boxShadow: mapProvider === 'osm' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                  onClick={() => setMapProvider('osm')}
                >
                  OSM
                </button>
                <button
                  type="button"
                  style={{ padding: '4px 12px', fontSize: '12px', fontWeight: '500', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: mapProvider === 'google' ? 'white' : 'transparent', color: mapProvider === 'google' ? 'var(--primary-color, #1d4ed8)' : '#6b7280', boxShadow: mapProvider === 'google' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                  onClick={() => setMapProvider('google')}
                >
                  Google
                </button>
              </div>
              {/* Close Button */}
              <button
                className={styles.closeButton}
                onClick={() => setShowMap(false)}
                style={{ position: 'relative', top: '0', right: '0' }}
              >
                ✕
              </button>
            </div>
            {mapProvider === 'google' ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
              >
                {/* Marker for the location */}
                <GoogleMarker position={{ lat: latitude, lng: longitude }} />
              </GoogleMap>
            ) : (
              <div style={mapContainerStyle}>
                <MapContainer center={center} zoom={13} style={{ width: "100%", height: "100%", zIndex: 0 }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LeafletMarker position={{ lat: latitude, lng: longitude }}>
                    <Popup>{`Location: ${latitude}, ${longitude}`}</Popup>
                  </LeafletMarker>
                </MapContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};