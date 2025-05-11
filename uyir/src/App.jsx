import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api"; // Import LoadScript for Google Maps
import "./App.css";
import { SignUp } from "./pages/SignUp.jsx";
import { Login } from "./pages/Login.jsx";
import { ReportsPage } from "./pages/ReportsPage.jsx";
import { NewReport } from "./pages/NewReport.jsx";
import { AdminDashboard } from "./pages/AdminPage.jsx";

const key = import.meta.env.VITE_Google; // Use your Google Maps API key

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <LoadScript googleMapsApiKey={key}>
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<ReportsPage />} />
          <Route path="/newreport" element={<NewReport />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Uncomment and modify as needed */}
          {/* <Route
            path="/faculty"
            element={
              <ProtectedRoute requiredRole="faculty">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </Router>
    </LoadScript>
  );
};

export default App;