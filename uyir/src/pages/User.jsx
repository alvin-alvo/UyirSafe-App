import React from 'react';
import { NavLink } from 'react-router-dom';
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
import { UserHeader } from '../components/UserHeader';
import styles from '../styles/User.module.css';
import backgroundImage from '../assets/user-background.png';

const User = () => {
  const user = {
    userName: 'JohnDoe',
    points: 150,
    avatarUrl: 'https://via.placeholder.com/40',
  };

  const handleNewReport = () => {
    console.log('New Report clicked');
  };

  const handlePointsSystem = () => {
    console.log('Points System clicked');
  };

  const handlePartnership = () => {
    console.log('Partnership clicked');
  };

  const handleRoadSafetyQuiz = () => {
    console.log('Road Safety Quiz clicked');
  };

  const handleFeedbacks = () => {
    console.log('Feedbacks clicked');
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
                <button className={styles.serviceButton} onClick={handlePointsSystem}>
                  <Cog8ToothIcon className={styles.serviceIcon} />
                  <span>Points System</span>
                </button>
              </li>
              <li>
                <button className={styles.serviceButton} onClick={handleRoadSafetyQuiz}>
                  <ShieldCheckIcon className={styles.serviceIcon} />
                  <span>Road Safety Quiz</span>
                </button>
              </li>
              <li>
                <button className={styles.serviceButton} onClick={handlePartnership}>
                  <HandRaisedIcon className={styles.serviceIcon} />
                  <span>Partnership</span>
                </button>
              </li>
              <li>
                <button className={styles.serviceButton} onClick={handleFeedbacks}>
                  <ChatBubbleLeftRightIcon className={styles.serviceIcon} />
                  <span>Feedbacks</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className={styles.mainContent}>
        <UserHeader
          userName={user.userName}
          points={user.points}
          avatarUrl={user.avatarUrl}
          onNewReport={handleNewReport}
        />
        <div className="card glass rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold text-[var(--primary-color)]">
            Welcome to the User Dashboard
          </h2>
          <p className="text-gray-600 mt-2">
            This is a placeholder for your dashboard content. Add more features here!
          </p>
        </div>
      </div>
    </main>
  );
};

export default User;