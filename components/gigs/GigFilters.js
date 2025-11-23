'use client';

import { useState } from 'react';

export default function GigFilters({ selectedGig, onGigChange, gigs }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Gig Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Gig
          </label>
          <select
            value={selectedGig}
            onChange={(e) => onGigChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA6E80] focus:border-transparent"
          >
            {gigs.map((gig) => (
              <option key={gig.id} value={gig.id}>
                {gig.title}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-semibold text-gray-900">2025</span>
              <span className="bg-[#FA6E80] text-white px-3 py-1 rounded-full text-xs font-medium">
                Sep
              </span>
              <span className="text-gray-700">12, 15, 16-25</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">2026</span>
              <span className="bg-[#FA6E80] text-white px-3 py-1 rounded-full text-xs font-medium">
                Jan
              </span>
              <span className="text-gray-700">11-13</span>
            </div>
          </div>
        </div>

        {/* More Filters Button */}
        <div className="flex items-end">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA6E80] focus:border-transparent">
                <option>All Locations</option>
                <option>Dubai Design District</option>
                <option>Location1</option>
                <option>Location3</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA6E80] focus:border-transparent">
                <option>All Departments</option>
                <option>Camera</option>
                <option>Lighting</option>
                <option>Sound</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA6E80] focus:border-transparent">
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Shortlisted</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
