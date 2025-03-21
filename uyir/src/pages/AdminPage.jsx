import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styles from './AdminPage.module.css';
import UpdateCard from './UpdateCard';

const libraries = ['places']; // Keep the libraries static

const key = import.meta.env.VITE_Google;

export const AdminDashboard = () => {
  const [updates, setUpdates] = useState([]);
  const [mapCenter, setMapCenter] = useState(null); // Start with null until location is fetched
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // Track fetch status
  const [locationLoaded, setLocationLoaded] = useState(false); // Track location status
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
          console.error('Error retrieving location:', error);
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

  return (
    <main className={styles.adminDashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Panel</h1>
        <h2 className={styles.subtitle}>Real-time updates</h2>
      </header>
      <div className={styles.contentWrapper}>
        <section className={styles.mapContainer} aria-label="Map">
          <div className={styles.map}>
            {!locationLoaded ? (
              <p>Loading map...</p>
            ) : (
              <LoadScript googleMapsApiKey={key} libraries={libraries}>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={12}
                  onLoad={async (map) => {
                    mapRef.current = map;
                    await fetchReports(); // Wait for fetch to complete
                    setMapLoaded(true);
                  }}
                >
                  {/* Show markers only if data is loaded */}
                  {!isFetching && (
                    <>
                      {/* Blue marker for current location */}
                      <Marker position={mapCenter} title="Your Location" icon={blueMarkerIcon} />

                      {/* Default markers for reports */}
                      {updates.map((update) => (
                        <Marker key={update.id} position={{ lat: update.latitude, lng: update.longitude }} title={`Report ID: ${update.id}`} />
                      ))}
                    </>
                  )}
                </GoogleMap>
              </LoadScript>
            )}
          </div>
        </section>
        <section className={styles.updatesContainer} aria-label="Updates">
          {updates.map((update, index) => (
            <UpdateCard key={index} {...update} />
          ))}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
