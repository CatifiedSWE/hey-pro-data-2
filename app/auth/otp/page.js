'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export default function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', ''])
  const inputRefs = useRef([]) 

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5)
  }, [])

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value !== '' && !/^[0-9]$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus to next input if value is entered
    if (value !== '' && index < 4) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // If current box is empty, move to previous box
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current box
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }
    // Handle left arrow
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Handle right arrow
    else if (e.key === 'ArrowRight' && index < 4) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 5)
    
    // Only allow numbers
    if (!/^[0-9]+$/.test(pastedData)) {
      return
    }

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length && i < 5; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)

    // Focus on the next empty box or last box
    const nextIndex = Math.min(pastedData.length, 4)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length === 5) {
      console.log('OTP submitted:', otpValue)
      // Handle OTP submission
    }
  }

  const isOtpComplete = otp.every(digit => digit !== '')

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)'
        }}
      />

      {/* OTP Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo/logo.svg" 
            alt="HPD Logo" 
            width={80} 
            height={55}
            priority
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-black text-center mb-4">
          Enter Your OTP
        </h2>

        {/* Description */}
        <p className="text-center text-black mb-8">
          Your One-Time Password (OTP) has been sent to<br />
          <strong>example@gmail.com</strong>
        </p>

        <form onSubmit={handleSubmit}>
          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#FA6E80] text-black transition-all"
              />
            ))}
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <p className="text-sm text-gray-700 flex items-start">
              <span className="mr-2">⚠️</span>
              <span>Your OTP is confidential and should not be shared</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isOtpComplete}
            className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all transform hover:scale-[1.02] ${
              isOtpComplete 
                ? 'bg-[#FA6E80] hover:bg-[#ff5a75] cursor-pointer shadow-lg' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}
