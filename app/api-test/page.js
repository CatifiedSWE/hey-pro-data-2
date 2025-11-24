'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function APITestPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      const sessionInfo = {
        hasSession: !!session,
        sessionError: sessionError?.message || null,
        userId: session?.user?.id || null,
        tokenPreview: session?.access_token?.substring(0, 30) + '...' || null
      };

      // Test API call
      let apiResult = null;
      if (session) {
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        apiResult = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          data: data
        };
      }

      setResult({
        session: sessionInfo,
        api: apiResult
      });
    } catch (error) {
      setResult({
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 mb-6"
        >
          {loading ? 'Testing...' : 'Test /api/profile Endpoint'}
        </button>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Make sure you are logged in</li>
            <li>Click the "Test /api/profile Endpoint" button</li>
            <li>Check the results to see if the API is working</li>
            <li>Expected result: Status 200 with profile data if logged in, 401 if not</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
