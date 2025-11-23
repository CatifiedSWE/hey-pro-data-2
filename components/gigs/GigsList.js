'use client';

import GigCard from './GigCard';

// Dummy data for gigs
const dummyGigs = [
  {
    id: 1,
    title: '4 Video Editors for Shortfilm',
    description: 'Description of the GIG will be here abcdefghij',
    qualifyingCriteria: 'This is were the qualifying criteria value comes....',
    amount: 20000,
    currency: 'AED',
    dates: [
      { month: 'Sep 2025', days: '12, 15, 16-25' },
      { month: 'Oct 2025', days: '1-30' },
    ],
    locations: ['Dubai Design District', 'location1', 'location3'],
  },
  {
    id: 2,
    title: '4 Video Editors for Shortfilm',
    description: 'Description of the GIG will be here abcdefghij',
    qualifyingCriteria: 'This is were the qualifying criteria value comes....',
    amount: 20000,
    currency: 'AED',
    dates: [
      { month: 'Sep 2025', days: '12, 15, 16-25' },
      { month: 'Oct 2025', days: '1-30' },
    ],
    locations: ['Dubai Design District', 'location1', 'location3'],
  },
  {
    id: 3,
    title: '4 Video Editors for Shortfilm',
    description: 'Description of the GIG will be here abcdefghij',
    qualifyingCriteria: 'This is were the qualifying criteria value comes....',
    amount: 20000,
    currency: 'AED',
    dates: [
      { month: 'Sep 2025', days: '12, 15, 16-25' },
      { month: 'Oct 2025', days: '1-30' },
    ],
    locations: ['Dubai Design District', 'location1', 'location3'],
  },
  {
    id: 4,
    title: '4 Video Editors for Shortfilm',
    description: 'Description of the GIG will be here abcdefghij',
    qualifyingCriteria: 'This is were the qualifying criteria value comes....',
    amount: 20000,
    currency: 'AED',
    dates: [
      { month: 'Sep 2025', days: '12, 15, 16-25' },
      { month: 'Oct 2025', days: '1-30' },
    ],
    locations: ['Dubai Design District', 'location1', 'location3'],
  },
];

export default function GigsList() {
  return (
    <div className="space-y-4">
      {dummyGigs.map((gig) => (
        <GigCard key={gig.id} gig={gig} />
      ))}
    </div>
  );
}
