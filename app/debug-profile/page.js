'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProfileDebugPage() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    debugProfile();
  }, []);

  const debugProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = {};

      // Test 1: Check session
      console.log('[DEBUG] Checking session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      info.session = {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: sessionError?.message,
        hasAccessToken: !!session?.access_token
      };
      console.log('[DEBUG] Session:', info.session);

      if (session) {
        // Test 2: Direct Supabase query
        console.log('[DEBUG] Testing direct Supabase query...');
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        info.profileDirectQuery = {
          success: !!profileData,
          data: profileData,
          error: profileError?.message,
          errorCode: profileError?.code,
          errorDetails: profileError?.details,
          errorHint: profileError?.hint
        };
        console.log('[DEBUG] Direct query:', info.profileDirectQuery);

        // Test 3: API endpoint query
        console.log('[DEBUG] Testing API endpoint...');
        try {
          const token = session.access_token;
          const apiUrl = '/api/profile';
          console.log('[DEBUG] Calling:', apiUrl);
          
          const apiResponse = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('[DEBUG] API Response status:', apiResponse.status);
          const apiData = await apiResponse.json();
          console.log('[DEBUG] API Response data:', apiData);

          info.apiQuery = {
            status: apiResponse.status,
            ok: apiResponse.ok,
            statusText: apiResponse.statusText,
            data: apiData
          };
        } catch (apiError) {
          console.error('[DEBUG] API Error:', apiError);
          info.apiQuery = {
            error: apiError.message,
            stack: apiError.stack
          };
        }

        // Test 4: Alternative query (check if profile exists at all)
        console.log('[DEBUG] Testing alternative query...');
        const { data: altProfileData, error: altError } = await supabase
          .from('user_profiles')
          .select('user_id, legal_first_name, legal_surname, first_name, surname, alias_first_name, alias_surname, country, city, created_at')
          .eq('user_id', session.user.id);

        info.alternativeQuery = {
          success: !!altProfileData,
          count: altProfileData?.length || 0,
          data: altProfileData,
          error: altError?.message
        };
        console.log('[DEBUG] Alternative query:', info.alternativeQuery);

        // Test 5: Skills query
        console.log('[DEBUG] Testing skills query...');
        try {
          const skillsResponse = await fetch('/api/skills', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const skillsData = await skillsResponse.json();
          info.skillsQuery = {
            status: skillsResponse.status,
            ok: skillsResponse.ok,
            data: skillsData
          };
        } catch (skillsError) {
          info.skillsQuery = {
            error: skillsError.message
          };
        }
        console.log('[DEBUG] Skills query:', info.skillsQuery);
      }

      // Test 6: Check environment
      info.environment = {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      };

      setDebugInfo(info);
      setLoading(false);
    } catch (error) {
      console.error('[DEBUG] General error:', error);
      setError(error.message);
      setDebugInfo({ generalError: error.message, stack: error.stack });
      setLoading(false);
    }
  };

  const getStatusBadge = (success) => {
    if (success === true) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">✅ SUCCESS</span>;
    } else if (success === false) {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">❌ FAILED</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">⚠️ UNKNOWN</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-lg text-gray-600">Running diagnostics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Profile Debug Dashboard</h1>
              <p className="text-gray-600">Diagnostic tool for troubleshooting profile page 404 errors</p>
            </div>
            <button
              onClick={debugProfile}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-red-600 font-bold text-lg">⚠️ Error</span>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🔐</span>
              Session Information
            </h2>
            {getStatusBadge(debugInfo?.session?.exists)}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo?.session, null, 2)}</pre>
          </div>
          {!debugInfo?.session?.exists && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">⚠️ No active session found. Please log in first.</p>
              <a href="/auth/login" className="mt-2 inline-block text-blue-600 hover:text-blue-800 underline">
                Go to Login Page →
              </a>
            </div>
          )}
        </div>

        {/* Direct Supabase Query */}
        {debugInfo?.session?.exists && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📊</span>
                  Direct Supabase Query (Client-side)
                </h2>
                {getStatusBadge(debugInfo?.profileDirectQuery?.success)}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo?.profileDirectQuery, null, 2)}</pre>
              </div>
              {debugInfo?.profileDirectQuery?.success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Profile data found in Supabase database</p>
                </div>
              )}
              {debugInfo?.profileDirectQuery?.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">❌ Error: {debugInfo.profileDirectQuery.error}</p>
                  {debugInfo.profileDirectQuery.errorHint && (
                    <p className="text-red-700 text-sm mt-2">Hint: {debugInfo.profileDirectQuery.errorHint}</p>
                  )}
                </div>
              )}
            </div>

            {/* API Endpoint Query */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">🌐</span>
                  API Endpoint Query
                </h2>
                {getStatusBadge(debugInfo?.apiQuery?.ok)}
              </div>
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-600">Endpoint:</span>
                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">/api/profile</code>
                <span className="ml-4 text-sm font-medium text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm font-mono ${
                  debugInfo?.apiQuery?.status === 200 ? 'bg-green-100 text-green-800' :
                  debugInfo?.apiQuery?.status === 404 ? 'bg-red-100 text-red-800' :
                  debugInfo?.apiQuery?.status === 401 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {debugInfo?.apiQuery?.status || 'N/A'}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo?.apiQuery, null, 2)}</pre>
              </div>
              {debugInfo?.apiQuery?.status === 404 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-bold">❌ 404 ERROR DETECTED</p>
                  <p className="text-red-700 mt-2">The API endpoint is returning 404. This indicates:</p>
                  <ul className="list-disc list-inside mt-2 text-red-700 text-sm space-y-1">
                    <li>The route handler might not be matching the /api/profile endpoint correctly</li>
                    <li>Check /app/app/api/[[...path]]/route.js for routing issues</li>
                    <li>Verify the catch-all route pattern is working</li>
                  </ul>
                </div>
              )}
              {debugInfo?.apiQuery?.status === 200 && debugInfo?.apiQuery?.ok && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✅ API endpoint is working correctly!</p>
                </div>
              )}
            </div>

            {/* Alternative Query */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">🔄</span>
                  Alternative Profile Query
                </h2>
                {getStatusBadge(debugInfo?.alternativeQuery?.success)}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo?.alternativeQuery, null, 2)}</pre>
              </div>
            </div>

            {/* Skills Query */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">🎯</span>
                  Skills API Query
                </h2>
                {getStatusBadge(debugInfo?.skillsQuery?.ok)}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo?.skillsQuery, null, 2)}</pre>
              </div>
            </div>
          </>
        )}

        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">⚙️</span>
              Environment Configuration
            </h2>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo?.environment, null, 2)}</pre>
          </div>
        </div>

        {/* Diagnostics Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Diagnostics Summary
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Session Active</span>
              {debugInfo?.session?.exists ? 
                <span className="text-green-600 font-medium">✅ Yes</span> : 
                <span className="text-red-600 font-medium">❌ No</span>
              }
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Profile in Database</span>
              {debugInfo?.profileDirectQuery?.success ? 
                <span className="text-green-600 font-medium">✅ Found</span> : 
                <span className="text-red-600 font-medium">❌ Not Found</span>
              }
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">API Endpoint Working</span>
              {debugInfo?.apiQuery?.status === 200 ? 
                <span className="text-green-600 font-medium">✅ Yes</span> : 
                debugInfo?.apiQuery?.status === 404 ?
                <span className="text-red-600 font-medium">❌ 404 Error</span> :
                <span className="text-yellow-600 font-medium">⚠️ {debugInfo?.apiQuery?.status}</span>
              }
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Recommendations</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              {!debugInfo?.session?.exists && (
                <li>User is not logged in. Please authenticate first.</li>
              )}
              {!debugInfo?.profileDirectQuery?.success && debugInfo?.session?.exists && (
                <li>Profile not found in database. User needs to complete profile setup at /auth/form</li>
              )}
              {debugInfo?.apiQuery?.status === 404 && (
                <li>API routing issue detected. Check /app/app/api/[[...path]]/route.js</li>
              )}
              {debugInfo?.apiQuery?.ok && debugInfo?.profileDirectQuery?.success && (
                <li>✅ All systems operational! Profile page should work correctly.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Action Links */}
        <div className="mt-6 flex space-x-4">
          <a href="/profile" className="px-6 py-3 bg-[#FA6E80] text-white rounded-lg hover:bg-[#e95d6f] transition-colors">
            Go to Profile Page
          </a>
          <a href="/auth/form" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Complete Profile
          </a>
          <a href="/auth/login" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
