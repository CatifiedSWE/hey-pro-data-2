'use client';

import MainLayout from '@/components/layout/MainLayout';
import FeedContainer from '@/components/feed/FeedContainer';

// Dummy post data
const dummyPosts = [
  {
    id: 1,
    userName: 'Sophia Hernandez',
    userRole: 'Producer + 2 roles',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    media: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ali...',
    likes: 42,
    comments: 8,
    timestamp: '2h ago'
  },
  {
    id: 2,
    userName: 'James Rodriguez',
    userRole: 'Music Director + 4 roles',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    media: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ali...',
    likes: 156,
    comments: 23,
    timestamp: '5h ago'
  },
  {
    id: 3,
    userName: 'Mia Taylor',
    userRole: 'Producer + 2 roles',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    media: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ali...',
    likes: 89,
    comments: 12,
    timestamp: '1d ago'
  }
];

export default function HomePage() {
  return (
    <MainLayout>
      <FeedContainer posts={dummyPosts} />
    </MainLayout>
  );
}
