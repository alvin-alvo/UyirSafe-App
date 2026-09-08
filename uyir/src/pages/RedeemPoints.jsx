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
      className="min-h-full flex pb-20"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >


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
