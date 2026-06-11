import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker as GoogleMarker } from "@react-google-maps/api";
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
import {
  MapPinIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import UpdateCard from "./UpdateCard";
import backgroundImage from '../assets/user-background.png'; // Same background as User component

const libraries = ["places"]; // Keep the libraries static

export const AdminDashboard = () => {
  // console.log("MAP KEY:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const [updates, setUpdates] = useState([]);
  const [mapCenter, setMapCenter] = useState(null); // Start with null until location is fetched
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // Track fetch status
  const [locationLoaded, setLocationLoaded] = useState(false); // Track location status
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [mapProvider, setMapProvider] = useState("osm");
  const mapRef = useRef(null);

  // Custom blue marker icon for current location
  const blueMarkerIcon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";

  // Fetch reports from API
  const fetchReports = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("http://localhost:6969/reports/pending/");
      if (!response.ok) throw new Error("Failed to fetch reports");
      const jsonData = await response.json();
      setUpdates(jsonData.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationLoaded(true);
        },
        (error) => {
          console.error("Error retrieving location:", error);
          setMapCenter({ lat: 11.051362294728685, lng: 76.94148112125961 }); // Default fallback
          setLocationLoaded(true);
        }
      );
    } else {
      setMapCenter({ lat: 11.051362294728685, lng: 76.94148112125961 }); // Default fallback
      setLocationLoaded(true);
    }
  }, []);

  // Fetch reports when component mounts
  useEffect(() => {
    fetchReports();
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <header className="p-6">
        <div className="card glass rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-3d mb-2">
                <span className="text-[var(--primary-color)]">Admin</span>
                <span className="text-[var(--red-color)]"> Panel</span>
              </h1>
              <div className="flex items-center gap-2 text-lg text-gray-700">
                <ClockIcon className="h-5 w-5" />
                <span>Real-time updates</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchReports}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold text-[var(--primary-color)]">{updates.length}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map Section */}
          <section className="flex-none lg:flex-1 w-full lg:w-1/2" aria-label="Map">
            <div className="card glass rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-6 w-6 text-[var(--primary-color)]" />
                  <h3 className="text-xl font-semibold text-black">Report Locations</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 rounded-lg p-1 flex mr-2">
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
                  <button
                    onClick={() => setIsMapExpanded(!isMapExpanded)}
                    className="p-2 rounded-full hover:bg-gray-200 hover:bg-opacity-50 transition-colors"
                    aria-label="Toggle Map Size"
                  >
                    {isMapExpanded
                      ? <ArrowsPointingInIcon className="h-5 w-5 text-gray-600" />
                      : <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />}
                  </button>
                </div>
              </div>

              <div
                className={`w-full rounded-lg overflow-hidden ${isMapExpanded ? 'h-[600px]' : 'h-[500px]'
                  } transition-all duration-300 relative z-0`}
              >
                {!locationLoaded ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <ArrowPathIcon className="h-8 w-8 text-gray-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                ) : mapProvider === 'google' ? (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={mapCenter}
                    zoom={12}
                    onLoad={async (map) => {
                      mapRef.current = map;
                      await fetchReports(); // Wait for fetch to complete
                      setMapLoaded(true);
                    }}
                    options={{
                      styles: [
                        {
                          featureType: "all",
                          elementType: "geometry.fill",
                          stylers: [{ saturation: -15 }]
                        }
                      ]
                    }}
                  >
                    {/* Show markers only if data is loaded */}
                    {!isFetching && (
                      <>
                        {/* Blue marker for current location */}
                        <GoogleMarker
                          position={mapCenter}
                          title="Your Location"
                          icon={blueMarkerIcon}
                        />

                        {/* Default markers for reports */}
                        {updates.map((update) => (
                          <GoogleMarker
                            key={update.id}
                            position={{ lat: update.latitude, lng: update.longitude }}
                            title={`Report ID: ${update.id} - ${update.type || 'Report'}`}
                          />
                        ))}
                      </>
                    )}
                  </GoogleMap>
                ) : (
                  <MapContainer center={mapCenter} zoom={12} style={{ width: "100%", height: "100%", zIndex: 0 }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {!isFetching && (
                      <>
                        <CircleMarker center={mapCenter} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.5 }} radius={8}>
                          <Popup>Your Location</Popup>
                        </CircleMarker>
                        {updates.map((update) => (
                          <LeafletMarker
                            key={update.id}
                            position={{ lat: update.latitude, lng: update.longitude }}
                          >
                            <Popup>{`Report ID: ${update.id} - ${update.type || 'Report'}`}</Popup>
                          </LeafletMarker>
                        ))}
                      </>
                    )}
                  </MapContainer>
                )}
              </div>

              {/* Map Stats */}
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <span>Showing {updates.length} pending reports</span>
                <span>Last updated: {formatTime(new Date())}</span>
              </div>
            </div>
          </section>

          {/* Updates Section */}
          <section className="flex-none lg:flex-1 w-full lg:w-1/2" aria-label="Updates">
            <div className="card glass rounded-lg p-6 bg-white bg-opacity-80 backdrop-blur-md">
              <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-4 flex items-center gap-2">
                <ClockIcon className="h-6 w-6 text-[var(--primary-color)]" />
                Pending Reports
              </h3>

              {isFetching ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-24 bg-gray-200 bg-opacity-40 rounded-lg"></div>
                  ))}
                </div>
              ) : updates.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-x-auto custom-scrollbar">
                  {updates.map((update, index) => (
                    <div
                      key={update.id || index}
                      className="bg-white bg-opacity-50 hover:bg-opacity-70 rounded-lg p-4 transition"
                    >
                      <UpdateCard {...update} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPinIcon className="h-12 w-12 mx-auto mb-4 opacity-50 text-[var(--primary-color)]" />
                  <p className="text-lg font-medium">No pending reports</p>
                  <p className="text-sm mt-1">All reports have been processed</p>
                </div>
              )}
            </div>
          </section>

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

export default AdminDashboard;