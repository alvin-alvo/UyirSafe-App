// import statements
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleMap, Marker as GoogleMarker } from "@react-google-maps/api";
import { MapContainer, TileLayer, Marker as LeafletMarker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition, fetchAddress }) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition({ lat, lng });
      if (fetchAddress) fetchAddress(lat, lng);
    },
  });
  return position === null ? null : <LeafletMarker position={position} />;
}
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
  const [mapProvider, setMapProvider] = useState("osm");
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
            body: JSON.stringify({
              latitude: selectedCoordinates.lat,
              longitude: selectedCoordinates.lng,
            }),
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

  const fetchAddress = async (lat, lng) => {
    if (mapProvider === 'osm') {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress("Unknown location");
        }
      } catch (err) {
        console.error("OSM Geocoding failed:", err);
        setAddress("Unknown location");
      }
      return;
    }

    if (mapProvider === 'google') {
      try {
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results[0]) {
              setAddress(results[0].formatted_address);
            } else {
              console.warn("Google Maps Geocoder failed with status:", status);
              setAddress("Unknown location");
            }
          });
        } else {
          console.warn("Google Maps API is not loaded.");
          setAddress("Unknown location");
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
        setAddress("Unknown location");
      }
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedCoordinates({ lat, lng });
    fetchAddress(lat, lng);
  };

const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file || !app) {
    console.warn("No file selected or Gradio client not initialized");
    return;
  }

  setSelectedFile(file);
  setPredictionValid(false);
  setPredictionResult(null);
  setIsModelLoading(true); // Indicate processing start
  const previewUrl = URL.createObjectURL(file);
  setPreviewUrl(previewUrl);

  try {
    const response = await app.predict("/classify_image", [file]);
    console.log("Gradio API Response:", response); // Log full response for debugging
    const confidences = response.data?.[0]?.confidences; // Access nested confidences array

    if (Array.isArray(confidences) && confidences.length > 0) {
      // Find the prediction with the highest confidence
      const top = confidences.reduce((max, curr) =>
        curr.confidence > max.confidence ? curr : max
      );
      console.log("Top prediction:", top); // Log top prediction

      setPredictionResult({
        type: top.label,
        probability: top.confidence,
      });
      setSelectedType(top.label);
      setPredictionValid(true);
    } else {
      console.warn("Confidences array is empty or invalid:", confidences);
      setPredictionResult({ type: "unknown", probability: null });
      setPredictionValid(false);
    }
  } catch (err) {
    console.error("Prediction failed:", err);
    setPredictionResult({ type: "unknown", probability: null });
    setPredictionValid(false);
  } finally {
    setIsModelLoading(false); // Reset loading state
  }
};

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedFile || !selectedCoordinates || !selectedType || !address) {
      alert(`Please ensure all fields are filled.\nImage: ${!!selectedFile}\nLocation: ${!!selectedCoordinates}\nType: ${!!selectedType}\nAddress: ${!!address}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("latitude", selectedCoordinates.lat.toString());
      formData.append("longitude", selectedCoordinates.lng.toString());
      formData.append("location", address);
      formData.append("type", selectedType);
      formData.append("file", selectedFile);

      console.log("Submitting report payload:", {
        latitude: selectedCoordinates.lat.toString(),
        longitude: selectedCoordinates.lng.toString(),
        location: address,
        type: selectedType,
        file: selectedFile.name,
      });

      const response = await fetch("http://localhost:6969/new", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Server Error ${response.status}: ${errorData ? JSON.stringify(errorData) : response.statusText}`);
      }

      const result = await response.json();
      console.log("Report submitted successfully:", result);
      
      alert("Report submitted successfully!");
      navigate("/user/previous-reports");
      
    } catch (err) {
      console.error("=== REPORT SUBMISSION FAILED ===");
      console.error("Error Message:", err.message);
      console.error("Full Error Object:", err);
      alert(`Failed to submit report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-[var(--primary-color)]" />
                      <h2 className="text-lg font-semibold text-black">
                        Choose Location
                      </h2>
                    </div>
                    <div className="bg-gray-200 rounded-lg p-1 flex">
                      <button
                        type="button"
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mapProvider === 'osm' ? 'bg-white shadow text-[var(--primary-color)]' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setMapProvider('osm')}
                      >
                        OSM
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mapProvider === 'google' ? 'bg-white shadow text-[var(--primary-color)]' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setMapProvider('google')}
                      >
                        Google Maps
                      </button>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-gray-300" style={mapContainerStyle}>
                    {mapProvider === 'google' ? (
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
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
                          <GoogleMarker position={selectedCoordinates} />
                        )}
                      </GoogleMap>
                    ) : (
                      <MapContainer center={mapCenter} zoom={13} style={{ width: "100%", height: "100%", zIndex: 0 }}>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker 
                          position={selectedCoordinates} 
                          setPosition={setSelectedCoordinates} 
                          fetchAddress={fetchAddress} 
                        />
                      </MapContainer>
                    )}
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
  <div className="mt-3">
    <p className="text-sm">
      <strong>AI Prediction:</strong> {predictionResult.type}
      {typeof predictionResult.probability === "number" ? (
        <span className="text-green-600">
          ({(predictionResult.probability * 100).toFixed(2)}% confidence)
        </span>
      ) : (
        <span className="text-yellow-500">(confidence not available)</span>
      )}
    </p>
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
                    !address ||
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