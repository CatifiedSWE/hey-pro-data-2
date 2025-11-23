'use client';

import { useState } from 'react';

export default function GigCard({ gig }) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Checkbox */}
        <div className="flex-shrink-0">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-[#FA6E80] focus:ring-[#FA6E80] cursor-pointer"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold text-black">
            {gig.title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {gig.description}
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-semibold">Qualifying criteria:</span>{' '}
            {gig.qualifyingCriteria}
          </p>
        </div>

        {/* Right Info Section */}
        <div className="flex-shrink-0 lg:text-right space-y-2 lg:min-w-[250px]">
          <p className="text-lg sm:text-xl font-semibold text-black">
            {gig.currency} {gig.amount.toLocaleString()}
          </p>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-start lg:justify-end gap-2">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
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
              <div>
                {gig.dates.map((date, index) => (
                  <p key={index}>
                    {date.month} | {date.days}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex items-start lg:justify-end gap-2">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-left lg:text-right">
                {gig.locations.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
