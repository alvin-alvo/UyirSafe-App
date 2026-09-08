import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker as LeafletMarker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { HazardBottomSheet } from "../components/HazardBottomSheet";
import { HazardSupportFlow } from "../components/HazardSupportFlow";
import { BottomSheetSelector } from "../components/BottomSheetSelector";
import { ChevronDown } from "lucide-react";
import { Client } from "@gradio/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPinIcon, PhotoIcon, ExclamationTriangleIcon,
  ArrowPathIcon, CheckCircleIcon, ArrowRightIcon, ArrowLeftIcon
} from "@heroicons/react/24/outline";

// Fix default leaflet icons
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

const defaultCenter = { lat: 11.051362294728685, lng: 76.94148112125961 };
const reportTypes = ["accident", "others", "potholes", "traffic"];

// Mock Hazards
const mockHazards = [
  { id: 1, latitude: 11.0168, longitude: 76.9558 },
  { id: 2, latitude: 11.0318, longitude: 76.9658 }
];

export const NewReport = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [app, setApp] = useState(null);

  // Step 1 States
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [selectedCoordinates, setSelectedCoordinates] = useState(defaultCenter);
  const [address, setAddress] = useState("Fetching location...");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedHazardId, setSelectedHazardId] = useState(null);

  // Step 2 States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // Step 3 States
  const [selectedType, setSelectedType] = useState("Car crash");
  const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gamification State
  const [quotaRemaining, setQuotaRemaining] = useState(4); // Mock quota

  // Initialization
  useEffect(() => {
    async function connect() {
      try {
        const api = await Client.connect("http://127.0.0.1:7860");
        setApp(api);
      } catch (err) {
        console.error("Gradio connect error:", err);
      }
    }
    connect();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setMapCenter(coords);
          setSelectedCoordinates(coords);
          fetchAddress(coords.lat, coords.lng);
          checkSimilarReports(coords);
        },
        () => fetchAddress(defaultCenter.lat, defaultCenter.lng)
      );
    } else {
      fetchAddress(defaultCenter.lat, defaultCenter.lng);
    }
  }, []);

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      setAddress(data.display_name || "Unknown location");
    } catch (err) {
      setAddress("Unknown location");
    }
  };

  const checkSimilarReports = async (coords) => {
    // In a real app, this would hit the backend. For now, we simulate finding mock hazards nearby
    if (mockHazards.length > 0) {
       setTimeout(() => {
           setIsBottomSheetOpen(true);
       }, 1500);
    }
  };

  const handleHazardClick = (hazard) => {
    setSelectedHazardId(hazard.id);
    setIsBottomSheetOpen(true);
  };

  const handleSupportComplete = () => {
    setIsBottomSheetOpen(false);
    navigate('/user');
  };

  // Step 2 Logic
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    
    // Auto-proceed to step 3 after selection, while predicting in background
    setStep(3);

    if (!app) return;
    setIsModelLoading(true);
    try {
      const response = await app.predict("/classify_image", [file]);
      const confidences = response.data?.[0]?.confidences;
      if (Array.isArray(confidences) && confidences.length > 0) {
        const top = confidences.reduce((max, curr) => curr.confidence > max.confidence ? curr : max);
        setPredictionResult({ type: top.label, probability: top.confidence });
        setSelectedType(top.label);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsModelLoading(false);
    }
  };

  // Step 3 Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock Submission
    setTimeout(() => {
        setIsSubmitting(false);
        setStep(4);
    }, 1500);
    
    // UNCOMMENT FOR REAL BACKEND
    /*
    const formData = new FormData();
    formData.append("latitude", selectedCoordinates.lat.toString());
    formData.append("longitude", selectedCoordinates.lng.toString());
    formData.append("location", address);
    formData.append("type", selectedType);
    formData.append("file", selectedFile);
    try {
      await fetch("http://localhost:6969/new", { method: "POST", credentials: "include", body: formData });
      setStep(4);
    } catch (err) {
      alert("Failed");
    } finally { setIsSubmitting(false); }
    */
  };

  const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 }
  };

  return (
    <div className="flex flex-col absolute inset-0 w-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          {step > 1 && step < 4 && (
            <button onClick={() => setStep(step - 1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
              <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900">
            {step === 1 && "Location"}
            {step === 2 && "Evidence"}
            {step === 3 && "Details"}
            {step === 4 && "Success"}
          </h1>
        </div>
        <div className="text-sm font-semibold text-gray-400">Step {step}/3</div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          
          {/* STEP 1: Location & Discovery */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col"
            >
              <div className="flex-1 relative z-0 bg-gray-200 flex items-center justify-center">
                {!mapCenter ? (
                   <div className="text-gray-500 font-medium">Loading Map...</div>
                ) : (
                  <MapContainer 
                    center={mapCenter} 
                    zoom={15} 
                    className="h-full w-full absolute inset-0 z-0"
                    zoomControl={false}
                    preferCanvas={true}
                    wheelPxPerZoomLevel={120}
                  >
                    <TileLayer 
                      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" 
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      keepBuffer={8}
                      updateWhenZooming={false}
                      updateWhenIdle={false}
                      crossOrigin="anonymous"
                      maxNativeZoom={19}
                      className="map-tiles-fast"
                    />
                    <LocationMarker 
                      position={selectedCoordinates} 
                      setPosition={setSelectedCoordinates} 
                      fetchAddress={(lat, lng) => fetchAddress(lat, lng)}
                    />
                    {mockHazards.map((hazard) => (
                      <LeafletMarker 
                        key={hazard.id} 
                        position={[hazard.latitude, hazard.longitude]}
                        eventHandlers={{ click: () => handleHazardClick(hazard) }}
                      />
                    ))}
                  </MapContainer>
                )}
                
                {/* Floating overlay for Address */}
                <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3">
                        <MapPinIcon className="w-6 h-6 text-red-500 shrink-0" />
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">{address}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl text-xs text-blue-800 shadow-sm text-center font-medium">
                        Tap anywhere on the map to change location
                    </div>
                </div>
              </div>
              <div className="p-4 bg-white shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-10 relative">
                 <button 
                   onClick={() => setStep(2)}
                   className="w-full bg-red-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-red-700 transition-colors flex items-center justify-between shadow-md active:scale-[0.98]"
                 >
                   <span>Report New Issue</span>
                   <ArrowRightIcon className="w-5 h-5" />
                 </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Evidence */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col p-6 overflow-y-auto"
            >
              <div className="text-center mb-8 mt-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhotoIcon className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Capture Evidence</h2>
                <p className="text-gray-500">Take a clear photo of the hazard. We'll analyze it automatically.</p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <label className="relative flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-gray-300 rounded-3xl bg-white hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden group">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Change Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-red-600">Tap to snap</span> or upload</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>

              {previewUrl && (
                <div className="mt-8">
                  <button 
                    onClick={() => setStep(3)}
                    className="w-full bg-red-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-red-700 transition-colors flex items-center justify-between shadow-md active:scale-[0.98]"
                  >
                    <span>Next Step</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col p-6 overflow-y-auto"
            >
              <div className="mb-6 flex gap-4">
                  {previewUrl && <img src={previewUrl} alt="thumb" className="w-20 h-20 rounded-xl object-cover shadow-sm border border-gray-200" />}
                  <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">AI Analysis</h3>
                      {isModelLoading ? (
                         <div className="flex items-center gap-2 text-blue-600 text-sm font-medium bg-blue-50 px-3 py-2 rounded-lg inline-flex">
                            <ArrowPathIcon className="w-4 h-4 animate-spin" /> Analyzing image...
                         </div>
                      ) : predictionResult ? (
                         <div className="text-sm font-medium bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg inline-flex flex-col">
                            <span>Detected: {predictionResult.type}</span>
                         </div>
                      ) : (
                         <span className="text-gray-400 text-sm">No analysis available.</span>
                      )}
                  </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="space-y-6 flex-1">
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700">
                      <ExclamationTriangleIcon className="w-4 h-4" /> Hazard Type
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsTypeSheetOpen(true)}
                      className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center shadow-sm text-left"
                    >
                      <span className="text-gray-900 font-semibold">{selectedType}</span>
                      <ChevronDown size={18} className="text-gray-400" />
                    </button>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-700">Description (Optional)</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-32"
                      placeholder="Add any extra details..."
                    />
                  </div>
                </div>

                <div className="pt-6 mt-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-gray-800 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2 shadow-xl active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Submitting...</>
                    ) : "Submit Report"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Report Submitted!</h2>
              <p className="text-gray-500 mb-8 max-w-[250px]">Your report has been verified and sent to the authorities.</p>
              
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-8 w-full">
                 <h3 className="font-bold text-orange-800 mb-1">Daily Quota</h3>
                 <p className="text-orange-600 font-medium">{quotaRemaining} reports remaining today</p>
              </div>

              <button
                onClick={() => navigate('/user')}
                className="w-full bg-gray-100 text-gray-900 py-4 px-6 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors active:scale-[0.98]"
              >
                Return Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomSheetSelector
        isOpen={isTypeSheetOpen}
        onClose={() => setIsTypeSheetOpen(false)}
        title="Select Hazard Type"
        options={reportTypes.map(type => ({ label: type, value: type }))}
        selectedValue={selectedType}
        onSelect={(val) => { setSelectedType(val); setIsTypeSheetOpen(false); }}
      />

      <HazardBottomSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)}>
        <div className="p-4 bg-yellow-50 rounded-xl mb-4 border border-yellow-200">
           <h4 className="font-bold text-yellow-800 mb-1 flex items-center gap-2"><ExclamationTriangleIcon className="w-4 h-4"/> Notice</h4>
           <p className="text-yellow-700 text-sm">We found similar hazards reported nearby. Please check if your issue is already listed below.</p>
        </div>
        <HazardSupportFlow hazardId={selectedHazardId || mockHazards[0].id} onSupportComplete={handleSupportComplete} />
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button 
            onClick={() => { setIsBottomSheetOpen(false); setStep(2); }}
            className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
          >
            My issue isn't listed here
          </button>
        </div>
      </HazardBottomSheet>
    </div>
  );
};