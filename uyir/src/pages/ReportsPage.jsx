import React, { useState, useEffect } from "react";
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
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { ChevronDown } from 'lucide-react';
import styles from "./ReportsPage.module.css";
import userStyles from "../styles/User.module.css";
import backgroundImage from '../assets/user-background.png';
import { ReportCardSkeleton } from '../components/ReportCardSkeleton';
import { BottomSheetSelector } from '../components/BottomSheetSelector';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [fetchError, setFetchError] = useState("");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  useEffect(() => {
    // Fetch the signed-in user's reports from /user.
    // Auth is the session_token cookie (sent via credentials: "include").
    // A 401/400 means the session is missing or expired -> back to login.
    // (No document.cookie check: the user_name cookie can be absent while
    // the session is still valid, and vice versa.)
    const fetchReports = async () => {
      try {
        setLoading(true);
        setFetchError("");
        const response = await fetch("http://localhost:6969/user", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401 || response.status === 400) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const result = await response.json();
        console.log(result);

        // /user returns { points (user total), data (user's reports) }.
        // Points are per-user, not per-report, so they feed the header.
        setTotalPoints(result.points || 0);

        // Sort reports so that pending and needs review reports appear first
        const sortedReports = [...(result.data || [])].sort((a, b) => {
          const aPriority = a.status === "Pending" ? 1 : a.status === "Needs Review" ? 2 : 3;
          const bPriority = b.status === "Pending" ? 1 : b.status === "Needs Review" ? 2 : 3;
          return aPriority - bPriority;
        });

        setReports(sortedReports);
        setFilteredReports(sortedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setFetchError("Could not load your reports. Please try again.");
      } finally {
        setLoading(false);
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

  const renderStatusBadge = (status) => {
    if (status === 'Resolved') {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 shadow-sm inline-flex items-center gap-1">
          {status}
        </span>
      );
    }
    if (status === 'Needs Review') {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 shadow-sm inline-flex items-center gap-1.5 w-max">
          <MagnifyingGlassIcon className="h-4 w-4" />
          {status}
        </span>
      );
    }
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 shadow-sm inline-flex items-center gap-1">
        {status}
      </span>
    );
  };

  return (
    <main
      className="min-h-full flex flex-col p-4 pb-20"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className={`${userStyles.mainContent} ${styles.container}`}>
        <div className="mt-6 w-full">
          <div className="flex flex-col gap-2 mb-6">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">Filter by Status</span>
            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm"
            >
              <span className="text-gray-900 font-medium">{filter}</span>
              <span className="text-gray-400 bg-gray-100 p-1 rounded-full"><ChevronDown size={16} /></span>
            </button>
            <BottomSheetSelector
              isOpen={isFilterSheetOpen}
              onClose={() => setIsFilterSheetOpen(false)}
              title="Filter by Status"
              options={[
                { label: 'All', value: 'All' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Needs Review', value: 'Needs Review' },
                { label: 'Resolved', value: 'Resolved' },
              ]}
              selectedValue={filter}
              onSelect={(val) => handleFilterChange({ target: { value: val }})}
            />
          </div>
          
          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Your Reports</h2>
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 shadow-sm">
                Total Points: {totalPoints}
              </span>
            </div>

            {fetchError ? (
              <p className="py-8 px-4 text-center text-red-500 font-medium">{fetchError}</p>
            ) : loading ? (
              <div className="flex flex-col items-center gap-6 w-full">
                <ReportCardSkeleton />
                <ReportCardSkeleton />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-white bg-opacity-10 text-[var(--primary-color)]">
                      <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Report Name</th>
                      <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Date</th>
                      <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report, index) => (
                        <tr
                          key={`report-${report.id || index}`}
                          className="border-t border-white border-opacity-10 hover:bg-white hover:bg-opacity-5 transition-colors"
                        >
                          <td className="py-4 px-4 text-black font-medium whitespace-nowrap">{report.type || `Report #${index + 1}`}</td>
                          <td className="py-4 px-4 text-gray-700 whitespace-nowrap">{formatDate(report.date)}</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {renderStatusBadge(report.status)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-8 px-4 text-center text-gray-500 font-medium">
                          No reports found for this status.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};