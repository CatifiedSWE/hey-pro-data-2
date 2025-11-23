'use client';

export default function ApplicantTable({ applicants }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              City
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Skill Set
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Credits
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Referrals
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Chat
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Release
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Shortlist
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Confirm
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {applicants.map((applicant) => (
            <tr key={applicant.id} className="hover:bg-gray-50 transition-colors">
              {/* Name */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <img
                    src={applicant.avatar}
                    alt={applicant.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {applicant.name}
                  </span>
                </div>
              </td>

              {/* City */}
              <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm text-[#31A7AC] font-medium">
                  {applicant.city}
                </span>
              </td>

              {/* Skills */}
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1 text-sm text-gray-700">
                  {applicant.skills.map((skill, index) => (
                    <span key={index}>
                      {skill}
                      {index < applicant.skills.length - 1 && ' |'}
                    </span>
                  ))}
                </div>
              </td>

              {/* Credits */}
              <td className="px-4 py-4 whitespace-nowrap">
                <button className="text-sm text-[#31A7AC] hover:underline font-medium">
                  {applicant.credits}
                </button>
              </td>

              {/* Referrals */}
              <td className="px-4 py-4">
                <div className="flex -space-x-2">
                  {applicant.referrals.map((referral, index) => (
                    <img
                      key={index}
                      src={referral.avatar}
                      alt="Referral"
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
              </td>

              {/* Chat */}
              <td className="px-4 py-4 text-center">
                <button className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </button>
              </td>

              {/* Release */}
              <td className="px-4 py-4 text-center">
                {applicant.actions.release === 'x' && (
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FA6E80] hover:bg-[#e95d6f] text-white transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                {applicant.actions.release === 'envelope' && (
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FA6E80] hover:bg-[#e95d6f] text-white transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                )}
              </td>

              {/* Shortlist */}
              <td className="px-4 py-4 text-center">
                {applicant.actions.shortlist === 'plus' && (
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#31A7AC] hover:bg-[#2a8f93] text-white transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                )}
                {applicant.actions.shortlist === 'envelope' && (
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#31A7AC] hover:bg-[#2a8f93] text-white transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                )}
              </td>

              {/* Confirm */}
              <td className="px-4 py-4 text-center">
                {applicant.actions.confirm === 'check' && (
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#31A7AC] hover:bg-[#2a8f93] text-white transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                )}
                {applicant.actions.confirm === 'envelope' && (
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#31A7AC] hover:bg-[#2a8f93] text-white transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
