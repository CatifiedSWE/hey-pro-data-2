/**
 * User Profile Widget Component
 * 
 * Reusable widget for displaying user profile cards.
 * Used in the left sidebar and potentially in other locations.
 * 
 * Features:
 * - User avatar
 * - Name and title/bio
 * - Stats (referrals, connections, etc.)
 * - Action buttons (optional)
 * 
 * Props:
 * - user: User object with name, bio, avatar, stats
 * - showActions: Boolean to show/hide action buttons
 * - variant: 'full' | 'compact' for different display modes
 */

'use client';

export default function UserProfileWidget({ 
  user = {},
  showActions = true,
  variant = 'full' 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-gray-300 mb-4">
        {/* Placeholder for user avatar */}
      </div>

      {/* User Info */}
      <h3 className="text-lg font-bold mb-1">{user.name || 'User Name'}</h3>
      <p className="text-sm text-gray-600 mb-3">
        {user.bio || 'User bio and professional description goes here.'}
      </p>

      {/* Stats */}
      {variant === 'full' && (
        <div className="text-sm text-gray-500 mb-4">
          <span>+{user.referrals || 0} Referrals</span>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <button className="w-full bg-[#FA6E80] text-white py-2 rounded-lg hover:bg-[#e95d6f] transition-colors">
          View Profile
        </button>
      )}
    </div>
  );
}
