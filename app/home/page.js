'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import FeedContainer from '@/components/feed/FeedContainer';
import { supabase } from '@/lib/supabase';

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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      try {
        // Check if we've already verified auth in this session (one-time check)
        const authVerified = sessionStorage.getItem('heyprodata-auth-verified');
        
        if (authVerified === 'true') {
          // Already verified in this session, skip loading screen
          setLoading(false);
          return;
        }

        // First-time check in this session
        setIsVerifying(true);
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not logged in, redirect to login
          router.push('/auth/login');
          return;
        }

        // Check if user has completed their profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking profile:', error);
        }

        // If no profile exists, redirect to form page
        if (!profile) {
          router.push('/auth/form');
          return;
        }

        // Mark auth as verified for this session
        sessionStorage.setItem('heyprodata-auth-verified', 'true');
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth/login');
      }
    };

    checkAuthAndProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <FeedContainer posts={dummyPosts} />
    </MainLayout>
  );
}
