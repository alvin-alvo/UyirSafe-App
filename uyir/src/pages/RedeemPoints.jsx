import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon, PlusCircleIcon, ArrowPathIcon, SparklesIcon, UserIcon,
  Cog8ToothIcon, ShieldCheckIcon, HandRaisedIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/User.module.css';
import backgroundImage from '../assets/user-background.png';

const RedeemPoints = () => {
  const { user, loading } = useAuth();
  if (!loading && !user) return <Navigate to="/login" />;

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
        <div className="card glass rounded-lg p-6 w-full flex items-center justify-center" style={{ height: '60vh' }}>
          <h2 className="text-2xl font-semibold text-[var(--primary-color)]">Redeem Points — Coming Soon!</h2>
        </div>
      </div>
    </main>
  );
};

export default RedeemPoints;
