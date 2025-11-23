# Gig Management Module

Comprehensive gig management system for HeyProData platform, enabling producers and project managers to manage crew hiring, track applications, check availability, and maintain contact lists.

---

## 📁 Module Structure

```
/app/components/gigs/
├── GigCard.js                  # Individual gig card with checkbox
├── GigsList.js                 # List view of all gigs
├── GigFilters.js               # Filter component for gig/date/location selection
├── ApplicationsTab.js          # Applicant management view
├── ApplicantTable.js          # Reusable applicant table component
├── AvailabilityCheckTab.js    # Crew availability calendar
├── ContactListTab.js          # Department-wise contact information
└── README.md                   # This file

/app/app/gigs/
├── page.js                     # Redirect page to /gigs/manage
└── manage/
    └── page.js                 # Main gig management page with tabs
```

---

## 🎯 Module Overview

The Gig Management module provides a complete solution for managing film/media production gigs, from posting opportunities to hiring and managing crew members.

### Key Features

✅ **Multi-Tab Interface**
- Gigs: View and manage all posted gigs
- Application: Review and manage applicant submissions
- Availability Check: Track crew member availability across dates
- Contact List: Organized contact information by department

✅ **Smart Filtering System**
- Gig selection dropdown
- Date range filters with visual badges
- Location and department filters
- Status filters (Confirmed, Shortlisted, Pending)
- Expandable advanced filters

✅ **Responsive Design**
- Mobile-first approach (375px+)
- Tablet optimized (768px+)
- Desktop enhanced (1920px+)
- Horizontal scrolling for wide tables

✅ **Component-Based Architecture**
- Reusable, modular components
- Clean separation of concerns
- Easy to maintain and extend

---

## 📋 Tab Details

### 1. Gigs Tab
**Purpose:** Display all posted gigs with details

**Features:**
- Checkbox selection for bulk actions
- Gig title and description
- Qualifying criteria display
- Payment information (AED amount)
- Multiple date ranges with icons
- Multiple location listings
- Hover effects and transitions

**Components Used:**
- `GigsList.js` - Container component
- `GigCard.js` - Individual card with full details

---

### 2. Application Tab
**Purpose:** Review and manage applicants for gigs

**Features:**
- Gig filter dropdown at top
- Date filter badges (interactive)
- "See referrals" action link
- "Invite crew for this Gig" button
- Comprehensive applicant table with:
  - Avatar and name
  - City (styled in teal)
  - Skill set with separators
  - View credits link
  - Referral avatars (overlapped display)
  - Chat action button
  - Release action (red X icon)
  - Shortlist action (teal + icon)
  - Confirm action (teal checkmark icon)

**Components Used:**
- `GigFilters.js` - Filter bar
- `ApplicationsTab.js` - Tab container
- `ApplicantTable.js` - Reusable table component

**Action Button Colors:**
- Release: `#FA6E80` (Coral Pink) - Red X icon
- Shortlist: `#31A7AC` (Teal) - Plus icon
- Confirm: `#31A7AC` (Teal) - Checkmark icon
- Alternative: Envelope icon for email actions

---

### 3. Availability Check Tab
**Purpose:** Track crew availability across production dates

**Features:**
- Gig filter dropdown
- Date filter badges
- Multiple role sections (Camera, Lighting, etc.)
- Calendar-style grid view
- 7-day availability display
- Crew member avatars and names
- N/A status indicators
- Sticky left column for names
- Horizontal scroll for dates

**Components Used:**
- `GigFilters.js` - Filter bar
- `AvailabilityCheckTab.js` - Availability grid view

**Future Enhancements:**
- Interactive date cells
- Availability status colors (Available/Busy/Maybe)
- Export to calendar
- Conflict detection

---

### 4. Contact List Tab
**Purpose:** Organized crew contact information by department

**Features:**
- Gig filter dropdown
- Date filter badges
- Department-grouped layout
- Department headers with gig association
- Contact table with:
  - Role
  - Company
  - Name with avatar
  - Phone number
  - Email address
- Export-ready format

**Components Used:**
- `GigFilters.js` - Filter bar
- `ContactListTab.js` - Contact list view

**Data Structure:**
```javascript
Department
  ├── Camera — 4 Camera Operator for Shortfilm
  │   ├── Contact 1
  │   └── Contact 2
  └── Lighting — 4 Lighting Operator for Shortfilm
      ├── Contact 1
      └── Contact 2
```

---

## 🎨 Design System

### Colors (from `/lib/constants/theme.js`)

**Primary Colors:**
- Coral Pink: `#FA6E80` - Primary buttons, badges
- Steel Blue: `#6A89BE` - Gradient component
- Teal Blue: `#85AAB7` - Gradient component
- Cyan Teal: `#31A7AC` - Action buttons, links

**Neutral Colors:**
- Background Grey: `#F8F8F8` - Active tab background
- White: `#FFFFFF` - Card backgrounds
- Black: `#000000` - Primary text
- Gray variants: Borders, secondary text

### Typography
- **Font Family:** Poppins (from layout.js)
- **Headings:** Bold, gradient text
- **Body:** Regular weight, readable sizes
- **Labels:** Semibold, uppercase, smaller size

### Spacing
- Consistent padding: `p-4` to `p-6`
- Gap spacing: `gap-2` to `gap-8`
- Margins: `mb-4` to `mb-8`

### Components
- **Cards:** Rounded corners, subtle shadows
- **Tables:** Alternating row hover, bordered cells
- **Buttons:** Rounded-full for primary, rounded-lg for filters
- **Inputs:** Rounded-lg, focus ring in brand color

---

## 🔧 Component API

### GigFilters.js
```javascript
<GigFilters
  selectedGig="1"              // Current selected gig ID
  onGigChange={(id) => {...}}  // Handler for gig selection
  gigs={[...]}                 // Array of available gigs
/>
```

### ApplicationsTab.js
```javascript
<ApplicationsTab
  selectedGig="1"  // Filter applicants by this gig
/>
```

### AvailabilityCheckTab.js
```javascript
<AvailabilityCheckTab
  selectedGig="1"  // Show availability for this gig
/>
```

### ContactListTab.js
```javascript
<ContactListTab
  selectedGig="1"  // Show contacts for this gig
/>
```

---

## 🚀 Usage

### Accessing the Module

1. **Direct URL:** `/gigs/manage`
2. **Navbar Link:** Click "Gigs" in the main navigation
3. **Redirect:** `/gigs` automatically redirects to `/gigs/manage`

### Navigation Flow

```
User clicks "Gigs" in navbar
  ↓
/gigs/page.js (redirect)
  ↓
/gigs/manage/page.js (main interface)
  ↓
Tabs: Gigs | Application | Availability Check | Contact list
```

---

## 📊 Data Structure

### Gig Object
```javascript
{
  id: '1',
  title: '4 Video Editors for Shortfilm',
  description: 'Description of the GIG will be here abcdefghij',
  qualifyingCriteria: 'This is were the qualifying criteria value comes....',
  amount: 20000,
  currency: 'AED',
  dates: [
    { month: 'Sep 2025', days: '12, 15, 16-25' },
    { month: 'Oct 2025', days: '1-30' }
  ],
  locations: ['Dubai Design District', 'location1', 'location3']
}
```

### Applicant Object
```javascript
{
  id: 1,
  name: 'Aarav Mehta',
  avatar: 'https://...',
  city: 'Dubai',
  skills: ['Guitarist', 'Sound Enginee'],
  credits: 'View credits',
  referrals: [
    { avatar: 'https://...' }
  ],
  actions: {
    release: 'x' | 'envelope',
    shortlist: 'plus' | 'envelope',
    confirm: 'check' | 'envelope' | ''
  }
}
```

---

## 🔄 State Management

### Main Page State
```javascript
const [activeTab, setActiveTab] = useState('gigs');
const [selectedGig, setSelectedGig] = useState('1');
```

### Filter State (in GigFilters)
```javascript
const [isExpanded, setIsExpanded] = useState(false);
```

### Card State (in GigCard)
```javascript
const [isChecked, setIsChecked] = useState(false);
```

---

## 🎯 Future Enhancements

### Backend Integration
- [ ] Connect to API endpoints
- [ ] Real-time data updates
- [ ] WebSocket for live availability
- [ ] File upload for documents

### Advanced Features
- [ ] Bulk actions on selected gigs
- [ ] Advanced search with filters
- [ ] Export to PDF/Excel
- [ ] Email/SMS notifications
- [ ] Calendar integrations
- [ ] Payment tracking
- [ ] Contract management

### UI Enhancements
- [ ] Drag-and-drop for shortlisting
- [ ] Inline editing
- [ ] Custom date range picker
- [ ] Map view for locations
- [ ] Dark mode support

### Optimization
- [ ] Pagination for large datasets
- [ ] Virtual scrolling for tables
- [ ] Image lazy loading
- [ ] Caching strategies

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (min-width: 375px) { ... }

/* Tablet */
@media (min-width: 768px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }

/* Large Desktop */
@media (min-width: 1920px) { ... }
```

---

## 🧪 Testing Checklist

### Functionality
- [ ] Tab navigation works correctly
- [ ] Filters update content properly
- [ ] All buttons are clickable
- [ ] Checkboxes toggle state
- [ ] Dropdown menus function
- [ ] Tables scroll horizontally on mobile

### Responsiveness
- [ ] Mobile view (375px)
- [ ] Tablet view (768px)
- [ ] Desktop view (1920px)
- [ ] Text remains readable at all sizes
- [ ] No horizontal overflow
- [ ] Touch targets are adequate (44px min)

### Visual
- [ ] Colors match design system
- [ ] Gradients render correctly
- [ ] Icons are aligned
- [ ] Spacing is consistent
- [ ] Hover states work
- [ ] Active tab is highlighted

---

## 🐛 Known Issues

*Currently none. This is a UI-only implementation with dummy data.*

---

## 📝 Notes

1. **Dummy Data:** All data is currently hardcoded for demonstration purposes
2. **No Backend:** This module is frontend-only and needs API integration
3. **Filter Logic:** Filters display but don't actually filter data yet (beyond gig selection)
4. **Actions:** Button actions are visual only, no actual functionality
5. **Validation:** No form validation implemented yet

---

## 👥 Component Dependencies

```
manage/page.js
  ├── GigFilters.js
  ├── GigsList.js
  │   └── GigCard.js
  ├── ApplicationsTab.js
  │   └── ApplicantTable.js
  ├── AvailabilityCheckTab.js
  └── ContactListTab.js
```

---

## 📚 Related Documentation

- Main README: `/app/README.md`
- Theme Constants: `/app/lib/constants/theme.js`
- Component Library: Shadcn UI
- Styling: Tailwind CSS

---

**Last Updated:** July 2025
**Version:** 1.0.0
**Maintained by:** HeyProData Development Team
