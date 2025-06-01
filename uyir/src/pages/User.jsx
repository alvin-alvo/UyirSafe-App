import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { NavLink, Navigate } from 'react-router-dom';
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
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/User.module.css';
import backgroundImage from '../assets/user-background.png';

const User = () => {
  const { user, loading } = useAuth();
  const [latestReports, setLatestReports] = useState([]);
  const welcomeCardRef = useRef(null);
  const [welcomeCardBottom, setWelcomeCardBottom] = useState(0);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  const username = user.username || 'Guest';

  // Fetch latest reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:6969/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

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

  // Calculate welcome card bottom position
  useLayoutEffect(() => {
    if (welcomeCardRef.current) {
      const rect = welcomeCardRef.current.getBoundingClientRect();
      const mainRect = document.querySelector('main').getBoundingClientRect();
      setWelcomeCardBottom(rect.bottom - mainRect.top);
    }
  }, []);

  // Format date to DD-MM-YYYY
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Toggle placeholder expansion
  const toggleMapExpansion = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  return (
    <main
      className="min-h-screen flex"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
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
                    `${styles.navItem} ${isActive ? styles.active : ''}`
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
                    `${styles.navItem} ${isActive ? styles.active : ''}`
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
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                >
                  <ArrowPathIcon className={styles.navIcon} />
                  <span>Previous Report</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user/redeem"
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
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
                    `${styles.navItem} ${isActive ? styles.active : ''}`
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
                <button className={styles.serviceButton} onClick={() => console.log('Points System clicked')}>
                  <Cog8ToothIcon className={styles.serviceIcon} />
                  <span>Points System</span>
                </button>
              </li>
              <li>
                <button className={styles.serviceButton} onClick={() => console.log('Road Safety Quiz clicked')}>
                  <ShieldCheckIcon className={styles.serviceIcon} />
                  <span>Road Safety Quiz</span>
                </button>
              </li>
              <li>
                <button className={styles.serviceButton} onClick={() => console.log('Partnership clicked')}>
                  <HandRaisedIcon className={styles.serviceIcon} />
                  <span>Partnership</span>
                </button>
              </li>
              <li>
                <button className={styles.serviceButton} onClick={() => console.log('Feedbacks clicked')}>
                  <ChatBubbleLeftRightIcon className={styles.serviceIcon} />
                  <span>Feedbacks</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className={`${styles.mainContent} ${styles.partitionContainer}`}>
        <div className={styles.contentSection} style={{ '--welcome-card-bottom': `${welcomeCardBottom}px` }}>
          <div className="card glass rounded-lg p-6 mt-6" ref={welcomeCardRef}>
            <h2 className="text-2xl font-semibold text-[var(--primary-color)]">
              Welcome {username}
            </h2>
          </div>
          <div className="mt-6 max-w-2xl">
            <NavLink to="/user/new-report" className="w-full">
              <button
                className="relative min-h-[97px] w-full overflow-hidden text-2xl text-white text-center p-[2rem] border-none 
                cursor-pointer bg-transparent rounded-lg transition-transform duration-200 ease flex items-center gap-2"
                style={{ transform: 'translateY(0)' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onFocus={(e) => e.currentTarget.style.outline = '2px solid rgba(114, 136, 199, 1)'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              >
                <div
                  className="absolute inset-0 h-full w-full"
                  style={{
                    backgroundColor: 'var(--red-color)',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--red-color)'}
                />
                <PlusCircleIcon className="h-12 w-12 relative z-10" />
                <span className="relative z-10 font-semibold">New Report</span>
              </button>
            </NavLink>
          </div>
          <div className="mt-6 max-w-2xl">
            <div className="glass rounded-lg p-6" style={{ minHeight: '250px' }}>
              <div className={styles.reportsHeader}>
                <h3 className="text-lg font-semibold text-black">Latest Reports by You</h3>
                <NavLink
                  to="/user/previous-reports"
                  className={styles.seeMoreLink}
                  aria-label="See more reports"
                >
                  See More
                </NavLink>
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
                      <tr
                        key={`report-${report.id || index}`}
                        className="text-white border-t border-white border-opacity-10"
                      >
                        <td className="py-2 px-4">{report.type || `Report #${index + 1}`}</td>
                        <td className="py-2 px-4">{formatDate(report.date)}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              report.status === 'Resolved'
                                ? 'bg-green-500 bg-opacity-20 text-green-400'
                                : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-2 px-4 text-center text-gray-400">
                        No reports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-6 max-w-2xl">
            <div className="glass rounded-lg p-6">
              <div className={styles.reportsHeader}>
                <h3 className="text-lg font-semibold text-black">Your Location</h3>
                <button
                  onClick={toggleMapExpansion}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label={isMapExpanded ? 'Collapse placeholder' : 'Expand placeholder'}
                >
                  {isMapExpanded ? (
                    <ArrowsPointingInIcon className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>
              <div
                className={`w-full ${
                  isMapExpanded ? 'h-[600px]' : 'h-[300px]'
                } rounded-md flex items-center justify-center bg-gray-200 text-gray-600 text-lg font-semibold`}
              >
                Map Placeholder - Coming Soon
              </div>
            </div>
          </div>
        </div>
        <div className={styles.emptySection}></div>
      </div>
      <style jsx>{`
        button {
          transition: transform 0.2s ease, background-color 0.3s ease;
        }
        button:hover {
          transform: translateY(-2px);
        }
        button:active {
          transform: translateY(1px);
        }
        button:focus {
          outline: none;
        }
        button:focus-visible {
          outline: 2px solid rgba(114, 136, 199, 1);
        }
        @media (max-width: 768px) {
          button {
            min-height: 60px;
            font-size: 1.5rem;
            padding: 1rem;
          }
        }
        @media (max-width: 480px) {
          button {
            min-height: 60px;
            font-size: 1.25rem;
            padding: 1rem;
          }
        }
      `}</style>
    </main>
  );
};

export default User;