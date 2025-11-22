'use client';

import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Top Navigation */}
      <Navbar />

      {/* Three Column Layout */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <LeftSidebar />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
            {children}
          </main>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
