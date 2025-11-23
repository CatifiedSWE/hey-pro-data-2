'use client';

// Dummy data for contact list
const dummyContacts = {
  '1': [
    {
      id: 1,
      gigTitle: '4 Video Editors for Shortfilm',
      departments: [
        {
          id: 1,
          name: 'Camera',
          subTitle: '4 Camera Operator for Shortfilm',
          contacts: [
            {
              id: 1,
              role: 'Camera Operator',
              company: 'Central Films',
              name: 'Aarav Mehta',
              avatar: 'https://i.pravatar.cc/150?img=20',
              phone: '+91 9876543210',
              email: 'aaravmehta12@gmail.com',
            },
            {
              id: 2,
              role: 'Camera Operator',
              company: 'Central Films',
              name: 'Aarav Mehta',
              avatar: 'https://i.pravatar.cc/150?img=21',
              phone: '+91 9876543210',
              email: 'aaravmehta12@gmail.com',
            },
          ],
        },
      ],
    },
  ],
  '2': [
    {
      id: 2,
      gigTitle: '3 Lighting operator for Documentary',
      departments: [
        {
          id: 2,
          name: 'Lighting',
          subTitle: '4 Lighting Operator for Shortfilm',
          contacts: [
            {
              id: 3,
              role: 'Lighting Operator',
              company: 'Central Films',
              name: 'Aarav Mehta',
              avatar: 'https://i.pravatar.cc/150?img=22',
              phone: '+91 9876543210',
              email: 'aaravmehta12@gmail.com',
            },
            {
              id: 4,
              role: 'Lighting Operator',
              company: 'Central Films',
              name: 'Aarav Mehta',
              avatar: 'https://i.pravatar.cc/150?img=23',
              phone: '+91 9876543210',
              email: 'aaravmehta12@gmail.com',
            },
          ],
        },
      ],
    },
  ],
};

export default function ContactListTab({ selectedGig }) {
  // Get contact list for selected gig
  const contactData = dummyContacts[selectedGig] || dummyContacts['1'];

  return (
    <div className="space-y-6">
      {contactData.map((gig) => (
        <div key={gig.id} className="space-y-4">
          {/* Departments */}
          <div className="space-y-6">
            {gig.departments.map((department) => (
              <div
                key={department.id}
                className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <table className="w-full">
                  {/* Department Header */}
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th
                        colSpan={5}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900"
                      >
                        Department
                      </th>
                    </tr>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th
                        colSpan={5}
                        className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                      >
                        {department.name} — {department.subTitle}
                      </th>
                    </tr>

                    {/* Column Headers */}
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email ID
                      </th>
                    </tr>
                  </thead>

                  {/* Contact Rows */}
                  <tbody className="divide-y divide-gray-200">
                    {department.contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contact.role}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contact.company}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={contact.avatar}
                              alt={contact.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {contact.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contact.phone}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contact.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
