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
        const result = await response.json();
        const sortedReports = (result.data || [])
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setLatestReports(sortedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
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

  if (!loading && !user) return <Navigate to="/login" />;
  if (loading) return <div>Loading...</div>;

  const username = user.username || 'Guest';

  return (
    <main
      className="min-h-screen flex"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
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
              <li><NavLink to="/user" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} end><HomeIcon className={styles.navIcon} /><span>Home</span></NavLink></li>
              <li><NavLink to="/user/new-report" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><PlusCircleIcon className={styles.navIcon} /><span>New Report</span></NavLink></li>
              <li><NavLink to="/user/previous-reports" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><ArrowPathIcon className={styles.navIcon} /><span>Previous Reports</span></NavLink></li>
              <li><NavLink to="/user/redeem" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><SparklesIcon className={styles.navIcon} /><span>Redeem Points</span></NavLink></li>
              <li><NavLink to="/user/profile" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><UserIcon className={styles.navIcon} /><span>User Profile</span></NavLink></li>
            </ul>
          </div>
          <div className={styles.otherServices}>
            <h2 className={styles.menuHeading}>Other Services</h2>
            <ul className={styles.serviceList}>
              <li><button className={styles.serviceButton}><Cog8ToothIcon className={styles.serviceIcon} /><span>Points System</span></button></li>
              <li><button className={styles.serviceButton}><ShieldCheckIcon className={styles.serviceIcon} /><span>Road Safety Quiz</span></button></li>
              <li><button className={styles.serviceButton}><HandRaisedIcon className={styles.serviceIcon} /><span>Partnership</span></button></li>
              <li><button className={styles.serviceButton}><ChatBubbleLeftRightIcon className={styles.serviceIcon} /><span>Feedbacks</span></button></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Welcome Card */}
        <div className="card glass rounded-lg p-6 mb-6 w-full">
          <h2 className="text-2xl font-semibold text-[var(--primary-color)]">Welcome, {username}</h2>
        </div>

        {/* Layout Container */}
        <div className="relative flex flex-col lg:flex-row">
          {/* Left Column: New Report and Latest Reports */}
          <div className="flex flex-col max-w-[704px] w-full">
            {/* New Report */}
            <NavLink to="/user/new-report" className="w-full">
              <div className="card bg-red-600 rounded-lg p-6 flex items-center gap-4 transition-transform hover:scale-[1.01] hover:bg-red-700 cursor-pointer">
                <PlusCircleIcon className="h-10 w-10 text-white" />
                <span className="text-xl font-semibold text-white">New Report</span>
              </div>
            </NavLink>

            {/* Latest Reports */}
            <div className="w-full mt-6">
              <div className="card glass rounded-lg p-6 min-h-[30vh]">
                <div className={styles.reportsHeader}>
                  <h3 className="text-lg font-semibold text-black">Latest Reports by You</h3>
                  <NavLink to="/user/previous-reports" className={styles.seeMoreLink}>See More</NavLink>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[var(--primary-color)] text-left">
                      <th className="py-2 px-4">Name</th>
                      <th className="py-2 px-4">Date</th>
                      <th className="py-2 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestReports.length > 0 ? (
                      latestReports.map((report, index) => (
                        <tr key={`report-${report.id || index}`} className="text-black border-t border-white border-opacity-10">
                          <td className="py-2 px-4">{report.type || 'N/A'}</td>
                          <td className="py-2 px-4">{formatDate(report.date)}</td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                report.status
                                  ? 'bg-green-500 bg-opacity-20 text-green-800'
                                  : 'bg-yellow-500 bg-opacity-20 text-yellow-800'
                              }`}
                            >
                              {report.status ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-gray-400">No reports available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Total Points and Sponsors */}
          <div className="max-w-[385px] w-full lg:fixed lg:right-6 lg:top-32">
            {/* Total Points */}
            <div 
              className="card glass rounded-lg p-4 min-h-[22vh] flex flex-col relative"
              style={{
                backgroundImage: 'linear-gradient(to bottom right, rgb(249, 115, 22), rgb(234, 179, 8))'
              }}
            >
              <div className="flex mb-2">
                <div className="w-1/2">
                  <h3 className="text-xl font-semibold text-[var(--primary-color)]">Total Points                               :</h3>
                  <p className="text-lg font-semibold text-orange-700">Level                                                              :</p>
                </div>
                <div className="w-1/2">
                  <span className="text-xl font-semibold text-[var(--primary-color)] text-right">500</span>
                  <p className="text-lg font-semibold text-orange-700 text-right">Nanban</p>
                  <p className="text-lg font-semibold text-gray-700 text-right">நன்பன்</p>
                </div>
              </div>
              {/* Car Animation */}
              <div className="absolute inset-x-0 bottom-4 h-12">
                <div className="relative w-full h-full">
                  {/* Road */}
                  <div className="absolute bottom-0 w-full h-6 bg-gray-600 rounded">
                    <div className="absolute top-1/2 w-full h-0.5 border-t-2 border-dashed border-white"></div>
                  </div>
                  {/* Vehicles */}
                  <span className="absolute bottom-2 text-2xl animate-car">🚗</span>
                  <span className="absolute bottom-2 text-2xl animate-motorcycle" style={{ animationDelay: '1s' }}>🏍</span>
                  <span className="absolute bottom-0.5 text-2xl animate-truck" style={{ animationDelay: '0.5s' }}>🚛</span>
                </div>
              </div>
              <style>
                {`
                  @keyframes moveVehicle {
                    0% { transform: translateX(0) scaleX(-1); }
                    100% { transform: translateX(353px) scaleX(-1); }
                  }
                  @keyframes moveTruck {
                    0% { transform: translateX(353px); }
                    100% { transform: translateX(0); }
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

            {/* Sponsors Carousel */}
            <div className="mt-6">
              <div className="card glass rounded-lg p-6 h-[calc(57vh-16px)]">
                <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-4">Supported By:</h3>
                <div className="relative w-full h-[calc(100%-20px)] overflow-hidden rounded-md">
                  {sponsorImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Sponsor ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover rounded-xl p-4 -translate-y-4 transition-all duration-[2500ms] ease-in-out ${
                        index === currentSponsorIndex
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-95'
                      }`}
                    />
                  ))}
                </div>
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