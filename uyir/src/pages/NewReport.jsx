import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import styles from "./NewReport.module.css";
import * as tf from "@tensorflow/tfjs";
import { useNavigate } from "react-router-dom";

const mapContainerStyle = { width: "100%", height: "300px" };
const center = { lat: 11.051362294728685, lng: 76.94148112125961 };
const GOOGLE_MAPS_API_KEY = "AIzaSyCTQl0eGQzZUJmKy6olu00tiNKEwla2Ggw";

// Use the local model files.
// Ensure that both model.json and model.weights.bin are in your public folder.
const MODEL_URL = "https://storage.googleapis.com/tm-model/n0ZEc_ZXU/model.json";
// We'll still use the remote metadata file. You can also host it locally if desired.
const METADATA_URL = "https://storage.googleapis.com/tm-model/n0ZEc_ZXU/metadata.json";

export const NewReport = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [address, setAddress] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [model, setModel] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [predictionValid, setPredictionValid] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const navigate = useNavigate();

  // Load the model (from local files) and its metadata
  useEffect(() => {
    const loadModelAndMetadata = async () => {
      try {
        // Load the model from the local JSON file.
        const loadedModel = await tf.loadLayersModel(MODEL_URL);
        setModel(loadedModel);
        // Load the metadata (which contains the labels)
        const response = await fetch(METADATA_URL);
        const metaDataJson = await response.json();
        setMetadata(metaDataJson);
      } catch (error) {
        console.error("Error loading model or metadata:", error);
      }
    };

    loadModelAndMetadata();
  }, []);

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  // Reverse geocoding: get address from latitude/longitude
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
  

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
    console.log(lat,lng)
    fetchAddress(lat, lng);
  };

  // When the user selects a file, load it and run the prediction
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

  // Convert the file into an image tensor
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

  const MIN_CONFIDENCE = 1; // Adjust this threshold as needed

const predictImage = async (imageTensor) => {
  // Preprocess the image: resize to 224x224 and normalize pixel values
  const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]);
  const normalizedImage = resizedImage.div(255.0);
  const input = normalizedImage.expandDims(0);

  // Run prediction
  const predictionTensor = model.predict(input);
  // Convert the tensor to a flat array
  const predictionData = predictionTensor.dataSync();
  // Determine the index with the highest probability
  const predictedIndex = predictionData.indexOf(Math.max(...predictionData));
  const predictedProbability = predictionData[predictedIndex];

  // Use metadata.labels to get the predicted label.
  if (metadata && metadata.labels && predictedIndex < metadata.labels.length) {
    // Check if the prediction is confident enough
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
    console.log(predictedLabel,predictedProbability)
  } else {
    setPredictionValid(false);
    setPredictionResult(null);
    alert("The image could not be identified. Please select a valid image.");
  }
};


  const handleSubmit = async () => {
    if (!selectedLocation || !selectedFile) {
      console.error("Please select both a location and a file before submitting");
      return;
    }

    if (!predictionValid) {
      alert("The image could not be identified. Please select a valid image.");
      return;
    }

    const formData = new FormData();
    formData.append("latitude", selectedLocation.lat);
    formData.append("longitude", selectedLocation.lng);
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
    <div className={styles.container}>
      <h1 className={styles.title}>New Report</h1>
      <section>
        <h2 className={styles.sectionTitle}>Type</h2>
        <select
          className="typeSelector"
          value={selectedType}
          onChange={handleTypeChange}
          aria-label="Select report type"
        >
          {metadata && metadata.labels ? (
            metadata.labels.map((label, idx) => (
              <option key={idx} value={label}>
                {label}
              </option>
            ))
          ) : (
            <>
              <option value="Car crash">Car crash</option>
              <option value="Theft">Theft</option>
              <option value="Fire">Fire</option>
              <option value="Natural disaster">Natural disaster</option>
              <option value="Other">Other</option>
            </>
          )}
        </select>
      </section>
      <section>
        <h2 className={styles.sectionTitle}>Choose Location</h2>
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={10}
            onClick={handleMapClick}
          >
            {selectedLocation && <Marker position={selectedLocation} />}
          </GoogleMap>
        </LoadScript>
        {address && <p className={styles.address}>📍 {address}</p>}
      </section>
      <div className={styles.actionContainer}>
        <label htmlFor="fileInput" className={styles.chooseFileBtn}>
          Choose File
        </label>
        <input
          type="file"
          id="fileInput"
          className={styles["visually-hidden"]}
          onChange={handleFileChange}
          aria-label="Choose file to upload"
        />
        {predictionResult && (
          <div className={styles.predictionResult}>
            <p>
              Predicted: <strong>{predictionResult.type}</strong> with{" "}
              {(predictionResult.probability * 100).toFixed(2)}% confidence.
            </p>
          </div>
        )}
        <button className={styles.submitBtn} onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};
