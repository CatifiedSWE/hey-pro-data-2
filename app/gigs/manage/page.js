'use client';

import { useState } from 'react';
import GigsList from '@/components/gigs/GigsList';
import ApplicationsTab from '@/components/gigs/ApplicationsTab';
import AvailabilityCheckTab from '@/components/gigs/AvailabilityCheckTab';
import ContactListTab from '@/components/gigs/ContactListTab';

export default function ManageGigsPage() {
  const [activeTab, setActiveTab] = useState('gigs');

  const tabs = [
    { id: 'gigs', label: 'Gigs' },
    { id: 'application', label: 'Application' },
    { id: 'availability', label: 'Availability Check' },
    { id: 'contact', label: 'Contact list' },
  ];

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Gradient Title */}
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FA6E80] to-[#6A89BE] bg-clip-text text-transparent mb-8">
          <span className="text-[#FA6E80]">Manage </span>
          <span className="text-[#6A89BE]">Gigs</span>
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 sm:gap-8 border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-2 whitespace-nowrap font-medium text-sm sm:text-base transition-all ${
                activeTab === tab.id
                  ? 'bg-[#F8F8F8] text-black border-b-2 border-transparent'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'gigs' && <GigsList />}
          {activeTab === 'application' && <ApplicationsTab />}
          {activeTab === 'availability' && <AvailabilityCheckTab />}
          {activeTab === 'contact' && <ContactListTab />}
        </div>
      </div>
    </div>
  );
}
