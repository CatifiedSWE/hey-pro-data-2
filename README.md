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
│   ├── layout.js                  # Root layout
│   ├── globals.css                # Global styles
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.js            # Login page
│   │   └── sign-up/
│   │       └── page.js            # Sign-up page with validation
│   ├── home/
│   │   └── page.js                # Home dashboard
│   └── api/
│       └── [[...path]]/
│           └── route.js           # API routes
├── components/
│   └── ui/                        # Shadcn UI components
├── lib/
│   └── utils.js                   # Utility functions
└── tailwind.config.js             # Tailwind configuration
```

## 🎨 Design Features

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

- `/` - Redirects to login page
- `/auth/login` - Login page (default)
- `/auth/sign-up` - Sign-up page with password validation
- `/home` - Home dashboard (after successful authentication)

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
- [ ] MongoDB integration for user storage
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
