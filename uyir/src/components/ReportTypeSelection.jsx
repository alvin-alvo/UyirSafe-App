import React, { useState } from "react";
import styles from '../pages/ReportLayout.module.css';

const reportTypes = [
  { id: 'carCrash', label: 'Car Crash', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/cf7a81a78ab7096fc12023427c40137317a139ef9c17708e407fbdd06de10a5e?placeholderIfAbsent=true&apiKey=8ebc8889e91f44bf93e5ed89fa3dd955' },
  { id: 'roadHazard', label: 'Road Hazard', icon: 'http://b.io/ext_2-' },
  { id: 'trafficJam', label: 'Traffic Jam', icon: 'http://b.io/ext_3-' },
  { id: 'construction', label: 'Construction', icon: 'http://b.io/ext_4-' }
];

export default function ReportTypeSelection() {
  const [selectedType, setSelectedType] = useState('');

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('File selected:', file);
      }
    };
    input.click();
  };

  return (
    <>
      <h2 className={styles.sectionTitle}>Type</h2>
      <div className={styles.optionsContainer}>
        <select
          className={styles.typeSelect}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          aria-label="Select report type"
        >
          <option value="">Select a report type</option>
          {reportTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
        <button 
          className={styles.actionButton}
          onClick={handleFileSelect}
          aria-label="Choose file to upload"
        >
          Choose File
        </button>
      </div>
    </>
  );
}