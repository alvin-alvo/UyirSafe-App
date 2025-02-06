import React, { useState, useEffect } from "react";
import { UserHeader } from "../components/UserHeader";
import { ReportCard } from "../components/ReportCard";
import styles from "./ReportsPage.module.css";
import { Navigate, useNavigate } from "react-router-dom";

export const ReportsPage = () => {
  const [userName, setUserName] = useState("Guest");
  const [reports, setReports] = useState([]);
  const [points, setPoints] = useState(0);
  const navigate = useNavigate();

  // Function to get username from cookies
  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  useEffect(() => {
    const storedUserName = getCookie("user_name");
    if (storedUserName) {
      setUserName(storedUserName);
    }

    // Fetch reports from /reports
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:6969/user", {
          method: "GET",
          credentials: "include", // Ensure cookies are sent
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const result = await response.json();
        console.log(result);
        setReports(result.data || []);
        setPoints(result.points || 0);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  const handleNewReport = () => {
    console.log("New report button clicked");
    navigate("/newreport")
  };

  return (
    <main className={styles.container}>
      <UserHeader
        userName={userName}
        points={points} // Updated to use API value
        avatarUrl="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D"
        onNewReport={handleNewReport}
      />
      <section className={styles.reportsList} aria-label="Road issue reports">
        {reports.map((report, index) => (
          <ReportCard key={`report-${index}`} {...report} />
        ))}
      </section>
    </main>
  );
};
