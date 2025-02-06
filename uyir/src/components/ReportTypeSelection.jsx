import React, { useState, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";
import styles from "../pages/ReportLayout.module.css";

const reportTypes = [
  { id: "carCrash", label: "Car Crash" },
  { id: "roadHazard", label: "Road Hazard" },
  { id: "trafficJam", label: "Traffic Jam" },
  { id: "construction", label: "Construction" },
];

const MODEL_URL =
  "https://storage.googleapis.com/tm-model/8N2NXMoJ8/model.json";
const METADATA_URL =
  "https://storage.googleapis.com/tm-model/8N2NXMoJ8/metadata.json";

export default function ReportTypeSelection() {
  const [selectedType, setSelectedType] = useState("");
  const [model, setModel] = useState(null);
  const [labelMap, setLabelMap] = useState([]);

  useEffect(() => {
    const loadModel = async () => {
      const model = await tmImage.load(MODEL_URL, METADATA_URL);
      setModel(model);
      setLabelMap(model.getClassLabels());
    };
    loadModel();
  }, []);

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file && model) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
          const prediction = await model.predict(img);
          console.log("pred", prediction);
          const bestMatch = prediction.reduce((a, b) =>
            a.probability > b.probability ? a : b
          );
          const matchedType = reportTypes.find(
            (type) => type.label === bestMatch.className
          );
          if (matchedType) setSelectedType(matchedType.id);
          URL.revokeObjectURL(img.src);
        };
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
