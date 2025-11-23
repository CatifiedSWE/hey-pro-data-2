'use client';

// Dummy data for availability check
const dummyAvailability = [
  {
    id: 1,
    title: '4 Camera Operator for Shortfilm',
    crew: [
      {
        id: 1,
        name: 'Olivia Martin',
        avatar: 'https://i.pravatar.cc/150?img=10',
        availability: Array(7).fill('N/A'),
      },
      {
        id: 2,
        name: 'Olivia Martin',
        avatar: 'https://i.pravatar.cc/150?img=11',
        availability: Array(7).fill('N/A'),
      },
      {
        id: 3,
        name: 'Olivia Martin',
        avatar: 'https://i.pravatar.cc/150?img=12',
        availability: Array(7).fill('N/A'),
      },
      {
        id: 4,
        name: 'Olivia Martin',
        avatar: 'https://i.pravatar.cc/150?img=13',
        availability: Array(7).fill('N/A'),
      },
    ],
  },
  {
    id: 2,
    title: '4 Lighting Operator for Shortfilm',
    crew: [
      {
        id: 5,
        name: 'Olivia Martin',
        avatar: 'https://i.pravatar.cc/150?img=14',
        availability: Array(7).fill('N/A'),
      },
      {
        id: 6,
        name: 'Olivia Martin',
        avatar: 'https://i.pravatar.cc/150?img=15',
        availability: Array(7).fill('N/A'),
      },
      {
        id: 7,
        name: 'Olivia Martin',
        avatar: 'https://i.pravatar.cc/150?img=16',
        availability: Array(7).fill('N/A'),
      },
      {
        id: 8,
        name: 'Olivia Martin',
        avatar: 'https://i.pravatar.cc/150?img=17',
        availability: Array(7).fill('N/A'),
      },
    ],
  },
];

export default function AvailabilityCheckTab() {
  return (
    <div className="space-y-8">
      {dummyAvailability.map((section) => (
        <div key={section.id} className="space-y-4">
          {/* Section Title */}
          <h2 className="text-xl font-semibold text-black">
            {section.title}
          </h2>

          {/* Availability Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Name
                  </th>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[60px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {section.crew.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                    {/* Name */}
                    <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-3">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {person.name}
                        </span>
                      </div>
                    </td>

                    {/* Availability Days */}
                    {person.availability.map((status, index) => (
                      <td
                        key={index}
                        className="px-4 py-4 text-center text-sm text-gray-400"
                      >
                        {status}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
