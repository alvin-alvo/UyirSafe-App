import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import * as tf from "@tensorflow/tfjs";
import styles from "./NewReport.module.css";
import { useNavigate } from "react-router-dom";

// Static values for report types
const reportTypes = ["Car crash", "Pothole", "Fallen tree", "Flood"];


const key = import.meta.env.VITE_Google;
console.log("key:",key)

// Google Maps API and Map Settings
const mapContainerStyle = { width: "100%", height: "300px" };
const center = { lat: 11.051362294728685, lng: 76.94148112125961 };

// TensorFlow model URLs and threshold
const MODEL_URL = "https://storage.googleapis.com/tm-model/n0ZEc_ZXU/model.json";
const METADATA_URL = "https://storage.googleapis.com/tm-model/n0ZEc_ZXU/metadata.json";
const MIN_CONFIDENCE = 1;

export const NewReport = () => {
  // State for ML prediction
  const [model, setModel] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [predictionValid, setPredictionValid] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const navigate = useNavigate();

  // Report form state
  const [selectedType, setSelectedType] = useState("Car crash");
  const [selectedFile, setSelectedFile] = useState(null);

  // Map location state: coordinates and the reverse-geocoded address.
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [address, setAddress] = useState("");

  // State for similar reports fetched from the backend.
  const [similarReports, setSimilarReports] = useState([]);

  // Load the TensorFlow model and metadata on mount.
  useEffect(() => {
    const loadModelAndMetadata = async () => {
      try {
        const loadedModel = await tf.loadLayersModel(MODEL_URL);
        setModel(loadedModel);
        const response = await fetch(METADATA_URL);
        const metaDataJson = await response.json();
        setMetadata(metaDataJson);
      } catch (error) {
        console.error("Error loading model or metadata:", error);
      }
    };

    loadModelAndMetadata();
  }, []);

  // Fetch similar reports when the user selects a new location.
  useEffect(() => {
    if (selectedCoordinates) {
      const fetchSimilarReports = async () => {
        try {
          const url = `http://localhost:6969/similarReports`;
          const requestBody = {
            latitude: selectedCoordinates.lat,
            longitude: selectedCoordinates.lng,
          };

          const response = await fetch(url, {
            method: "POST", // Using POST to send the body data
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          // Assume the response returns an object with a "similar_reports" key.
          setSimilarReports(data.similar_reports || []);
        } catch (error) {
          console.error("Error fetching similar reports:", error);
          setSimilarReports([]);
        }
      };

      fetchSimilarReports();
    }
  }, [selectedCoordinates]);

  // Allow manual selection of report type.
  const handleTypeSelect = (event) => {
    setSelectedType(event.target.value);
  };

  // Reverse geocode coordinates into a human-friendly address.
  const fetchAddress = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        console.error("Geocoder failed due to: " + status);
        setAddress("Unknown location");
      }
    });
  };

  // When the map is clicked, update the coordinates and fetch the address.
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedCoordinates({ lat, lng });
    fetchAddress(lat, lng);
  };

  // When a file is selected, load it and run the prediction.
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPredictionValid(false);
    setPredictionResult(null);

    if (file && model && metadata) {
      try {
        const imageTensor = await loadImage(file);
        await predictImage(imageTensor);
      } catch (error) {
        console.error("Error during prediction:", error);
      }
    }
  };

  // Helper: Convert the file into a Tensor.
  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => {
        const tensor = tf.browser.fromPixels(img);
        URL.revokeObjectURL(url);
        resolve(tensor);
      };
      img.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };
    });
  };

  // Preprocess the image and run the prediction.
  const predictImage = async (imageTensor) => {
    const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]);
    const normalizedImage = resizedImage.div(255.0);
    const input = normalizedImage.expandDims(0);

    const predictionTensor = model.predict(input);
    const predictionData = predictionTensor.dataSync();
    const predictedIndex = predictionData.indexOf(Math.max(...predictionData));
    const predictedProbability = predictionData[predictedIndex];

    if (metadata && metadata.labels && predictedIndex < metadata.labels.length) {
      if (predictedProbability < MIN_CONFIDENCE) {
        setPredictionValid(false);
        setPredictionResult(null);
        alert("The model is not confident about this image. Please upload a valid image.");
        return;
      }

      const predictedLabel = metadata.labels[predictedIndex];
      setSelectedType(predictedLabel);
      setPredictionValid(true);
      setPredictionResult({
        type: predictedLabel,
        probability: predictedProbability,
      });
      console.log(predictedLabel, predictedProbability);
    } else {
      setPredictionValid(false);
      setPredictionResult(null);
      alert("The image could not be identified. Please select a valid image.");
    }
  };

  // On form submission, ensure a location and a file are selected, then send the report data to the backend.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedCoordinates || !selectedFile) {
      console.error("Please select both a location and a file before submitting");
      return;
    }

    if (!predictionValid) {
      alert("The image could not be identified. Please select a valid image.");
      return;
    }

    const formData = new FormData();
    formData.append("latitude", selectedCoordinates.lat);
    formData.append("longitude", selectedCoordinates.lng);
    formData.append("location", address);
    formData.append("file", selectedFile);
    formData.append("type", selectedType);

    try {
      const response = await fetch("http://localhost:6969/new", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Report submitted successfully:", result);
      navigate("/user");
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  return (
    <main className={styles.newReportPage}>
      <div className={styles.contentWrapper}>
        <section className={styles.reportSection}>
          <h1 className={styles.pageTitle}>New Report</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles.reportTypeSelector}>
              <h2 className={styles.sectionTitle}>Type</h2>
              <label htmlFor="report-type-select" className={styles.visuallyHidden}>
                Select report type
              </label>
              <select
                id="report-type-select"
                className={styles.typeSelect}
                value={selectedType}
                onChange={handleTypeSelect}
                aria-describedby="report-type-description"
              >
                {metadata && metadata.labels
                  ? metadata.labels.map((label, idx) => (
                      <option key={idx} value={label}>
                        {label}
                      </option>
                    ))
                  : reportTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
              </select>
              <p id="report-type-description" className={styles.visuallyHidden}>
                Choose the type of incident you want to report
              </p>
            </div>
            <div className={styles.locationSelector}>
              <h2 className={styles.sectionTitle}>Choose Location</h2>
              <LoadScript googleMapsApiKey={key}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={10}
                  onClick={handleMapClick}
                >
                  {selectedCoordinates && <Marker position={selectedCoordinates} />}
                </GoogleMap>
              </LoadScript>
              <p id="location-description" className={styles.selectedLocation}>
                📍 {address || "No location selected"}
              </p>
            </div>
            <div className={styles.fileUploader}>
              <p className={styles.fileName}>
                {selectedFile ? `File: ${selectedFile.name}` : "No file selected"}
              </p>
              <label htmlFor="file-input" className={styles.chooseFileButton}>
                Choose File
              </label>
              <input
                type="file"
                id="file-input"
                className={styles.hiddenFileInput}
                onChange={handleFileChange}
                aria-label="Choose file to upload"
              />
              {predictionResult && (
                <p className={styles.predictionResult}>
                  Predicted: <strong>{predictionResult.type}</strong> with{" "}
                  {(predictionResult.probability * 100).toFixed(2)}% confidence.
                </p>
              )}
            </div>
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </form>
        </section>
        <aside className={styles.similarReportsSection}>
          <h2 className={styles.sectionTitle}>Similar Reports</h2>
          {similarReports.length > 0 ? (
            similarReports.map((report, index) => (
              <div key={index} className={styles.reportCard}>
                <div className={styles.reportDetails}>
                  <p className={styles.reportInfo}>Type: {report.type}</p>
                  <p className={styles.reportInfo}>Location: {report.location}</p>
                  <p className={styles.reportInfo}>Longitude: {report.longitude}</p>
                  <p className={styles.reportInfo}>Latitude: {report.latitude}</p>
                </div>
                <div className={styles.reportStatus}>
                  <p className={styles.reportDate}>Date: {report.date}</p>
                  <div className={styles.statusBadge}>{report.status}</div>
                </div>
              </div>
            ))
          ) : (
            <p>No similar reports found</p>
          )}
        </aside>
      </div>
    </main>
  );
};
