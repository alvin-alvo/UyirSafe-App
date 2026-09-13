import React, { useState } from "react";
import styles from "../pages/ReportLayout.module.css";

// Canonical hazard classes — must match backend/ai_model/classes.json.
const reportTypes = [
  { id: "accident", label: "Accident" },
  { id: "irrelevant", label: "Not Relevant" },
  { id: "pothole", label: "Pothole" },
  { id: "traffic", label: "Traffic Congestion" },
];

export default function ReportTypeSelection() {
  const [selectedType, setSelectedType] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const classifyFile = async (file) => {
    setIsClassifying(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("http://localhost:6969/api/ai/detect", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("AI classification failed");
      const data = await response.json();
      // Go response: {hazardType, confidence (0-1), status, ...}
      const bestMatch = {
        className: data.hazardType,
        probability: data.confidence,
        status: data.status,
      };
      const matchedType = reportTypes.find(
        (type) => type.id.toLowerCase() === String(data.hazardType || "").toLowerCase()
      );
      if (matchedType) {
        setSelectedType(matchedType.id);
        setPrediction(bestMatch);
      } else {
        setPrediction(bestMatch);
      }
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) await classifyFile(file);
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
          disabled={isClassifying}
        >
          {isClassifying ? "Classifying..." : "Choose File"}
        </button>
      </div>

      {/* Display the prediction result if available */}
      {prediction && (
        <div className={styles.predictionResult}>
          <p>
            Predicted: <strong>{prediction.className}</strong> with{" "}
            {(prediction.probability * 100).toFixed(2)}% confidence.
          </p>
        </div>
      )}
    </>
  );
}
