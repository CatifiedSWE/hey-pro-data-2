'use client';

import { useState } from 'react';
import PostCard from './PostCard';

export default function FeedContainer({ posts: initialPosts = [] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate loading more posts
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-gray-500 text-lg mb-2">No posts yet</p>
        <p className="text-gray-400">
          Follow some profiles to see their content in your feed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Posts */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA6E80]"></div>
          <p className="text-gray-500 mt-2">Loading more posts...</p>
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && posts.length > 0 && (
        <button 
          onClick={handleLoadMore}
          className="w-full bg-white rounded-xl shadow-sm p-4 text-[#FA6E80] hover:bg-gray-50 transition-colors font-medium"
        >
          Load More
        </button>
      )}
    </div>
  );
}
