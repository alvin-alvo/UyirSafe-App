import React from 'react';

export const UserHeader = ({ userName, points, avatarUrl, onNewReport }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-transparent">
      <div className="flex items-center space-x-4">
        <img
          src={avatarUrl}
          alt={`${userName}'s profile`}
          className="w-12 h-12 rounded-full border-2 border-[var(--primary-color)]"
        />
        <div>
          <h1 className="text-xl font-semibold text-[var(--primary-color)]">
            {userName}
          </h1>
          <p className="text-sm text-gray-600">Points: {points}</p>
        </div>
      </div>
      <button
        className="btn-primary"
        onClick={onNewReport}
        aria-label="Create new road issue report"
      >
        New Report
      </button>
    </header>
  );
};