import React from 'react';
import styles from './UpdateCard.module.css';

const UpdateCard = ({ id, type, location, longitude, latitude, date, status, onStatusUpdate }) => {
  const handleClick = () => {
    if (status === "Pending" && onStatusUpdate) {
      onStatusUpdate(id, status);
    }
  };
  const statusClassName = `${styles.status} ${status === "Resolved" ? styles.statusFixed : styles.statusPending}`;
  return (
    <div className={styles.updateCard}>
      <div className={styles.updateInfo}>
        <div>Type: {type}</div>
        <div>Location: {location}</div>
        <div>
          <div>longitude: {longitude}</div>
          <div>Latitude: {latitude}</div>
        </div>
      </div>
      <div className={styles.updateStatus}>
        <div className={styles.date}>Date: {date}</div>
        <div className={statusClassName}>{status}</div>
        {status === "Pending" && (
        <button onClick={handleClick}>Mark as Resolved</button>
      )}
      </div>
    </div>
  );
};

export default UpdateCard;