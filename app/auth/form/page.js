'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function FormPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    aliasFirstName: '',
    aliasSurname: '',
    country: '',
    city: ''
  })

  // List of countries with priority to UAE and Middle East
  const countries = [
    'United Arab Emirates',
    'Saudi Arabia',
    'Qatar',
    'Kuwait',
    'Bahrain',
    'Oman',
    'Jordan',
    'Lebanon',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'India'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Check if form is valid (all required fields filled)
  const isFormValid = formData.firstName.trim() !== '' && 
                      formData.surname.trim() !== '' && 
                      formData.country !== '' && 
                      formData.city.trim() !== ''

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isFormValid) {
      console.log('Form submitted:', formData)
      // Handle form submission
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg)'
        }}
      />

      {/* Form Container */}
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 md:p-12">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Legal Name Section */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-3">Legal name</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#FA6E80] text-black placeholder-gray-400 transition-colors"
              />
              <input
                type="text"
                placeholder="Surname"
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#FA6E80] text-black placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Alias Name Section */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-3">
              Alias name <span className="text-gray-500 font-normal text-sm">(optional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Alias first name"
                value={formData.aliasFirstName}
                onChange={(e) => handleInputChange('aliasFirstName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#FA6E80] text-black placeholder-gray-400 transition-colors"
              />
              <input
                type="text"
                placeholder="Alias surname"
                value={formData.aliasSurname}
                onChange={(e) => handleInputChange('aliasSurname', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#FA6E80] text-black placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-3">Location</h3>
            <div className="space-y-4">
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#FA6E80] text-black bg-white transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center'
                }}
              >
                <option value="" disabled>Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#FA6E80] text-black placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all transform hover:scale-[1.02] ${
              isFormValid 
                ? 'bg-[#FA6E80] hover:bg-[#ff5a75] cursor-pointer shadow-lg' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Create your profile
          </button>
        </form>
      </div>
    </div>
  )
}
