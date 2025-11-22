'use client';

import Link from 'next/link';

// Dummy profile data
const profiles = [
  {
    id: 1,
    name: 'David Garcia',
    role: 'Producer + 2 roles',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 2,
    name: 'Ava Jackson',
    role: 'Producer + 2 roles',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 3,
    name: 'Olivia Martin',
    role: 'Producer + 2 roles',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  },
  {
    id: 4,
    name: 'Ella Lewis',
    role: 'Producer + 2 roles',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 5,
    name: 'Olivia Martin',
    role: 'Producer + 2 roles',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
  },
  {
    id: 6,
    name: 'Michael Jones',
    role: 'Producer + 2 roles',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  }
];

export default function RightSidebar() {
  return (
    <aside className="hidden lg:block w-80 sticky top-20 h-fit">
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <h3 className="text-lg font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FA6E80] to-[#31A7AC]">
          View Profiles
        </h3>

        {/* Profile List */}
        <div className="space-y-3 mb-4">
          {profiles.map((profile) => (
            <Link 
              key={profile.id}
              href={`/profile/${profile.id}`}
              className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                <img 
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{profile.name}</h4>
                <p className="text-xs text-gray-500 truncate">{profile.role}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* View Directory Link */}
        <Link 
          href="/community"
          className="text-[#FA6E80] text-sm font-medium hover:underline inline-block"
        >
          View crew directory
        </Link>
      </div>
    </aside>
  );
}
