'use client';

import Link from 'next/link';

export default function LeftSidebar() {
  return (
    <aside className="hidden lg:block w-80 sticky top-20 h-fit">
      {/* SLATE Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
          SLATE
        </h2>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        {/* Profile Header with Background */}
        <div className="h-24 bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] relative">
          <div className="absolute -bottom-8 left-6">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-300 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-12 px-6 pb-4">
          <h3 className="text-xl font-bold mb-1">John Doe</h3>
          <p className="text-sm text-gray-600 mb-3">
            Award-winning cinematographer with 10+ years in narrative film and commercial production and collaborative filmmaking.
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
              <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white -ml-2"></div>
              <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white -ml-2"></div>
            </div>
            <span className="text-[#FA6E80] font-semibold">+240 Referrals</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-xl shadow-sm p-2 mb-4">
        <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-gray-700">Profile</span>
        </Link>
        <Link href="/saved" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="text-gray-700">Saved</span>
        </Link>
        <Link href="/help" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700">Help</span>
        </Link>
        <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-gray-700">Settings</span>
        </Link>
      </div>

      {/* Send Invite Button */}
      <button className="w-full border-2 border-[#FA6E80] text-[#FA6E80] py-3 rounded-lg font-semibold hover:bg-[#FA6E80] hover:text-white transition-colors">
        Send Invite
      </button>
    </aside>
  );
}
