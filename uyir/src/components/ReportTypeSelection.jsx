import React, { useState } from "react";
import styles from "../pages/ReportLayout.module.css";
import { Client, handle_file } from "@gradio/client";

const reportTypes = [
  { id: "accident", label: "Accident" },
  { id: "pothole", label: "Pothole" },
  { id: "trafficJam", label: "Traffic Jam" },
];

export default function ReportTypeSelection() {
  const [selectedType, setSelectedType] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setSelectedType("");
      setPrediction(null);
      setIsSubmitting(true);

      try {
        const app = await Client.connect("http://127.0.0.1:7860");
        const result = await app.predict("/predict", [
          handle_file(file),
        ]);
        // Handle both "label"/"confidence" and "label"/"confidences"
        const label = result.label || result.data?.label;
        const confidence = result.confidence ??
          result.data?.confidence ??
          result.data?.confidences?.[0]?.confidence;

        if (label && confidence != null) {
          const matched = reportTypes.find((t) => t.label.toLowerCase() === label.toLowerCase());
          if (matched) {
            setSelectedType(matched.id);
            setPrediction({
              className: matched.label,
              probability: confidence,
            });
          } else {
            alert("Unrecognized label: " + label);
          }
        } else {
          alert("Prediction data missing");
        }
      } catch (err) {
        console.error("Prediction error:", err);
        alert("Failed to classify image.");
      } finally {
        setIsSubmitting(false);
      }
    };
    input.click();
  };

  return (
    <div>
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Classifying…" : "Choose File"}
        </button>
      </div>

      {prediction && (
        <div className={styles.predictionResult}>
          <p>
            Predicted: <strong>{prediction.className}</strong> with{" "}
            {(prediction.probability * 100).toFixed(2)}% confidence.
          </p>
        </div>
      )}
    </div>
  );
}
