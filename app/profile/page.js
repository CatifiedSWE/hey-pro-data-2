'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({
    bio: false,
    name: false
  });
  const [editedData, setEditedData] = useState({
    bio: '',
    legal_first_name: '',
    legal_surname: '',
    alias_first_name: '',
    alias_surname: ''
  });
  const [uploading, setUploading] = useState({
    banner: false,
    photo: false
  });
  const [savingBio, setSavingBio] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const bannerInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // Fetch profile and skills on mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        setLoading(false);
        router.push('/auth/login');
        return;
      }

      const token = session.access_token;

      // Fetch profile
      console.log('Fetching profile from /api/profile with token:', token?.substring(0, 20) + '...');
      const profileRes = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile response status:', profileRes.status);
      console.log('Profile response headers:', Object.fromEntries(profileRes.headers.entries()));
      console.log('Request URL:', profileRes.url);
      
      if (!profileRes.ok) {
        const errorText = await profileRes.text();
        console.error('Profile fetch failed with status:', profileRes.status);
        console.error('Error response:', errorText);
        console.error('User ID:', session.user.id);
        console.error('Auth token (first 50 chars):', token?.substring(0, 50) + '...');
        
        // If profile not found (404), it means user has basic profile info but hasn't filled additional details
        // Don't redirect - instead initialize empty profile so they can add bio, banner, photo
        if (profileRes.status === 404) {
          console.log('Profile not found (404), initializing empty profile for user to complete...');
          
          // Initialize with empty profile - user can fill in bio, banner, photo
          setProfile({
            user_id: session.user.id,
            first_name: '',
            surname: '',
            legal_first_name: '',
            legal_surname: '',
            alias_first_name: '',
            alias_surname: '',
            bio: '',
            profile_photo_url: '',
            banner_url: '',
            country: '',
            city: ''
          });
          
          setEditedData({
            bio: '',
            legal_first_name: '',
            legal_surname: '',
            alias_first_name: '',
            alias_surname: ''
          });
          
          // Set a friendly message instead of error
          setError('Complete your profile by adding your bio, profile photo, and banner image below.');
          setLoading(false);
          return;
        }
        
        // For other errors (401, 500, etc), show error
        setError(`Failed to load profile (Status: ${profileRes.status}). Error: ${errorText}`);
        setLoading(false);
        return;
      }

      const profileData = await profileRes.json();
      console.log('Profile data received:', profileData);

      if (profileData.success && profileData.data) {
        // Handle both old field names (first_name, surname) and new field names (legal_first_name, legal_surname)
        const profile = profileData.data;
        const legalFirstName = profile.legal_first_name || profile.first_name || '';
        const legalSurname = profile.legal_surname || profile.surname || '';
        
        console.log('Profile loaded successfully for user:', session.user.id);
        console.log('Profile fields - first_name:', profile.first_name, 'surname:', profile.surname);
        
        setProfile({
          ...profile,
          legal_first_name: legalFirstName,
          legal_surname: legalSurname
        });
        
        setEditedData({
          bio: profile.bio || '',
          legal_first_name: legalFirstName,
          legal_surname: legalSurname,
          alias_first_name: profile.alias_first_name || '',
          alias_surname: profile.alias_surname || ''
        });
      } else {
        console.error('Profile data not successful:', profileData);
        setError(profileData.error || 'Failed to load profile');
        setLoading(false);
        return;
      }

      // Fetch skills
      try {
        const skillsRes = await fetch('/api/skills', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json();
          if (skillsData.success) {
            setSkills(skillsData.data || []);
          }
        }
      } catch (skillsError) {
        // Skills fetch is non-critical, just log error
        console.error('Error fetching skills:', skillsError);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(`Error loading profile: ${error.message}`);
      setLoading(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WEBP image');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setUploading({ ...uploading, banner: true });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/profile-banner', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setProfile({ ...profile, banner_url: data.data.url });
      } else {
        alert('Failed to upload banner: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Error uploading banner');
    } finally {
      setUploading({ ...uploading, banner: false });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WEBP image');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setUploading({ ...uploading, photo: true });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setProfile({ ...profile, profile_photo_url: data.data.url });
      } else {
        alert('Failed to upload photo: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo');
    } finally {
      setUploading({ ...uploading, photo: false });
    }
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bio: editedData.bio })
      });

      const data = await res.json();

      if (data.success) {
        setProfile({ ...profile, bio: editedData.bio });
        setEditMode({ ...editMode, bio: false });
      } else {
        alert('Failed to update bio: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating bio:', error);
      alert('Error updating bio');
    } finally {
      setSavingBio(false);
    }
  };

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          legal_first_name: editedData.legal_first_name,
          legal_surname: editedData.legal_surname,
          alias_first_name: editedData.alias_first_name,
          alias_surname: editedData.alias_surname
        })
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.data);
        setEditMode({ ...editMode, name: false });
      } else {
        alert('Failed to update name: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Error updating name');
    } finally {
      setSavingName(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
       
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80]"></div>
            <div className="text-gray-600">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
  
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-gray-600 mb-4">{error || 'Profile not found'}</div>
            <button 
              onClick={fetchProfileData}
              className="px-6 py-2 bg-[#FA6E80] text-white rounded-lg hover:bg-[#e95d6f] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.alias_first_name 
    ? `${profile.alias_first_name} ${profile.alias_surname || ''}`.trim()
    : `${profile.legal_first_name || ''} ${profile.legal_surname || ''}`.trim() || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
 
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left & Center */}
          <section className="lg:col-span-2 space-y-6">
            {/* Banner & Profile Photo */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Banner Image */}
              <div 
                className="w-full h-64 relative group cursor-pointer"
                onClick={() => bannerInputRef.current?.click()}
              >
                {profile.banner_url ? (
                  <img 
                    src={profile.banner_url}
                    alt="Profile Banner" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium">Upload Banner</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white flex items-center space-x-2">
                    {uploading.banner ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{profile.banner_url ? 'Change' : 'Upload'} Banner</span>
                      </>
                    )}
                  </div>
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
              </div>

              {/* Profile Info */}
              <div className="px-8 pb-6">
                <div className="flex items-end -mt-16 mb-6">
                  {/* Profile Photo */}
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gray-100 flex items-center justify-center">
                      {profile.profile_photo_url ? (
                        <img 
                          src={profile.profile_photo_url}
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-full flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                        {uploading.photo ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-1"></div>
                            <span className="text-xs">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs mt-1">{profile.profile_photo_url ? 'Change' : 'Upload'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>

                  {/* Name & Title */}
                  <div className="ml-6 flex-1">
                    {editMode.name ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Legal First Name"
                            value={editedData.legal_first_name}
                            onChange={(e) => setEditedData({ ...editedData, legal_first_name: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA6E80] focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Legal Surname"
                            value={editedData.legal_surname}
                            onChange={(e) => setEditedData({ ...editedData, legal_surname: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA6E80] focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Alias First Name (Optional)"
                            value={editedData.alias_first_name}
                            onChange={(e) => setEditedData({ ...editedData, alias_first_name: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA6E80] focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Alias Surname (Optional)"
                            value={editedData.alias_surname}
                            onChange={(e) => setEditedData({ ...editedData, alias_surname: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA6E80] focus:outline-none"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveName}
                            disabled={savingName}
                            className="px-4 py-2 bg-[#FA6E80] text-white rounded-lg hover:bg-[#e95d6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {savingName && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                            <span>{savingName ? 'Saving...' : 'Save'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditedData({
                                ...editedData,
                                legal_first_name: profile.legal_first_name || '',
                                legal_surname: profile.legal_surname || '',
                                alias_first_name: profile.alias_first_name || '',
                                alias_surname: profile.alias_surname || ''
                              });
                              setEditMode({ ...editMode, name: false });
                            }}
                            disabled={savingName}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group">
                        <div className="flex items-center space-x-3">
                          <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                          <button
                            onClick={() => setEditMode({ ...editMode, name: true })}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                          >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-600 mt-1">
                          Freelancer • Founder • {profile.city || 'Dubai'}, {profile.country || 'UAE'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio Section */}
                <div className="mt-6 group">
                  {editMode.bio ? (
                    <div className="space-y-3">
                      <textarea
                        value={editedData.bio}
                        onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA6E80] focus:outline-none resize-none"
                        placeholder="Tell us about yourself..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveBio}
                          disabled={savingBio}
                          className="px-4 py-2 bg-[#FA6E80] text-white rounded-lg hover:bg-[#e95d6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {savingBio && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                          <span>{savingBio ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditedData({ ...editedData, bio: profile.bio || '' });
                            setEditMode({ ...editMode, bio: false });
                          }}
                          disabled={savingBio}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {profile.bio ? (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {profile.bio}
                        </p>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-400 italic">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <p className="text-sm">Add a bio to tell others about yourself</p>
                        </div>
                      )}
                      <button
                        onClick={() => setEditMode({ ...editMode, bio: true })}
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-4">
                  <button className="bg-[#FA6E80] text-white px-8 py-2.5 rounded-full font-medium hover:bg-[#e95d6f] transition-colors">
                    Profile
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded-full font-medium hover:bg-gray-300 transition-colors">
                    Slate
                  </button>
                </div>
              </div>
            </div>

            {/* Credits Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Credits</h2>
                <button className="text-[#FA6E80] hover:text-[#e95d6f] text-sm font-medium">
                  + Add Credit
                </button>
              </div>
              <div className="space-y-4">
                {/* Hard-coded credit */}
                <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <img 
                      src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=100&h=100&fit=crop" 
                      alt="Project"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">Porsche • Speed of Light (2025)</h3>
                      <p className="text-gray-600 text-sm mt-2">
                        <span className="font-medium">13 Awards</span> • <span className="font-medium">23 Nominations</span> • <span>4 Official Selections</span>
                      </p>
                      <div className="mt-3 flex items-center space-x-2 text-sm text-gray-700">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">Production Manager</span>
                        <span>•</span>
                        <span>Central Films</span>
                        <span>•</span>
                        <span>Germany</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
                <button className="text-[#FA6E80] hover:text-[#e95d6f] text-sm font-medium">
                  + Add Skill
                </button>
              </div>
              <div className="space-y-4">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <div key={skill.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{skill.skill_name}</h3>
                          <p className="text-gray-600 text-sm mt-2">
                            Professional skill in creative production
                          </p>
                        </div>
                        <button className="text-gray-400 hover:text-red-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No skills added yet</p>
                    <p className="text-gray-400 text-sm mt-1">Add your professional skills to showcase your expertise</p>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              {profile.bio ? (
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-400 italic text-sm">No bio added yet. Add your bio above to showcase your story.</p>
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            {/* Highlight Card 1 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Edit Heylights</h3>
              <div className="relative rounded-xl overflow-hidden group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=300&fit=crop" 
                  alt="Highlight"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                    Change Video
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">Me on Cinematography</p>
            </div>

            {/* Highlight Card 2 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="relative rounded-xl overflow-hidden group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop" 
                  alt="Highlight"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                    Change Video
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">Me on Cinematography</p>
            </div>

            {/* Highlight Card 3 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="relative rounded-xl overflow-hidden group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop" 
                  alt="Highlight"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                    Change Video
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">Behind the Scenes</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
