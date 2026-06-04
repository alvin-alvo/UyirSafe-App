import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styles from '../pages/ReportLayout.module.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '10px'
};

const center = {
  lat: 51.5074,
  lng: -0.1278
};

export default function LocationSelector() {

  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapClick = (event) => {
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
  };

  return (
    <>
      <h2 className={styles.locationTitle}>Choose Location</h2>
      <div
        className={styles.mapContainer}
        role="region"
        aria-label="Map selection area"
      >
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onClick={handleMapClick}
            options={{
              zoomControl: true,
              streetViewControl: true,
              mapTypeControl: true,
              fullscreenControl: true
            }}
          >
            {selectedLocation && (
              <Marker
                position={selectedLocation}
                animation={2}
              />
            )}
          </GoogleMap>
        </LoadScript>

      </div>
    </>

  );

}
