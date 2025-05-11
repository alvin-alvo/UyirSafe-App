import React from "react";
import styles from "./UserHeader.module.css";

export const UserHeader = ({ userName, points, avatarUrl, onNewReport }) => {
  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        <img
          src={avatarUrl}
          alt={`${userName}'s profile`}
          className={styles.avatar}
        />
        <div className={styles.textContainer}>
          <h1 className={styles.userName}>{userName}</h1>
          <p className={styles.points}>Points: {points}</p>
        </div>
      </div>
      <button
        className={styles.newReportButton}
        onClick={onNewReport}
        aria-label="Create new road issue report"
      >
        New Report
      </button>
    </header>
  );
};
