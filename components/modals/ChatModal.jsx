/**
 * Chat Modal Component
 * 
 * Modal overlay that displays chat/messaging interface.
 * 
 * Features:
 * - Triggered by clicking the chat icon in the navbar
 * - Shows list of conversations
 * - Click on conversation to view messages
 * - Send new messages
 * - Real-time message updates
 * - Close on outside click or ESC key
 * 
 * Implementation: Component overlay (not route interceptor)
 * - Better for mobile experience (can slide from side/bottom)
 * - Easier to manage chat state and real-time updates
 * - More flexible for multi-panel chat UI
 */

'use client';

import { useEffect } from 'react';

export default function ChatModal({ isOpen, onClose }) {
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
      <div className="fixed top-16 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold">Messages</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Chat List/Conversation */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-gray-500 text-center py-8">
            Placeholder for chat conversations.
            <br />
            Messages will appear here.
          </p>
        </div>

        {/* Message Input (if in conversation) */}
        <div className="p-4 border-t border-gray-200">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FA6E80]"
          />
        </div>
      </div>
    </>
  );
}
