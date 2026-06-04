import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
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
import styles from "./ReportsPage.module.css";
import userStyles from "../styles/User.module.css";
import backgroundImage from '../assets/user-background.png';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filter, setFilter] = useState("All");

  // Function to get username from cookies
  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  useEffect(() => {
    const storedUserName = getCookie("user_name");
    if (!storedUserName) {
      window.location.href = "/login";
      return;
    }

    // Fetch reports from /user
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:6969/user", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const result = await response.json();
        console.log(result);

        // Sort reports so that pending reports appear first
        const sortedReports = (result.data || []).sort((a, b) => {
          if (a.status === "Pending" && b.status !== "Pending") return -1;
          if (a.status !== "Pending" && b.status === "Pending") return 1;
          return 0;
        });

        setReports(sortedReports);
        setFilteredReports(sortedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  // Handle filter change
  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilter(selectedFilter);

    if (selectedFilter === "All") {
      setFilteredReports(reports);
    } else {
      const filtered = reports.filter(
        (report) => report.status === selectedFilter
      );
      setFilteredReports(filtered);
    }
  };

  // Format date to DD-MM-YYYY
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
      <nav className={`${userStyles.nav} glass`}>
        <div className={userStyles.logoContainer}>
          <h1 className="text-3xl font-bold text-3d">
            <span className="text-[var(--primary-color)]">Uyir</span>
            <span className="text-[var(--red-color)]">Safe</span>
          </h1>
        </div>
        <div className={userStyles.navContent}>
          <div className={styles.menuSection}>
          <h2 className={userStyles.menuHeading}>Menu</h2>
          <ul className={userStyles.navList}>
            <li>
              <NavLink
                to="/user"
                className={({ isActive }) =>
                  `${userStyles.navItem} ${isActive ? userStyles.active : ''}`
                }
                end
              >
                <HomeIcon className={userStyles.navIcon} />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/new-report"
                className={({ isActive }) =>
                  `${userStyles.navItem} ${isActive ? userStyles.active : ''}`
                }
              >
                <PlusCircleIcon className={userStyles.navIcon} />
                <span>New Report</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/previous-reports"
                className={({ isActive }) =>
                  `${userStyles.navItem} ${isActive ? userStyles.active : ''}`
                }
              >
                <ArrowPathIcon className={userStyles.navIcon} />
                <span>Previous Report</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/redeem"
                className={({ isActive }) =>
                  `${userStyles.navItem} ${isActive ? userStyles.active : ''}`
                }
              >
                <SparklesIcon className={userStyles.navIcon} />
                <span>Redeem Points</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/user/profile"
                className={({ isActive }) =>
                  `${userStyles.navItem} ${isActive ? userStyles.active : ''}`
                }
              >
                <UserIcon className={userStyles.navIcon} />
                <span>User Profile</span>
              </NavLink>
            </li>
          </ul>
          </div>
          <div className={userStyles.otherServices}>
            <h2 className={userStyles.menuHeading}>Other Services</h2>
            <ul className={userStyles.serviceList}>
              <li>
                <button className={userStyles.serviceButton} onClick={() => console.log('Points System clicked')}>
                  <Cog8ToothIcon className={userStyles.serviceIcon} />
                  <span>Points System</span>
                </button>
              </li>
              <li>
                <button className={userStyles.serviceButton} onClick={() => console.log('Road Safety Quiz clicked')}>
                  <ShieldCheckIcon className={userStyles.serviceIcon} />
                  <span>Road Safety Quiz</span>
                </button>
              </li>
              <li>
                <button className={userStyles.serviceButton} onClick={() => console.log('Partnership clicked')}>
                  <HandRaisedIcon className={userStyles.serviceIcon} />
                  <span>Partnership</span>
                </button>
              </li>
              <li>
                <button className={userStyles.serviceButton} onClick={() => console.log('Feedbacks clicked')}>
                  <ChatBubbleLeftRightIcon className={userStyles.serviceIcon} />
                  <span>Feedbacks</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className={`${userStyles.mainContent} ${styles.container}`}>
        <div className="mt-6 w-full">
          <div className={styles.filterContainer}>
            <label htmlFor="filter" className={styles.filterLabel}>
              Filter by Status:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={handleFilterChange}
              className={`${styles.filterDropdown} glass`}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="glass rounded-lg p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white bg-opacity-10 text-[var(--primary-color)]">
                  <th className="py-3 px-6 text-left font-semibold">Report Name</th>
                  <th className="py-3 px-6 text-left font-semibold">Date</th>
                  <th className="py-3 px-6 text-left font-semibold">Status</th>
                  <th className="py-3 px-6 text-right font-semibold">Points</th>
                  <th className="py-3 px-6 text-center font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report, index) => (
                    <tr
                      key={`report-${report.id || index}`}
                      className="border-t border-white border-opacity-10 hover:bg-white hover:bg-opacity-5 transition-colors"
                    >
                      <td className="py-4 px-6 text-black">{report.type || `Report #${index + 1}`}</td>
                      <td className="py-4 px-6 text-black">{formatDate(report.date)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-semibold ${report.status === 'Resolved'
                              ? 'bg-green-500 bg-opacity-20 text-green-400'
                              : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                            }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-black">{report.points || 0}</td>
                      <td className="py-4 px-6 text-center">
                        <NavLink
                          to={`/user/report/${report.id || index}`}
                          className="inline-block px-4 py-2 bg-[var(--red-color)] text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          View
                        </NavLink>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 px-6 text-center text-gray-400">
                      No reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};