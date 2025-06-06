import React, { useState, useEffect, useRef } from 'react';
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
import PersonalDetails from '../components/PersonalDetails';

const Profile = () => {
  const { user, loading, logout } = useAuth();

  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const username = user.username || 'Guest';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const [profileImg, setProfileImg] = useState('/default-profile.jpg'); // path to default pfp

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImg(reader.result);
      reader.readAsDataURL(file);
    }
  };


  return (
    <main
      className="min-h-screen flex p-4"
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
            <li><NavLink to="/user/previous-reports" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}><ArrowPathIcon className={styles.navIcon} /><span>Previous Report</span></NavLink></li>
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

      <div className={styles.mainContent + " flex-1"}>
        {/* Header with Profile Photo & Logout */}
        <div className="card glass rounded-lg p-6 mb-6 flex items-center justify-between relative">
          {/* Profile & Username Section */}
          <div className="flex items-center space-x-4">
            <div className="relative group w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
              <img
                src={profileImg || '/default-profile.jpg'}
                alt="Profile"
                className="object-cover w-full h-full group-hover:blur-sm transition duration-300"
              />
              <label
                htmlFor="profile-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleProfileChange}
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[var(--primary-color)]">{username}</h2>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-[var(--red-color)] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>



        <div className="grid  gap-6">

          <PersonalDetails username={username} />


        </div>
      </div>


    </main>
  );
};

export default Profile;