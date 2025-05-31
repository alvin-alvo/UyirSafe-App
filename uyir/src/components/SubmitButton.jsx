import React from 'react';
import styles from './SubmitButton.module.css';

export const SubmitButton = ({ text, isLoading, className }) => {
  return (
    <button
      type="submit"
      className={`btn-primary ${className || ''}`}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? "Loading..." : text}
    </button>
  );
};