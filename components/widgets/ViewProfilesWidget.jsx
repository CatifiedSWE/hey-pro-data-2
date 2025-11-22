/**
 * View Profiles Widget Component
 * 
 * Reusable widget for displaying a list of user profiles.
 * Used in the right sidebar to suggest profiles to view.
 * 
 * Features:
 * - Header with title
 * - List of profile cards (avatar + name + role)
 * - "View directory" or similar CTA link
 * - Click on profile to navigate to their page
 * 
 * Props:
 * - profiles: Array of profile objects
 * - title: Widget title (default: "View Profiles")
 * - onProfileClick: Callback when profile is clicked
 */

'use client';

export default function ViewProfilesWidget({ 
  profiles = [],
  title = 'View Profiles',
  onProfileClick = () => {} 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <h3 className="text-lg font-bold mb-4">{title}</h3>

      {/* Profile List */}
      <div className="space-y-3 mb-4">
        {profiles.length > 0 ? (
          profiles.map((profile, index) => (
            <div 
              key={index} 
              onClick={() => onProfileClick(profile)}
              className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gray-300">
                {/* Placeholder for profile avatar */}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{profile.name || 'Name'}</h4>
                <p className="text-xs text-gray-500">{profile.role || 'Role'}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">
            No profiles to display
          </p>
        )}
      </div>

      {/* CTA Link */}
      <button className="text-[#FA6E80] text-sm hover:underline">
        View crew directory
      </button>
    </div>
  );
}
