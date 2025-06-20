// import statements
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleMap, Marker } from "@react-google-maps/api";
// import * as tf from "@tensorflow/tfjs";
import {
  HomeIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  UserIcon,
  Cog8ToothIcon,
  HandRaisedIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  PhotoIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon as SpinnerIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import backgroundImage from "../assets/user-background.png";
import styles from "../styles/User.module.css";
import { Client } from "@gradio/client";

// constants
const reportTypes = ["accident", "others", "potholes", "traffic"];
const mapContainerStyle = { width: "100%", height: "300px" };
const defaultCenter = { lat: 11.051362294728685, lng: 76.94148112125961 };

// main component
export const NewReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [app, setApp] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [predictionValid, setPredictionValid] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const [selectedType, setSelectedType] = useState("Car crash");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [address, setAddress] = useState("");
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [similarReports, setSimilarReports] = useState([]);
  const [loadingSimilarReports, setLoadingSimilarReports] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null);

  // Initialize Gradio client
  useEffect(() => {
    async function connect() {
      try {
        const api = await Client.connect("http://127.0.0.1:7860");
        setApp(api);
      } catch (err) {
        console.error("Gradio client connect error:", err);
      }
    }
    connect();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setMapCenter(defaultCenter)
      );
    } else {
      setMapCenter(defaultCenter);
    }
  }, []);

  useEffect(() => {
    if (selectedCoordinates) {
      const fetchSimilar = async () => {
        setLoadingSimilarReports(true);
        try {
          const res = await fetch("http://localhost:6969/similarReports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(selectedCoordinates),
          });
          const data = await res.json();
          setSimilarReports(data.similar_reports || []);
        } catch (err) {
          console.error("Similar reports error:", err);
        } finally {
          setLoadingSimilarReports(false);
        }
      };
      fetchSimilar();
    }
  }, [selectedCoordinates]);

  const handleTypeSelect = (event) => {
    setSelectedType(event.target.value);
  };

  const fetchAddress = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress("Unknown location");
      }
    });
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedCoordinates({ lat, lng });
    fetchAddress(lat, lng);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !app) return;

    setSelectedFile(file);
    setPredictionValid(false);
    setPredictionResult(null);
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrl(previewUrl);
    try {
      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });

      const base64Image = await toBase64(file);

      const response = await app.predict("/predict", [base64Image]);

      // Extract top prediction
      const top = response.data?.sort((a, b) => b.confidence - a.confidence)[0];
      if (top) {
        setPredictionResult({ type: top.label, probability: top.confidence });
        setSelectedType(top.label);
        setPredictionValid(true);
      }
    } catch (err) {
      console.error("Prediction failed:", err);
    }
  };

  const handleSubmit = async () => {
    //send data to backend !!!!
  };

  const username = user?.username || "Guest";
  const formatDate = (date) => new Date(date).toLocaleDateString("en-GB");

  return (
    <main
      className="min-h-screen  flex"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Sidebar */}
      <nav className={`${styles.nav} glass`}>
        <div className={styles.logoContainer}>
          <h1 className="text-3xl font-bold text-3d">
            <span className="text-[var(--primary-color)]">Uyir</span>
            <span className="text-[var(--red-color)]">Safe</span>
          </h1>
        </div>
        <div className={styles.navContent}>
          <div className={styles.menuSection}>
            <h2 className={styles.menuHeading}>Menu</h2>
            <ul className={styles.navList}>
              <li>
                <NavLink
                  to="/user"
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ""}`
                  }
                  end
                >
                  <HomeIcon className={styles.navIcon} />
                  <span>Home</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user/new-report"
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <PlusCircleIcon className={styles.navIcon} />
                  <span>New Report</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user/previous-reports"
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <ArrowPathIcon className={styles.navIcon} />
                  <span>Previous Reports</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user/redeem"
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <SparklesIcon className={styles.navIcon} />
                  <span>Redeem Points</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user/profile"
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ""}`
                  }
                >
                  <UserIcon className={styles.navIcon} />
                  <span>User Profile</span>
                </NavLink>
              </li>
            </ul>
          </div>
          <div className={styles.otherServices}>
            <h2 className={styles.menuHeading}>Other Services</h2>
            <ul className={styles.serviceList}>
              <li>
                <button className={styles.serviceButton}>
                  <Cog8ToothIcon className={styles.serviceIcon} />
                  <span>Points System</span>
                </button>
              </li>
              <li>
                <button className={styles.serviceButton}>
                  <ShieldCheckIcon className={styles.serviceIcon} />
                  <span>Road Safety Quiz</span>
                </button>
              </li>
              <li>
                <button className={styles.serviceButton}>
                  <HandRaisedIcon className={styles.serviceIcon} />
                  <span>Partnership</span>
                </button>
              </li>
              <li>
                <button className={styles.serviceButton}>
                  <ChatBubbleLeftRightIcon className={styles.serviceIcon} />
                  <span>Feedbacks</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Welcome Card */}
        <div className="card glass rounded-lg p-6 mb-6 w-full">
          <h2 className="text-2xl font-semibold text-[var(--primary-color)]">
            Create a new report, {username}
          </h2>
        </div>

        {/* FORM AND SIMILAR REPORTS */}
        <div className="relative flex flex-col lg:flex-row ">
          {/* Main Report Form */}
          <div className="flex-1 max-w-4xl">
            <div className="card glass rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <DocumentTextIcon className="h-6 w-6 text-[var(--primary-color)]" />
                <h1 className="text-2xl font-bold text-black">New Report</h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Report Type Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-[var(--primary-color)]" />
                    <h2 className="text-lg font-semibold text-black">
                      Report Type
                    </h2>
                  </div>
                  <select
                    id="report-type-select"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all"
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
                  {isModelLoading && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      Loading AI model for image recognition...
                    </p>
                  )}
                </div>

                {/* Location Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPinIcon className="h-5 w-5 text-[var(--primary-color)]" />
                    <h2 className="text-lg font-semibold text-black">
                      Choose Location
                    </h2>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-gray-300">
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenter}
                      zoom={10}
                      onClick={handleMapClick}
                      options={{
                        styles: [
                          {
                            featureType: "all",
                            elementType: "geometry.fill",
                            stylers: [{ saturation: -15 }],
                          },
                        ],
                      }}
                    >
                      {selectedCoordinates && (
                        <Marker position={selectedCoordinates} />
                      )}
                    </GoogleMap>
                  </div>
                  {address && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        <strong>Selected Location:</strong> {address}
                      </p>
                    </div>
                  )}
                </div>

                {/* File Upload Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <PhotoIcon className="h-5 w-5 text-[var(--primary-color)]" />
                    <h2 className="text-lg font-semibold text-black">
                      Upload Evidence
                    </h2>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white bg-opacity-50">
                    <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <span className="text-[var(--primary-color)] font-medium hover:underline">
                        Choose file to upload
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </label>
                    <input
                      type="file"
                      id="file-input"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                      aria-label="Choose file to upload"
                    />
                  </div>

                  {selectedFile && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>File:</strong> {selectedFile.name}
                      </p>
                    </div>
                  )}

                  {previewUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Image Preview:
                      </p>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="rounded-lg border border-gray-300 max-h-64 mx-auto"
                      />
                    </div>
                  )}

                  {predictionResult && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircleIcon className="h-5 w-5" />
                        <p className="text-sm">
                          <strong>AI Prediction:</strong>{" "}
                          {predictionResult.type}
                          <span className="text-green-600">
                            {" "}
                            ({(predictionResult.probability * 100).toFixed(2)}%
                            confidence)
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    !selectedCoordinates ||
                    !selectedFile ||
                    !predictionValid ||
                    isSubmitting
                  }
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <PlusCircleIcon className="h-5 w-5" />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Similar Reports Sidebar */}
          <div className="lg:w-96 ml-5">
            <div className="card glass rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="h-5 w-5 text-[var(--primary-color)]" />
                <h2 className="text-lg font-semibold text-black">
                  Similar Reports
                </h2>
              </div>

              {!selectedCoordinates ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPinIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a location to see similar reports</p>
                </div>
              ) : loadingSimilarReports ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 bg-opacity-50 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : similarReports.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {similarReports.map((report, index) => (
                    <div
                      key={index}
                      className="bg-white bg-opacity-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          {report.type}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {report.location}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{formatDate(report.date)}</span>
                        <span>
                          {report.latitude?.toFixed(4)},{" "}
                          {report.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No similar reports found</p>
                  <p className="text-sm">This area seems clear!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary-color-rgb), 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary-color-rgb), 0.7);
        }
      `}</style>
    </main>
  );
};
