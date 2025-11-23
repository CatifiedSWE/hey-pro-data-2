'use client';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chat Page
          </h1>
          <p className="text-gray-600 text-lg">
            This is the chat page. Chat functionality will be implemented here.
          </p>
          
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Coming Soon</h2>
            <p className="text-gray-600">
              Direct messaging and chat features will be available here soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
