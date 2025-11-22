/**
 * Notification Modal Component
 * 
 * Modal overlay that displays user notifications.
 * 
 * Features:
 * - Triggered by clicking the notification bell icon in the navbar
 * - Shows list of notifications (mentions, likes, comments, follows, etc.)
 * - Mark as read functionality
 * - Clear all notifications option
 * - Close on outside click or ESC key
 * 
 * Implementation: Component overlay (not route interceptor)
 * - Better for mobile experience (can slide from top/bottom)
 * - Easier state management
 * - Works well with real-time updates
 */

'use client';

import { useEffect } from 'react';

export default function NotificationModal({ isOpen, onClose }) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-16 right-4 w-96 max-h-[600px] bg-white rounded-lg shadow-xl z-50 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold">Notifications</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto max-h-[500px] p-4">
          <p className="text-gray-500 text-center py-8">
            Placeholder for notification items.
            <br />
            Notifications will appear here.
          </p>
        </div>
      </div>
    </>
  );
}
