import React, { useState, useEffect } from 'react';
import { NavLink, Navigate } from 'react-router-dom';
import {
  HomeIcon, PlusCircleIcon, ArrowPathIcon, SparklesIcon, UserIcon,
  Cog8ToothIcon, HandRaisedIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon,
  ArrowsPointingOutIcon, ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/User.module.css';
import backgroundImage from '../assets/user-background.png';
import sponsor1 from '../assets/sponsor1.avif';
import sponsor2 from '../assets/sponsor2.jpg';
import sponsor3 from '../assets/sponsor3.jpeg';

const User = () => {
  const { user, loading } = useAuth();
  const [latestReports, setLatestReports] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [currentSponsorIndex, setCurrentSponsorIndex] = useState(0);

  const sponsorImages = [sponsor1, sponsor2, sponsor3];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:6969/user', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch reports (${response.status})`);
        }
        const result = await response.json();
        const sortedReports = [...(result.data || [])]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setLatestReports(sortedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setFetchError('Could not load your reports. Please try again.');
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSponsorIndex((prevIndex) => (prevIndex + 1) % sponsorImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sponsorImages.length]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB');
  };

  const renderStatusBadge = (status) => {
    if (status === 'Resolved') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 border border-green-200">
          Resolved
        </span>
      );
    }
    if (status === 'Needs Review') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
          Needs Review
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
        {status || 'Pending'}
      </span>
    );
  };

  if (!loading && !user) return <Navigate to="/login" />;
  if (loading) return <div>Loading...</div>;

  const username = user.username || 'Guest';

  return (
    <main
      className="min-h-full flex flex-col pb-20"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Main Content */}
      <div className={`${styles.mainContent} flex-1 ml-0 p-4`}>
        {/* Welcome Card */}
        <div className="card glass rounded-xl p-6 mb-6 w-full">
          <h2 className="text-2xl font-semibold text-[var(--primary-color)]">Welcome, {username}</h2>
        </div>

        {/* Total Points (Moved to Top) */}
        <div 
          className="card rounded-xl p-6 mb-6 min-h-[160px] flex flex-col relative shadow-md overflow-hidden w-full"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgb(249, 115, 22), rgb(234, 179, 8))'
          }}
        >
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white shadow-sm">Total Points</h3>
              <p className="text-sm font-medium text-orange-100">Level</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-3xl font-black text-white drop-shadow-md">500</span>
              <p className="text-sm font-bold text-orange-100 uppercase tracking-wide">Nanban</p>
              <p className="text-xs font-medium text-orange-200">நன்பன்</p>
            </div>
          </div>
          {/* Car Animation */}
          <div className="absolute inset-x-0 bottom-2 h-16 opacity-90">
            <div className="relative w-full h-full">
              {/* Road */}
              <div className="absolute bottom-0 w-full h-8 bg-gray-800 rounded-lg overflow-hidden shadow-inner">
                <div className="absolute top-1/2 w-full h-1 border-t-2 border-dashed border-yellow-400"></div>
              </div>
              {/* Vehicles */}
              <span className="absolute bottom-2 text-3xl animate-car drop-shadow-lg">🚗</span>
              <span className="absolute bottom-2 text-3xl animate-motorcycle drop-shadow-lg" style={{ animationDelay: '1s' }}>🏍</span>
              <span className="absolute bottom-1 text-3xl animate-truck drop-shadow-lg" style={{ animationDelay: '0.5s' }}>🚛</span>
            </div>
          </div>
          <style>
            {`
              @keyframes moveVehicle {
                0% { transform: translateX(-50px) scaleX(-1); }
                100% { transform: translateX(400px) scaleX(-1); }
              }
              @keyframes moveTruck {
                0% { transform: translateX(400px); }
                100% { transform: translateX(-50px); }
              }
              .animate-car, .animate-motorcycle {
                animation: moveVehicle 4s linear infinite;
              }
              .animate-truck {
                animation: moveTruck 4s linear infinite;
              }
            `}
          </style>
        </div>

        {/* Layout Container */}
        <div className="relative flex flex-col gap-6">
          {/* Latest Reports */}
          <div className="w-full">
            <div className="card glass rounded-xl p-6 h-full min-h-[300px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Latest Reports by You</h3>
                <NavLink to="/user/previous-reports" className="text-sm text-blue-600 hover:underline font-medium">See More</NavLink>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-[var(--primary-color)] border-b border-gray-200">
                      <th className="py-3 px-4 font-semibold">Name</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fetchError ? (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-red-500">{fetchError}</td>
                      </tr>
                    ) : latestReports.length > 0 ? (
                      latestReports.map((report, index) => (
                        <tr key={`report-${report.id || index}`} className="text-gray-800 border-b border-gray-100 last:border-0 hover:bg-white/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{report.type || 'N/A'}</td>
                          <td className="py-3 px-4 text-gray-600">{formatDate(report.date)}</td>
                          <td className="py-3 px-4">
                            {renderStatusBadge(report.status)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-gray-500">No reports available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map Placeholder */}
        <div className="mt-6 max-w-[704px]">
          <div className="glass rounded-lg p-6">
            <div className={styles.reportsHeader}>
              <h3 className="text-lg font-semibold text-black">Your Location</h3>
              <button 
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Toggle Map"
              >
                {isMapExpanded
                  ? <ArrowsPointingInIcon className="h-5 w-5 text-gray-600" />
                  : <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />}
              </button>
            </div>
            <div className={`w-full ${isMapExpanded ? 'h-[600px]' : 'h-[300px]'} rounded-md flex items-center justify-center bg-gray-200 text-gray-600 text-lg font-semibold`}>
              Map Placeholder - Coming Soon
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default User;