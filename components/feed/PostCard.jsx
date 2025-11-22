'use client';

import { useState } from 'react';

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  return (
    <article className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
            <img 
              src={post.userAvatar}
              alt={post.userName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{post.userName}</h4>
            <p className="text-sm text-gray-500">{post.userRole}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700 p-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      {/* Post Media */}
      <div className="mt-3">
        <img 
          src={post.media}
          alt="Post content"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Post Actions */}
      <div className="flex items-center space-x-6 px-4 py-3">
        <button 
          onClick={() => setLiked(!liked)}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
        >
          <svg 
            className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : 'fill-none'}`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4">
        <p className="text-gray-700">
          {showFullContent ? post.content : post.content.slice(0, 100) + '...'}
          {post.content.length > 100 && (
            <button 
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-gray-500 hover:text-gray-700 ml-2"
            >
              {showFullContent ? 'see less' : 'see more'}
            </button>
          )}
        </p>
      </div>
    </article>
  );
}
