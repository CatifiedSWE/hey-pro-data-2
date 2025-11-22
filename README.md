# HeyProData - Professional Networking Platform

A specialized professional networking and talent marketplace built for the film, media, and creative industries. Built with Next.js 14, Tailwind CSS, and modern web technologies.

## 🎬 About

**HeyProData** connects artists, filmmakers, producers, actors, crew members, and other production professionals so they can collaborate, hire, and get hired for creative projects.

## ✨ Features

- **Authentication Pages**
  - Clean and modern login page
  - Sign-up page with real-time password validation
  - Social authentication options (Google, Apple)
  - Responsive design for mobile and desktop

- **Profile Creation Form**
  - Beautiful conic gradient background
  - Legal name fields (First name, Surname) - required
  - Optional alias name fields
  - Country selection (15 countries with UAE & Middle East priority)
  - City input field
  - Form validation - button disabled until all required fields are filled
  - Responsive design with smooth animations

- **OTP Verification Page**
  - Secure OTP input with 5 boxes
  - Numbers-only input validation
  - Auto-focus to next box on digit entry
  - Backspace navigation to previous box
  - Paste support for OTP codes
  - Visual feedback and security warning
  - Submit button enabled only when all digits entered

- **Password Validation**
  - Minimum of 8 characters
  - At least one uppercase letter
  - At least one special character
  - At least one number
  - Real-time visual feedback

- **Home Dashboard**
  - Feature cards showcasing platform capabilities
  - Profile creation
  - Project discovery
  - Direct communication
  - Secure payments

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Yarn package manager

### Installation

1. Clone the repository:
```bash
cd /app
```

2. Install dependencies:
```bash
yarn install
```

3. Run the development server:
```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The app will automatically redirect to the login page at `/auth/login`

## 📁 Project Structure

```
/app
├── app/
│   ├── page.js                    # Root page (redirects to login)
│   ├── layout.js                  # Root layout (Poppins font)
│   ├── globals.css                # Global styles
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.js            # Login page
│   │   ├── sign-up/
│   │   │   └── page.js            # Sign-up page with validation
│   │   ├── form/
│   │   │   └── page.js            # Profile creation form
│   │   └── otp/
│   │       └── page.js            # OTP verification page
│   ├── home/
│   │   └── page.js                # Home dashboard
│   ├── explore/
│   │   └── page.js                # Explore content and projects
│   ├── gigs/
│   │   └── page.js                # Job listings and opportunities
│   ├── whats-on/
│   │   └── page.js                # Events and happenings
│   ├── community/
│   │   └── page.js                # Forums and discussions
│   ├── profile/
│   │   └── page.js                # User profile page
│   ├── saved/
│   │   └── page.js                # Bookmarked content
│   ├── help/
│   │   └── page.js                # Help and support
│   ├── settings/
│   │   └── page.js                # Account settings
│   └── api/
│       └── [[...path]]/
│           └── route.js           # API routes
├── components/
│   ├── ui/                        # Shadcn UI components
│   ├── layout/                    # Layout components
│   │   ├── Navbar.jsx             # Top navigation bar
│   │   ├── LeftSidebar.jsx        # User profile widget
│   │   ├── RightSidebar.jsx       # Profiles widget
│   │   └── MainLayout.jsx         # Three-column layout wrapper
│   ├── modals/                    # Modal components
│   │   ├── NotificationModal.jsx  # Notifications overlay
│   │   └── ChatModal.jsx          # Chat/messaging overlay
│   ├── widgets/                   # Reusable widget components
│   │   ├── UserProfileWidget.jsx  # User profile card
│   │   └── ViewProfilesWidget.jsx # Profile list widget
│   └── feed/                      # Feed components
│       ├── PostCard.jsx           # Individual post card
│       └── FeedContainer.jsx      # Feed with infinite scroll
├── lib/
│   ├── utils.js                   # Utility functions
│   └── constants/
│       └── theme.js               # Theme colors and design tokens
├── public/
│   └── logo/
│       └── logo.svg               # HPD Logo
└── tailwind.config.js             # Tailwind configuration
```

## 🏗️ Layout Architecture

### Three-Column Layout
The main application uses a responsive three-column layout:
- **Left Sidebar**: User profile widget with quick navigation (Profile, Saved, Help, Settings)
- **Center Feed**: Main content area displaying posts, projects, or page-specific content
- **Right Sidebar**: "View Profiles" widget showing suggested connections

### Responsive Behavior
- **Desktop (1920px+)**: All three columns visible
- **Tablet (768px-1919px)**: Center content + sidebar(s) based on priority
- **Mobile (375px-767px)**: Center content only, sidebars accessible via menu

### Reusable Components
- **Navbar**: Top navigation bar with main menu items and action buttons
- **Modals**: Overlay components for Notifications and Chat (better UX for mobile)
- **Widgets**: Modular components (UserProfileWidget, ViewProfilesWidget)
- **Feed Components**: PostCard and FeedContainer for content display

## 🎨 Design Features

### Color Palette
The application uses a consistent color scheme defined in `/lib/constants/theme.js`:
- **Primary Button**: #FA6E80 (Coral Pink)
- **Background Grey**: #F8F8F8
- **Gradient Colors**: 
  - Coral Pink: #FA6E80
  - Steel Blue: #6A89BE
  - Teal Blue: #85AAB7
  - Cyan Teal: #31A7AC

### Login Page
- Left side: Beautiful gradient background (purple → blue → cyan)
- Right side: Login form with email/password fields
- "Keep me logged in" checkbox
- "Forgot password?" link
- Social login buttons (Google, Apple)
- Link to sign-up page

### Sign-Up Page
- Left side: Sign-up form
- Right side: Gradient background (reversed from login)
- Real-time password validation with visual indicators
- Clear password requirements display
- Button disabled until password meets all criteria
- Social sign-up options
- Link to login page

### Profile Creation Form (`/auth/form`)
- Vibrant conic gradient background (#FA6E80 → #6A89BE → #85AAB7 → #31A7AC)
- Centered white card with backdrop blur effect
- HPD logo from assets
- Legal name fields (required): First name, Surname
- Alias name fields (optional): Alias first name, Alias surname
- Location section:
  - Country dropdown with 15 countries (UAE & Middle East priority)
  - City text input
- Smart validation: Submit button disabled until all required fields filled
- Pink (#FA6E80) submit button
- Poppins font, black text
- Fully responsive with smooth transitions

### OTP Verification Page (`/auth/otp`)
- Same vibrant conic gradient background
- Centered white card design
- HPD logo
- Clear instructions with email display
- 5 OTP input boxes with smart features:
  - Only accepts numeric input (0-9)
  - Auto-focus to next box when digit entered
  - Backspace navigates to previous box
  - Arrow key navigation support
  - Paste support for full OTP codes
  - Visual focus states
- Security warning message with alert icon
- Pink (#FA6E80) submit button
- Button enabled only when all 5 digits entered
- Fully responsive design

### Home Page
- Header with logo and logout button
- Welcome section
- Feature cards:
  - Create Your Profile
  - Find Projects
  - Direct Communication
  - Secure Payments
- Call-to-action section
- Footer

## 🔐 Password Validation

The sign-up page implements comprehensive client-side password validation:

```javascript
// Password must contain:
- Minimum 8 characters     ✓
- 1 uppercase letter       ✓
- 1 number                 ✓
- 1 special character      ✓
```

Real-time feedback shows:
- Green checkmarks (✓) for met requirements
- Gray circles (○) for unmet requirements
- Button is disabled until all requirements are met

## 🎯 Routes

### Authentication Routes
- `/` - Redirects to login page
- `/auth/login` - Login page (default)
- `/auth/sign-up` - Sign-up page with password validation
- `/auth/form` - Profile creation form with validation
- `/auth/otp` - OTP verification page with auto-focus

### Main Application Routes
- `/home` - Home dashboard with feed (three-column layout)
- `/explore` - Discover content, projects, and talent
- `/gigs` - Browse and post job opportunities
- `/whats-on` - Events, screenings, and industry happenings
- `/community` - Forums and community discussions
- `/profile` - User profile view and edit
- `/saved` - Bookmarked content and saved items
- `/help` - Help center and support resources
- `/settings` - Account settings and preferences

### Modal Routes (Overlays)
- Notifications - Triggered by notification bell icon
- Chat/Messages - Triggered by chat icon

## 🛠️ Technologies Used

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Re-usable component library
- **React Hooks** - useState, useEffect, useRouter
- **JavaScript** - ES6+ features

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px and above)
- Tablet (768px - 1919px)
- Mobile (375px - 767px)

### Mobile-Specific Features:
- Gradient backgrounds hidden on mobile for better form visibility
- Stacked layout instead of side-by-side
- Touch-optimized buttons and inputs
- Optimized font sizes and spacing

## 🎭 Brand Colors

```css
Primary Purple: #9333ea (purple-600)
Primary Blue: #2563eb (blue-600)
Accent Cyan: #06b6d4 (cyan-400)
Text Dark: #1f2937 (gray-800)
Text Light: #6b7280 (gray-600)

/* New Form & OTP Pages */
Coral Pink: #FA6E80 (button color)
Steel Blue: #6A89BE (gradient)
Teal Blue: #85AAB7 (gradient)
Cyan Teal: #31A7AC (gradient)
Text Black: #000000
Conic Gradient: from 0deg at 50% 50%, #FA6E80 0deg, #6A89BE 144deg, #85AAB7 216deg, #31A7AC 360deg
```

## 🚦 User Flow

1. User visits root URL (`/`)
2. Automatically redirected to `/auth/login`
3. Can navigate to sign-up page via "Sign up" link
4. On sign-up, password validation runs in real-time
5. After successful login/signup, redirected to `/home`
6. Can logout from home page, returns to login

## 🔄 State Management

Currently using React's built-in state management:
- `useState` for form data
- `useRouter` for navigation
- Client-side validation

## 🎨 Styling Approach

- Tailwind utility classes for all styling
- No custom CSS files (except globals.css)
- Consistent design tokens
- Gradient backgrounds for visual appeal
- Smooth transitions and hover effects

## 📝 Future Enhancements

Potential features to add:
- [ ] Backend authentication with JWT
- [ ] Supabase integration for database and authentication
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Social authentication implementation
- [ ] Profile creation and management
- [ ] Project posting and discovery
- [ ] Direct messaging system
- [ ] Payment integration
- [ ] Review and rating system

## 🤝 Contributing

This is a starter template for a professional networking platform. Feel free to extend and customize based on your needs.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Development Notes

### Hot Reload
The application uses Next.js hot reload. Changes to files will automatically refresh the browser.

### Adding New Pages
Create a new folder under `/app` with a `page.js` file:
```javascript
// Example: /app/profile/page.js
export default function ProfilePage() {
  return <div>Profile Page</div>
}
```

### Adding Components
Place reusable components in `/components` directory and import as needed.

### Environment Variables
For production deployment, add environment variables in `.env.local`:
```bash
NEXT_PUBLIC_API_URL=your_api_url
```

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for the creative community**

🎬 HeyProData - Where Creative Professionals Connect
