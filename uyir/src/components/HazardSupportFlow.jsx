import React, { useState, useEffect } from 'react';
import { ThumbsUp, AlertTriangle, MapPin, Clock } from 'lucide-react';

export const HazardSupportFlow = ({ hazardId, onSupportComplete }) => {
  const [loading, setLoading] = useState(true);
  const [hazardDetails, setHazardDetails] = useState(null);

  useEffect(() => {
    // Simulate fetching hazard details
    setLoading(true);
    const fetchDetails = async () => {
      await new Promise(res => setTimeout(res, 1200)); // Simulating network delay
      setHazardDetails({
        title: 'Deep Pothole on Main St.',
        description: 'Large pothole in the middle lane causing severe traffic slowdowns. Multiple cars have hit it.',
        type: 'Pothole',
        supporters: 14,
        timeReported: '2 hours ago',
        location: 'Avinashi Road, Coimbatore'
      });
      setLoading(false);
    };
    if (hazardId) fetchDetails();
  }, [hazardId]);

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col gap-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-20 bg-gray-200 rounded-xl w-full" />
        <div className="flex justify-between mt-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="h-14 bg-gray-200 rounded-xl w-full mt-4" />
      </div>
    );
  }

  if (!hazardDetails) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-red-600 bg-red-50 w-max px-3 py-1 rounded-full text-sm font-semibold mb-1">
        <AlertTriangle size={16} />
        {hazardDetails.type}
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900">{hazardDetails.title}</h2>
      
      <div className="flex flex-col gap-2 mt-2 text-gray-600 text-sm">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-blue-500" />
          <span>{hazardDetails.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-500" />
          <span>Reported {hazardDetails.timeReported}</span>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm my-4 border border-gray-100 shadow-inner">
        {hazardDetails.description}
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">
          <span className="text-gray-900 font-bold text-lg">{hazardDetails.supporters}</span> people supported this
        </span>
      </div>

      <button 
        onClick={onSupportComplete}
        className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-200"
      >
        <ThumbsUp size={20} />
        Support this Issue
      </button>
      <p className="text-xs text-center text-gray-400 mt-2">Supporting this issue alerts authorities faster without creating duplicates.</p>
    </div>
  );
};
