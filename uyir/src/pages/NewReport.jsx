import React from "react";
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import ReportHeader from '../components/ReportHeader';
import ReportTypeSelection from '../components/ReportTypeSelection';
import LocationSelector from '../components/LocationSelection';
import styles from './ReportLayout.module.css';

export const ReportLayout =()=> {
  return (
    <div className={styles.reportContainer}>
      <div className={styles.contentWrapper}>
        <ReportHeader />
        <ReportTypeSelection />
        <LocationSelector />
      </div>
    </div>
  );
}