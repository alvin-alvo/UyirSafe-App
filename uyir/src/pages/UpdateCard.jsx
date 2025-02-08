import React, { useState } from 'react';
import styles from './UpdateCard.module.css';

const UpdateCard = ({ id, type, location, longitude, latitude, date, status, onStatusUpdate }) => {
  const [localStatus, setLocalStatus] = useState(status); // Local state to track status change

  const handleClick = async () => {
    if (localStatus !== "Pending") return; // Prevent unnecessary calls

    try {
      const response = await fetch("http://localhost:6969/reports/updateStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }), // Sending ID in request body
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await response.json();

      setLocalStatus("Resolved"); // Update local state for immediate UI change
      if (onStatusUpdate) {
        onStatusUpdate(id, "Resolved"); // Update parent state
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const statusClassName = `${styles.status} ${localStatus === "Resolved" ? styles.statusFixed : styles.statusPending}`;
  const buttonClassName = localStatus === "Resolved" ? styles.statusFixed : ""; // Change button style

  return (
    <div className={styles.updateCard}>
      <div className={styles.updateInfo}>
        <div>Type: {type}</div>
        <div>Location: {location}</div>
        <div>
          <div>Longitude: {longitude}</div>
          <div>Latitude: {latitude}</div>
        </div>
      </div>
      <div className={styles.updateStatus}>
        <div className={styles.date}>Date: {date}</div>
        <div className={statusClassName}>{localStatus}</div>
        {localStatus === "Pending" && (
          <button onClick={handleClick} className={buttonClassName}>
            Mark as Resolved
          </button>
        )}
      </div>
    </div>
  );
};

export default UpdateCard;
