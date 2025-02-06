import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import styles from "./NewReport.module.css";
import * as tf from "@tensorflow/tfjs"; // Import TensorFlow.js
import { useNavigate } from "react-router-dom";

const mapContainerStyle = { width: "100%", height: "300px" };
const center = { lat: 0, lng: 0 };
const GOOGLE_MAPS_API_KEY = "AIzaSyCTQl0eGQzZUJmKy6olu00tiNKEwla2Ggw"; // Replace with actual API key
const reportTypes = ["Car crash", "Theft", "Fire", "Natural disaster", "Other"];

export const NewReport = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [address, setAddress] = useState("");
  const [selectedType, setSelectedType] = useState("Car crash");
  const [model, setModel] = useState(null);
  const [predictionValid, setPredictionValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load the TensorFlow model when the component mounts
    const loadModel = async () => {
      const loadedModel = await tf.loadLayersModel(
        "https://storage.googleapis.com/tm-model/8N2NXMoJ8/model.json"
      ); // Replace with actual model path
      setModel(loadedModel);
    };

    loadModel();
  }, []);

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  // Reverse Geocode: Get Address from Lat/Lng
  const fetchAddress = async (lat, lng) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress("Unknown location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Address fetch failed");
    }
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
    fetchAddress(lat, lng); // Get address when location is selected
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPredictionValid(false);

    // If model is loaded, classify the file
    if (file && model) {
      const image = await loadImage(file);
      const prediction = await predictImage(image);
      console.log("Prediction result:", prediction);
    }
  };

  const loadImage = (file) => {
    // Create a tensor from the image file (assuming it's an image file)
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const tensor = tf.browser.fromPixels(img);
        resolve(tensor);
      };
      img.onerror = reject;
    });
  };

  const predictImage = async (imageTensor) => {
    // Preprocess the image if necessary (resize, normalize, etc.)
    const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]);
    const normalizedImage = resizedImage.div(255.0); // Normalize the image (if required by the model)

    // Make prediction using the model
    const input = normalizedImage.expandDims(0); // Expand dims to match input shape
    const prediction = await model.predict(input);

    // Process the prediction and set the report type (or any other logic)
    const predictedClass = prediction.argMax(1).dataSync()[0]; // Get the predicted class
    if (predictedClass >= 0 && predictedClass < reportTypes.length) {
      setSelectedType(reportTypes[predictedClass]);
      setPredictionValid(true);
    } else {
      setPredictionValid(false);
    }
    return prediction;
  };

  const handleSubmit = async () => {
    if (!selectedLocation || !selectedFile) {
      console.error(
        "Please select both a location and a file before submitting"
      );
      return;
    }

    if (!predictionValid) {
      alert("The image could not be identified. Please select a valid image.");
      return;
    }

    const formData = new FormData();
    formData.append("latitude", selectedLocation.lat);
    formData.append("longitude", selectedLocation.lng);
    formData.append("location", address); // Include the address
    formData.append("file", selectedFile);
    formData.append("type", selectedType);

    try {
      const response = await fetch("http://localhost:6969/new", {
        method: "POST",
        body: formData,
        credentials: "include", // Ensures cookies or credentials are sent if needed
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
        <h2 className="sectionTitle">Type</h2>
        <select
          className="typeSelector"
          value={selectedType}
          onChange={handleTypeChange}
          aria-label="Select report type"
        >
          {reportTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
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
        <button className={styles.submitBtn} onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};
