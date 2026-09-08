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
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

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
        setLoading(true);
        const response = await fetch("http://localhost:6969/user", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const result = await response.json();
        console.log(result);

        // Sort reports so that pending and needs review reports appear first
        const sortedReports = (result.data || []).sort((a, b) => {
          const aPriority = a.status === "Pending" ? 1 : a.status === "Needs Review" ? 2 : 3;
          const bPriority = b.status === "Pending" ? 1 : b.status === "Needs Review" ? 2 : 3;
          return aPriority - bPriority;
        });

        setReports(sortedReports);
        setFilteredReports(sortedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
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
            <h2 className="text-xl font-bold mb-4 text-gray-800">Your Reports</h2>
            
            {loading ? (
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
                      <th className="py-3 px-4 text-right font-semibold whitespace-nowrap">Points</th>
                      <th className="py-3 px-4 text-center font-semibold whitespace-nowrap">Details</th>
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
                          <td className="py-4 px-4 text-right font-semibold text-black whitespace-nowrap">{report.points || 0}</td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <NavLink
                              to={`/user/report/${report.id || index}`}
                              className="inline-block px-4 py-2 bg-[var(--red-color)] text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                            >
                              View
                            </NavLink>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 px-4 text-center text-gray-500 font-medium">
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