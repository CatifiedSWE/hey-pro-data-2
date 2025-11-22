'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  })

  const validatePassword = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setFormData({ ...formData, password: newPassword })
    validatePassword(newPassword)
  }

  const isPasswordValid = () => {
    return (
      passwordValidation.minLength &&
      passwordValidation.hasUppercase &&
      passwordValidation.hasNumber &&
      passwordValidation.hasSpecialChar
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isPasswordValid()) {
      alert('Please ensure your password meets all requirements')
      return
    }
    router.push('/home')
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT SIGN UP PART */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
 <img src="/logo/logo.svg" alt="Logo" width="60" className="mb-8" />
          </div>

          <h2 className="text-3xl font-medium mb-8">
            Sign up to <span className="text-gray-900">HeyPro</span><span className="text-[#00bcd4]">Data</span>
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

            <div className="mb-3">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                required
              />
            </div>

            {!isPasswordValid() && formData.password.length > 0 && (
              <div className="mb-6 text-sm text-gray-600">
                Password must contain a minimum of 8 characters, 1 upper case, 1 number and 1 special character.
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#ff6b9d] hover:bg-[#ff5a8f] text-white py-3 rounded-lg font-medium mb-6 transition"
            >
              Sign up
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
              <img src="/assets/google-icon.png" width="22" alt="Google" />
               Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <img src="/assets/apple-icon.png" width="20" alt="Apple" />
               Apple
            </button>
          </div>

          <div className="text-center text-sm">
            Already have an account? <Link href="/auth/login" className="text-[#0066ff] hover:underline">Login</Link>
          </div>
        </div>
      </div>

      {/* RIGHT GRADIENT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
        <div className="w-full h-full rounded-3xl" style={{background: 'conic-gradient(from 180deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)'}}></div>
      </div>
    </div>
  )
}
