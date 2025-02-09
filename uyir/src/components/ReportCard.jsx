import React from "react";
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
  const statusClassName = `${styles.status} ${
    status === "Resolved" ? styles.statusFixed : styles.statusPending
  }`;
  
  // Format the date to show only "DD-MM-YYYY"
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  console.log("date:",formattedDate)

  return (
    <article className={styles.reportCard}>
      <div className={styles.cardContent}>
        <div className={styles.mainSection}>
          <div className={styles.reportDetails}>
            <div className={styles.imageContainer}>
              <img
                className={styles.reportImage}
                src="https://img.freepik.com/premium-photo/map-city-street-cartography-direction-icon-road-town-district-pattern-geography-travel-navigation-plan-downtown-gps-location-place-symbol-navigator-transportation-route-system-background_79161-2128.jpg?semt=ais_hybrid"
                alt={`Road issue: ${type} at ${location}`}
                loading="lazy"
              />
            </div>
            <div className={styles.infoContainer}>
              <div className={styles.reportInfo}>
                <div>Type: {type}</div>
                <div className={styles.location}>Location: {location}</div>
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
    </article>
  );
};
