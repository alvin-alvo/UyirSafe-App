import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import "./App.css";
import SignUp from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import User from './pages/User.jsx';
import { ReportsPage } from "./pages/ReportsPage.jsx";
import { NewReport } from "./pages/NewReport.jsx";
import { AdminDashboard } from "./pages/AdminPage.jsx";

const key = import.meta.env.VITE_Google;

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <LoadScript googleMapsApiKey={key}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<User />} />
          <Route path="/user/new-report" element={<NewReport />} /> {/* Map to NewReport */}
          <Route path="/user/previous-reports" element={<ReportsPage />} /> {/* Repurpose ReportsPage */}
          <Route path="/user/redeem" element={<div>Redeem Points Page</div>} />
          <Route path="/user/profile" element={<div>User Profile Page</div>} />
          <Route path="/newreport" element={<NewReport />} /> {/* Keep for backward compatibility */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </LoadScript>
  );
};

export default App;