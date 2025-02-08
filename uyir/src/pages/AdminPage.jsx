import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styles from './AdminPage.module.css';
import UpdateCard from './UpdateCard';

const libraries = ['places']; // Keep the libraries static

export const AdminDashboard = () => {
  const [updates, setUpdates] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 11.051362294728685, lng: 76.94148112125961 });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // Track fetch status
  const mapRef = useRef(null);

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
        (position) => setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error('Error retrieving location:', error)
      );
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
            <LoadScript googleMapsApiKey="AIzaSyCTQl0eGQzZUJmKy6olu00tiNKEwla2Ggw" libraries={libraries}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={12}
                onClick={(event) => setSelectedLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() })}
                onLoad={async (map) => {
                  mapRef.current = map;
                  await fetchReports(); // Wait for fetch to complete
                  setMapLoaded(true);
                }}
              >
                {/* Show markers only if data is loaded */}
                {!isFetching && (
                  <>
                    <Marker position={mapCenter} title="Admin Location" />
                    {selectedLocation && <Marker position={selectedLocation} title="Selected Location" />}
                    {updates.map((update) => (
                      <Marker key={update.id} position={{ lat: update.latitude, lng: update.longitude }} title={`Report ID: ${update.id}`} />
                    ))}
                  </>
                )}
              </GoogleMap>
            </LoadScript>
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
