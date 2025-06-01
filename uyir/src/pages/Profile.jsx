import React from 'react';
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
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/User.module.css';
import backgroundImage from '../assets/user-background.png';

const Profile = () => {
  const { user, loading, logout } = useAuth();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  const username = user.username || 'Guest';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <main
      className="min-h-screen flex p-4"
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
      <div className={styles.mainContent}>
        <div className="card glass rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold text-[var(--primary-color)]">
            Username: {username}
          </h2>
          <p className="text-gray-600 mt-2">
            Welcome to your profile, {username}!
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 relative px-4 py-2 overflow-hidden text-[1rem] text-white text-center border-none cursor-pointer bg-transparent rounded-full transition-transform duration-200 ease"
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
            <span className="relative z-10 font-semibold">Logout</span>
          </button>
          <style jsx>{`
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
              outline-offset: 2px;
            }
          `}</style>
        </div>
      </div>
    </main>
  );
};

export default Profile;