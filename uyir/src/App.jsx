import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import './App.css';
import SignUp from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import User from './pages/User.jsx';
import Profile from './pages/Profile.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { NewReport } from './pages/NewReport.jsx';
import { AdminDashboard } from './pages/AdminPage.jsx';

const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const App = () => {
  return (
    <LoadScript googleMapsApiKey={key}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<User />} />
          <Route path="/user/new-report" element={<NewReport />} />
          <Route path="/user/previous-reports" element={<ReportsPage />} />
          <Route path="/user/redeem" element={<div>Redeem Points Page</div>} />
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/newreport" element={<NewReport />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </LoadScript>
  );
};

export default App;