import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
// import TeacherDashboard from "./pages/TeacherDashboard.jsx";

import { useState, useEffect } from "react";
import "./App.css";
import { SignUp } from "./pages/SignUp.jsx";
import { Login } from "./pages/Login.jsx";
import { ReportsPage } from "./pages/ReportsPage.jsx";
import { NewReport } from "./pages/NewReport.jsx";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user" element={<ReportsPage />} />
        <Route path="/newreport" element={<NewReport />} />
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
  );
};

export default App;
