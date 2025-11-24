'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestProfilePage() {
  const [status, setStatus] = useState('Checking...');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setStatus('Checking authentication...');
    
    // Check auth
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      setStatus('❌ Not authenticated. Please login first.');
      return;
    }
    
    setUser(session.user);
    setStatus('✅ Authenticated as: ' + session.user.email);
    
    // Check if profile exists
    setStatus('Checking profile...');
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (error) {
      setStatus('❌ Error checking profile: ' + error.message);
      console.error('Profile check error:', error);
      return;
    }
    
    if (data) {
      setProfile(data);
      setStatus('✅ Profile exists! Data: ' + JSON.stringify(data, null, 2));
    } else {
      setStatus('⚠️ No profile found. You can create one below.');
    }
  };

  const createTestProfile = async () => {
    if (!user) {
      alert('Not authenticated!');
      return;
    }

    setCreating(true);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: user.id,
          first_name: 'Test',
          surname: 'User',
          country: 'United Arab Emirates',
          city: 'Dubai'
        }
      ])
      .select();
    
    if (error) {
      alert('Error creating profile: ' + error.message);
      console.error('Insert error:', error);
      setStatus('❌ Failed to create profile: ' + error.message);
    } else {
      alert('Profile created successfully!');
      setProfile(data[0]);
      setStatus('✅ Profile created! Data: ' + JSON.stringify(data[0], null, 2));
    }
    
    setCreating(false);
  };

  const testAPIEndpoint = async () => {
    if (!user) {
      alert('Not authenticated!');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session.access_token;

    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    alert('API Response: ' + JSON.stringify(result, null, 2));
    console.log('API response:', result);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Profile Diagnostic Tool</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Status:</h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{status}</pre>
        </div>

        {user && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">User Info:</h2>
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        {profile && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Profile Data:</h2>
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={checkStatus}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            🔄 Refresh Status
          </button>

          {user && !profile && (
            <button
              onClick={createTestProfile}
              disabled={creating}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 ml-4"
            >
              {creating ? 'Creating...' : '✅ Create Test Profile'}
            </button>
          )}

          {user && (
            <button
              onClick={testAPIEndpoint}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 ml-4"
            >
              🧪 Test API Endpoint
            </button>
          )}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Make sure you're logged in first</li>
            <li>Click "Refresh Status" to check your auth and profile</li>
            <li>If no profile exists, click "Create Test Profile"</li>
            <li>Click "Test API Endpoint" to verify /api/profile works</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
