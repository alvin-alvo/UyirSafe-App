import React from "react";
import styles from "./Input.module.css";

export const Input = ({ label, type, icon, id }) => {
  return (
    <div className={styles.inputWrapper}>
      <label htmlFor={id} className={styles.inputLabel}>
        {icon && (
          <img loading="lazy" src={icon} className={styles.icon} alt="" />
        )}
        {label}
      </label>
      <input
        type={type}
        id={id}
        className={styles.input}
        placeholder={label}
        aria-label={label}
      />
    </div>
  );
};
