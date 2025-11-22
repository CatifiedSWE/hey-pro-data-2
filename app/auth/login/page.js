'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    router.push('/home')
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT GRADIENT PART */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
        <div className="w-full h-full rounded-3xl" style={{background: 'conic-gradient(from 180deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)'}}></div>
      </div>

      {/* RIGHT LOGIN PART */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <img src="/logo/logo.svg" alt="Logo" width="60" className="mb-8" />
          </div>

          <h2 className="text-3xl font-medium mb-8">
            Login to <span className="text-gray-900">HeyPro</span><span className="text-[#00bcd4]">Data</span>
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                required
              />
            </div>

            <div className="flex items-center justify-between mb-6 text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.keepLoggedIn}
                  onChange={(e) => setFormData({ ...formData, keepLoggedIn: e.target.checked })}
                  className="mr-2"
                />
                Keep me logged in
              </label>
              <Link href="#" className="text-[#00bcd4] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#ff6b9d] hover:bg-[#ff5a8f] text-white py-3 rounded-lg font-medium mb-6 transition"
            >
              Login
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
               <img src="/assets/google-icon.png" width="20" alt="Apple" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
             <img src="/assets/apple-icon.png" width="20" alt="Apple" />
              Apple
            </button>
          </div>

          <div className="text-center text-sm">
            Don't have an account? <Link href="/auth/sign-up" className="text-[#0066ff] hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
