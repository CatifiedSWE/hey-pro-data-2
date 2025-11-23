'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NotificationModal from '@/components/modals/NotificationModal';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <Link href="/home" className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">hpd</span>
              </div>
            </Link>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FA6E80] focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FA6E80] text-white p-2 rounded-full hover:bg-[#e95d6f] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right: Navigation Links & Actions */}
            <div className="flex items-center space-x-6">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="relative">
                  <button 
                    onClick={() => setShowExploreMenu(!showExploreMenu)}
                    className="text-gray-700 hover:text-gray-900 flex items-center space-x-1"
                  >
                    <span>Explore</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showExploreMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link href="/explore" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">All Explore</Link>
                      <Link href="/explore" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Projects</Link>
                      <Link href="/explore" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">Talent</Link>
                    </div>
                  )}
                </div>
                <Link href="/gigs/manage" className="text-gray-700 hover:text-gray-900">Gigs</Link>
                <Link href="/whats-on" className="text-gray-700 hover:text-gray-900">What's on</Link>
                <Link href="/community" className="text-gray-700 hover:text-gray-900">Community</Link>
                <Link href="/profile" className="text-gray-700 hover:text-gray-900">Profile</Link>
              </div>

              {/* Slate Button */}
              <button className="bg-gradient-to-r from-[#6A89BE] to-[#85AAB7] text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all">
                Slate
              </button>

              {/* Chat Icon */}
              <Link 
                href="/chat"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>

              {/* Notification Icon */}
              <button 
                onClick={() => setShowNotifications(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Avatar with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden focus:ring-2 focus:ring-[#FA6E80]"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" 
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </button>
                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      View Profile
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      Settings
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <NotificationModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}
