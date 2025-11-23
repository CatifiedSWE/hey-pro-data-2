'use client';

import ApplicantTable from './ApplicantTable';

// Dummy data for gigs and applicants
const dummyGigs = [
  {
    id: '1',
    title: '4 Video Editors for Shortfilm',
    applicants: [
      {
        id: 1,
        name: 'Aarav Mehta',
        avatar: 'https://i.pravatar.cc/150?img=1',
        city: 'Dubai',
        skills: ['Guitarist', 'Sound Enginee'],
        credits: 'View credits',
        referrals: [
          { avatar: 'https://i.pravatar.cc/150?img=11' },
          { avatar: 'https://i.pravatar.cc/150?img=12' },
        ],
        actions: {
          release: 'x',
          shortlist: 'envelope',
          confirm: 'envelope',
        },
      },
      {
        id: 2,
        name: 'Aarav Mehta',
        avatar: 'https://i.pravatar.cc/150?img=2',
        city: 'Dubai',
        skills: ['Guitarist', 'Sound Enginee'],
        credits: 'View credits',
        referrals: [
          { avatar: 'https://i.pravatar.cc/150?img=13' },
          { avatar: 'https://i.pravatar.cc/150?img=14' },
        ],
        actions: {
          release: 'x',
          shortlist: 'plus',
          confirm: 'check',
        },
      },
      {
        id: 3,
        name: 'Aarav Mehta',
        avatar: 'https://i.pravatar.cc/150?img=3',
        city: 'Dubai',
        skills: ['Guitarist', 'Sound Enginee'],
        credits: 'View credits',
        referrals: [
          { avatar: 'https://i.pravatar.cc/150?img=15' },
          { avatar: 'https://i.pravatar.cc/150?img=16' },
        ],
        actions: {
          release: 'envelope',
          shortlist: 'plus',
          confirm: 'check',
        },
      },
    ],
  },
  {
    id: '2',
    title: '3 Lighting operator for Documentary',
    applicants: [
      {
        id: 4,
        name: 'Aarav Mehta',
        avatar: 'https://i.pravatar.cc/150?img=4',
        city: 'Dubai',
        skills: ['Guitarist', 'Sound Engineer', '+ 4 Roles'],
        credits: 'View credits',
        referrals: [
          { avatar: 'https://i.pravatar.cc/150?img=17' },
          { avatar: 'https://i.pravatar.cc/150?img=18' },
        ],
        actions: {
          release: 'x',
          shortlist: 'plus',
          confirm: '',
        },
      },
      {
        id: 5,
        name: 'Aarav Mehta',
        avatar: 'https://i.pravatar.cc/150?img=5',
        city: 'Dubai',
        skills: ['Guitarist', 'Sound Engineer', '+ 4 Roles'],
        credits: 'View credits',
        referrals: [
          { avatar: 'https://i.pravatar.cc/150?img=19' },
          { avatar: 'https://i.pravatar.cc/150?img=20' },
        ],
        actions: {
          release: 'x',
          shortlist: 'plus',
          confirm: '',
        },
      },
      {
        id: 6,
        name: 'Aarav Mehta',
        avatar: 'https://i.pravatar.cc/150?img=6',
        city: 'Dubai',
        skills: ['Guitarist', 'Sound Engineer', '+ 4 Roles'],
        credits: 'View credits',
        referrals: [
          { avatar: 'https://i.pravatar.cc/150?img=21' },
          { avatar: 'https://i.pravatar.cc/150?img=22' },
        ],
        actions: {
          release: 'x',
          shortlist: 'plus',
          confirm: '',
        },
      },
    ],
  },
];

export default function ApplicationsTab({ selectedGig }) {
  // Filter data based on selected gig
  const filteredGigs = selectedGig
    ? dummyGigs.filter((gig) => gig.id === selectedGig)
    : dummyGigs;

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-start">
        <button className="text-[#FA6E80] font-medium text-sm sm:text-base hover:underline">
          See referrals
        </button>
        <button className="bg-[#FA6E80] hover:bg-[#e95d6f] text-white px-6 py-2.5 rounded-full font-medium text-sm sm:text-base transition-colors">
          Invite crew for this Gig
        </button>
      </div>

      {/* Gigs with Applicants */}
      {filteredGigs.map((gig) => (
        <div key={gig.id} className="space-y-4">
          {/* Applicants Table */}
          <ApplicantTable applicants={gig.applicants} />
        </div>
      ))}
    </div>
  );
}
