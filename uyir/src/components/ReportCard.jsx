import React, { useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
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
          <div className={styles.mapContainer}>
            {/* Close Button */}
            <button
              className={styles.closeButton}
              onClick={() => setShowMap(false)}
            >
              ✕
            </button>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
            >
              {/* Marker for the location */}
              <Marker position={{ lat: latitude, lng: longitude }} />
            </GoogleMap>
          </div>
        </div>
      )}
    </article>
  );
};