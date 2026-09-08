import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User as UserIcon, Phone, Globe, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ListTile } from '../components/ListTile';
import { BottomSheetSelector } from '../components/BottomSheetSelector';
import { useTranslation } from 'react-i18next'; // Ensure this matches user's locale library if installed

export const Profile = () => {
  const { user, loading, logout } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [isLangSheetOpen, setIsLangSheetOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse w-12 h-12 bg-gray-200 rounded-full" />
      </div>
    );
  }

  const username = user?.username || 'Guest';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 pb-20 animate-in fade-in duration-300">
      {/* Native-style header without heavy background images */}
      <div className="pt-12 pb-6 px-6 bg-white shadow-sm flex items-center gap-4 border-b border-gray-100">
         <img src="/default-profile.jpg" alt="Profile" className="w-16 h-16 rounded-full border border-gray-200" />
         <div>
           <h1 className="text-2xl font-bold text-gray-900">{username}</h1>
           <p className="text-sm text-gray-500">{user?.email || 'No email provided'}</p>
         </div>
      </div>

      <div className="px-4 mt-6 flex flex-col gap-6">
        {/* Section: Account */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Account</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ListTile 
              icon={UserIcon} 
              title="Personal Details" 
              subtitle="Name, DOB, Gender" 
              onClick={() => {}} 
            />
            <ListTile 
              icon={Phone} 
              title="Contact Info" 
              subtitle="Email & Phone" 
              onClick={() => {}} 
            />
          </div>
        </section>

        {/* Section: Preferences */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Preferences</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ListTile 
              icon={Globe} 
              title="Language" 
              subtitle={currentLang === 'ta' ? 'Tamil' : 'English'} 
              onClick={() => setIsLangSheetOpen(true)} 
            />
          </div>
        </section>

        {/* Section: Security */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Security</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ListTile 
              icon={ShieldCheck} 
              title="Identity Verification" 
              rightElement={<span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200 shadow-sm">Verified</span>} 
            />
          </div>
        </section>
        
        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden mt-4">
          <ListTile 
            icon={LogOut} 
            title="Log Out" 
            isDestructive 
            onClick={handleLogout} 
          />
        </div>
      </div>

      <BottomSheetSelector
        isOpen={isLangSheetOpen}
        onClose={() => setIsLangSheetOpen(false)}
        title="Select Language"
        options={[
          { label: 'English', value: 'en' },
          { label: 'தமிழ்', value: 'ta' }
        ]}
        selectedValue={currentLang}
        onSelect={handleLanguageChange}
      />
    </div>
  );
};

export default Profile;