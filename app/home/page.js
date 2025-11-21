'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()

  const handleLogout = () => {
    // Handle logout logic
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">HP</span>
              </div>
              <h1 className="text-2xl font-bold">
                <span className="text-gray-800">HeyPro</span>
                <span className="text-blue-600">Data</span>
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Welcome to <span className="text-gray-800">HeyPro</span>
              <span className="text-blue-600">Data</span>! 🎬
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Your professional networking and talent marketplace for the film, media, and creative industries.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">Showcase your portfolio and connect with industry professionals.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Find Projects</h3>
              <p className="text-gray-600">Discover exciting opportunities and collaborate on creative projects.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Direct Communication</h3>
              <p className="text-gray-600">Chat directly with collaborators and build your network.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Handle contracts, payments, and reviews with confidence.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of creative professionals building their careers on HeyProData
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:shadow-lg transform hover:scale-105 transition">
              Complete Your Profile
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 HeyProData. All rights reserved.</p>
            <p className="text-sm mt-2">Connecting creative professionals worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
