import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import './App.css';
import { Layout } from './components/Layout.jsx';

// Lazy loading pages for performance optimization
const SignUp = lazy(() => import('./pages/SignUp.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const User = lazy(() => import('./pages/User.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const ReportsPage = lazy(() => import('./pages/ReportsPage.jsx').then(m => ({ default: m.ReportsPage })));
const NewReport = lazy(() => import('./pages/NewReport.jsx').then(m => ({ default: m.NewReport })));
const RedeemPoints = lazy(() => import('./pages/RedeemPoints.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminPage.jsx').then(m => ({ default: m.AdminDashboard })));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback.jsx').then(m => ({ default: m.OAuthCallback })));

const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Clean loading spinner for Suspense fallback
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

const App = () => {
  return (
    <LoadScript googleMapsApiKey={key}>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Auth Routes without Layout */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            
            {/* Main Application Routes with Bottom Navigation Layout */}
            <Route element={<Layout />}>
              <Route path="/user" element={<User />} />
              <Route path="/user/new-report" element={<NewReport />} />
              <Route path="/user/previous-reports" element={<ReportsPage />} />
              <Route path="/user/redeem" element={<RedeemPoints />} />
              <Route path="/user/profile" element={<Profile />} />
            </Route>

            {/* Other routes */}
            <Route path="/newreport" element={<NewReport />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </Router>
    </LoadScript>
  );
};

export default App;