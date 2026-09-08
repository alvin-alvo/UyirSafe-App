import React from 'react';

export const ReportCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse w-full flex flex-col gap-3">
      {/* Thumbnail Skeleton */}
      <div className="w-full h-40 bg-gray-200 rounded-xl" />
      
      {/* Content Skeleton */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="h-5 bg-gray-200 rounded-md w-3/4" />
        <div className="h-4 bg-gray-200 rounded-md w-1/2" />
      </div>
      
      {/* Footer / Status Skeleton */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
        <div className="h-6 bg-gray-200 rounded-full w-24" />
        <div className="h-4 bg-gray-200 rounded-md w-16" />
      </div>
    </div>
  );
};
