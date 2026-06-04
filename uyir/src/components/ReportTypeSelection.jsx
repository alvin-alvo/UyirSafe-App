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
  const [prediction, setPrediction] = useState(null);
  const [labelMap, setLabelMap] = useState([]);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tmImage.load(MODEL_URL, METADATA_URL);
        setModel(loadedModel);
        setLabelMap(loadedModel.getClassLabels());
      } catch (error) {
        console.error("Failed to load model:", error);
      }
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
          try {
            // Get all predictions from the model
            const predictions = await model.predict(img);
            console.log("Predictions:", predictions);

            // Find the prediction with the highest probability
            const bestMatch = predictions.reduce((a, b) =>
              a.probability > b.probability ? a : b
            );

            // Try to match the best prediction to one of our report types.
            // Converting both to lowercase helps avoid casing issues.
            const matchedType = reportTypes.find(
              (type) =>
                type.label.toLowerCase() === bestMatch.className.toLowerCase()
            );

            if (matchedType) {
              setSelectedType(matchedType.id);
              setPrediction(bestMatch);
            } else {
              // If there's no match, show an alert and clear any previous prediction.
              alert("The selected image does not match any known report type.");
              setPrediction(null);
            }
          } catch (error) {
            console.error("Prediction error:", error);
          } finally {
            // Clean up the object URL after the image is loaded.
            URL.revokeObjectURL(img.src);
          }
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