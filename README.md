<p align="center">
  <img src="https://img.shields.io/badge/OnlyCSS-Ship%20Beautiful%20UI%20Faster-8B5CF6?style=for-the-badge&logo=css3&logoColor=white" alt="OnlyCSS Banner"/>
</p>

<h1 align="center">OnlyCSS — Ship Beautiful UI, Faster.</h1>

<p align="center">
  A curated, community-driven registry of high-quality, copy-paste CSS components.<br/>
  Built with React, Firebase, and a passion for beautiful design.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-4.0.0-8B5CF6?style=flat-square" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-11.3-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## 🚀 Overview

**OnlyCSS** is a full-stack social platform where developers and designers can:

- **Upload** CSS/HTML/JS components with a live iframe preview
- **Edit** existing styles with a dedicated editor (5 edits/day limit)
- **Discover** trending components on a beautiful Explore page
- **Interact** with the community through Likes, Saves, Downloads, and Follows
- **Compete** on a global Leaderboard with a built-in Points & Ranking system
- **Track** personal analytics and growth on a Creator Dashboard

---

## ✨ What Makes OnlyCSS Special

| Feature | Description |
|---------|-------------|
| **Zero Dependencies** | Every component is pure HTML & CSS. No JS bundles. Just copy, paste, ship. |
| **Framework Agnostic** | Works with React, Vue, Svelte, or plain HTML. |
| **Live Code Editor** | Real-time preview powered by CodeMirror 6 with One Dark theme. |
| **Gamification** | Points, rank tiers, and a global leaderboard to reward contributors. |
| **Accessible** | Built with semantic HTML and ARIA attributes by default. |
| **Fully Responsive** | Every design works across mobile, tablet, and ultra-wide monitors. |

---

## 📸 Key Features

### 🎨 StyleCard System
- Live iframe previews of CSS creations with auto-scaling
- One-click Like, Save, Download, and Follow interactions
- Dynamic author avatars with real-time profile synchronization
- Inline Follow/Unfollow buttons directly on each card
- Author modal with stats (followers, likes, views, downloads)
- **Edit button** for style owners (5 edits per day)

### 🏆 Points & Ranking Engine
| Action             | Points Earned |
|--------------------|---------------|
| Receive a Like     | +5            |
| Receive a Save     | +10           |
| Receive a Download | +15           |
| Gain a Follower    | +20           |
| Upload a Style     | +50           |

| Rank       | Points Required |
|------------|-----------------|
| 🥉 Bronze  | 0 – 99          |
| 🥈 Silver  | 100 – 499       |
| 🥇 Gold    | 500 – 1,999     |
| 💎 Platinum | 2,000 – 4,999   |
| 💠 Diamond  | 5,000+          |

### 🏠 Premium Home Page
- **Live Code Editor Animation** — CSS types itself in real-time with a live-render preview
- **Features Showcase** — Bento-grid layout highlighting platform capabilities
- **How It Works** — 3-step onboarding flow (Discover → Copy → Ship)
- **Project Ideas** — Curated inspiration cards for contributors
- **Real-time Stats** — Live style count, creator count, likes, and impressions from Firestore
- **Scroll Reveal Animations** — Smooth fade-in effects as users scroll down the page

### 🔔 Real-Time Notification System
- Instant push notifications for likes, saves, downloads, and follows
- Unread notification highlighting with purple accent border
- Click-outside-to-close dropdown behavior
- Auto-pruning: max 50 notifications per user (oldest are deleted automatically)
- Mark-as-read on dropdown close
- Configurable per-user via Settings preferences

### 📊 Creator Dashboard
- Premium glassmorphic UI with dynamic gradient hero panel
- Live stats grid: Total Styles, Views, Likes, Downloads
- Rank & Points badge with real-time tier display
- Admin tool to sync historical points across the entire database

### 🏅 Global Leaderboard
- Redesigned with a professional, minimalist dark theme
- **How Rankings Work** explainer card with point breakdown
- **Rank Tiers** legend (Bronze → Diamond)
- Top 3 podium with avatar highlights and trophy indicators
- Clean table layout for 4th place and below

### 👤 User Profiles
- Full profile pages with bio, location, website, and social links
- Follow/Unfollow capability with real-time follower count
- Grid view of all published styles
- Profile avatar synchronization across the entire platform

### ✏️ Edit Workflow
- Edit existing styles via `/edit/:id` route
- Auto-loads current data into the Upload editor
- Enforces 5 daily edit limit (separate from 5 daily upload limit)
- Only the original author can modify their own styles

### 🔐 Authentication
- Firebase Auth with Email/Password and Google Sign-In
- Onboarding modal for new users (username setup)
- Protected routes with automatic redirects
- Persistent sessions across browser refreshes

### ⚙️ Settings
- Profile editing with real-time username availability checks
- Notification preferences (Email, In-App, Marketing toggles)
- 24-hour rate limit on username and display name changes
- 150-character bio limit with live character counter

---

## 🏗️ Project Structure

```
OnlyCSS/
├── public/
│   └── favicon.png              # Custom round logo
├── src/
│   ├── components/
│   │   ├── StyleCard.jsx        # Core component — preview, interactions, edit
│   │   └── layout/
│   │       ├── Header.jsx       # Global header with RGB animated logo
│   │       ├── Footer.jsx       # Site-wide footer
│   │       ├── Layout.jsx       # Root layout wrapper
│   │       ├── DashboardSidebar.jsx  # Dashboard navigation
│   │       └── OnboardingModal.jsx   # New user onboarding
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state provider
│   ├── firebase/
│   │   └── config.js            # Firebase initialization (uses .env)
│   ├── pages/
│   │   ├── Home.jsx             # Landing page with animations
│   │   ├── Auth.jsx             # Login & Registration
│   │   ├── Explore.jsx          # Browse all styles
│   │   ├── Dashboard.jsx        # Creator dashboard with stats
│   │   ├── Upload.jsx           # Publish / Edit CSS styles
│   │   ├── StyleDetail.jsx      # Full style view with code editor
│   │   ├── Profile.jsx          # User profile page
│   │   ├── Leaderboard.jsx      # Global rankings with point guide
│   │   ├── Analytics.jsx        # Personal analytics
│   │   ├── Wishlist.jsx         # Saved styles
│   │   └── Settings.jsx         # Account settings
│   ├── utils/
│   │   ├── notifications.js     # Notification creation & auto-pruning
│   │   └── points.js            # Points calculation & rank engine
│   ├── App.jsx                  # Route definitions
│   ├── main.jsx                 # App entry point
│   └── index.css                # Global styles, animations & design tokens
├── .env                         # 🔒 Firebase config (NOT committed)
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js           # Custom design system tokens
├── postcss.config.js
├── vite.config.js
└── eslint.config.js
```

---

## ⚙️ Tech Stack

| Layer       | Technology                           |
|-------------|--------------------------------------|
| Frontend    | React 19, React Router 7            |
| Styling     | TailwindCSS 3.4, Custom Design System |
| Backend     | Firebase Firestore (NoSQL Database)  |
| Auth        | Firebase Authentication              |
| Code Editor | CodeMirror 6 (with One Dark theme)   |
| Search      | Fuse.js (fuzzy search)               |
| Icons       | Lucide React                         |
| Build Tool  | Vite 8                               |
| Deployment  | Firebase Hosting / Vercel / Netlify  |

---

## 🔧 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm**
- A **Firebase** project with Firestore and Authentication enabled

### 1. Clone the Repository
```bash
git clone https://github.com/PoojanPatel7/OnlyCSS.git
cd OnlyCSS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> ⚠️ **Security**: The `.env` file is excluded from version control via `.gitignore`. Never commit your Firebase keys.

### 4. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password + Google)
3. Enable **Cloud Firestore** database
4. Set Firestore rules to allow authenticated read/write

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to see the app.

### 6. Build for Production
```bash
npm run build
```

---

## 🗄️ Firestore Data Model

### `users` Collection
| Field                    | Type      | Description                              |
|--------------------------|-----------|------------------------------------------|
| `displayName`            | string    | User's display name                      |
| `username`               | string    | Unique @username                         |
| `email`                  | string    | Email address                            |
| `photoURL`               | string    | Profile avatar URL                       |
| `bio`                    | string    | Short bio text (max 150 chars)           |
| `location`               | string    | User location                            |
| `website`                | string    | Personal website URL                     |
| `followers`              | array     | Array of follower UIDs                   |
| `rankPoints`             | number    | Total accumulated points                 |
| `rankTier`               | string    | Current rank (bronze–diamond)            |
| `stylesCount`            | number    | Number of published styles               |
| `preferences`            | map       | Notification & email preferences         |
| `lastDisplayNameChange`  | number    | Timestamp of last display name change    |
| `lastUsernameChange`     | number    | Timestamp of last username change        |
| `createdAt`              | timestamp | Account creation date                    |

### `styles` Collection
| Field              | Type      | Description                     |
|--------------------|-----------|---------------------------------|
| `authorId`         | string    | Creator's UID                   |
| `authorUsername`    | string    | Snapshot of author username      |
| `authorPhotoURL`   | string    | Snapshot of author avatar        |
| `title`            | string    | Style title                     |
| `description`      | string    | Style description               |
| `cssCode`          | string    | CSS source code                 |
| `htmlCode`         | string    | HTML source code                |
| `jsCode`           | string    | JavaScript source code          |
| `combinedCode`     | string    | Combined HTML/CSS/JS code       |
| `isCombined`       | boolean   | Whether code is in combined mode|
| `category`         | string    | Style category                  |
| `tags`             | array     | Tags for searchability          |
| `likesCount`       | number    | Total like count                |
| `downloadsCount`   | number    | Total download count            |
| `viewsCount`       | number    | Total view count                |
| `likedBy`          | array     | UIDs of users who liked         |
| `savedBy`          | array     | UIDs of users who saved         |
| `createdAt`        | timestamp | Creation date                   |
| `updatedAt`        | timestamp | Last edit date                  |

### `notifications` Collection
| Field            | Type      | Description                    |
|------------------|-----------|--------------------------------|
| `userId`         | string    | Recipient's UID                |
| `type`           | string    | `like`, `save`, `download`, `follow` |
| `sourceUserId`   | string    | Actor's UID                    |
| `sourceUserName` | string    | Actor's display name           |
| `sourceUserPhoto`| string    | Actor's avatar URL             |
| `styleId`        | string    | Related style (if applicable)  |
| `styleTitle`     | string    | Related style title            |
| `read`           | boolean   | Whether notification was read  |
| `createdAt`      | timestamp | Notification timestamp         |

---

## 🎨 Design System

The app uses a custom design token system defined in `tailwind.config.js`:

- **Colors**: Deep dark backgrounds (`#050508`), vibrant accent purple (`#8B5CF6`), accent cyan (`#00FFD1`), accent pink (`#FF006E`)
- **Typography**: Inter (body), Outfit (headings)
- **Effects**: Glassmorphism, gradient borders, glow shadows, micro-animations
- **Appearance**: Dark mode only with subtle luminance layers
- **Logo**: Custom RGB-animated neon "CSS" text with `animate-rgb-lights` keyframes

---

## 🛡️ Security Notes

- `.env` is listed in `.gitignore` — Firebase credentials are never committed
- All database operations require Firebase Authentication
- Firestore security rules should enforce `auth.uid` based access control
- Client-side points are validated against server data via `recalculateAllUserPoints()`
- Username and display name changes are rate-limited to once every 24 hours
- Bio field is capped at 150 characters to prevent abuse
- Upload limit: 5 new styles per day per user
- Edit limit: 5 edits per day per user
- In-app notifications can be disabled per-user via preferences

---

## 📜 Scripts

| Command         | Description                   |
|-----------------|-------------------------------|
| `npm run dev`   | Start local development server|
| `npm run build` | Build production bundle       |
| `npm run lint`  | Run ESLint checks             |
| `npm run preview` | Preview production build    |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Poojan Patel**
- GitHub: [@PoojanPatel7](https://github.com/PoojanPatel7)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 📋 Version History

### 🔹 v4.0.0 — *Home Redesign & Leaderboard Update* (May 24, 2026)
> Professional-grade UI overhaul with new sections, animations, and branding.
- ✨ **Home Page Redesign** — Vercel/Stripe-inspired clean, minimalist dark aesthetic
- ✨ **Live Code Editor Animation** — CSS types itself with a real-time live preview
- ✨ **Features Section** — Bento-grid layout (Zero Dependencies, Framework Agnostic, Accessible, Responsive)
- ✨ **How It Works** — 3-step visual guide (Discover → Copy → Ship)
- ✨ **Project Ideas** — Curated inspiration cards for new contributors
- ✨ **Scroll Reveal** — Smooth, fade-in animations on scroll using IntersectionObserver
- ✨ **Leaderboard Redesign** — Clean dark theme with "How Rankings Work" explainer and Rank Tiers guide
- ✨ **Edit Workflow** — Users can edit their own styles (5 edits/day limit via Firestore timestamps)
- ✨ **Edit Button on StyleCards** — One-click access for style owners
- ✨ **Custom Favicon** — Premium round logo displayed in browser tabs
- ✨ **RGB Animated Logo** — Neon color-cycling effect on the header "CSS" text
- 🎨 Professional copywriting across all section headers
- 🎨 Monochromatic icon system replacing colored emoji-style icons

### 🔹 v3.0.0 — *Settings & Preferences Update* (May 20, 2026)
> Premium settings overhaul with notification controls and account management.
- ✨ Completely redesigned **Settings page** with premium glassmorphic UI
- ✨ Fully functional **Notifications preferences** tab (Email, In-App, Marketing toggles)
- ✨ Custom animated **toggle switches** component
- ✨ **Real-time availability checks** for both display name and username (debounced Firestore queries)
- 🔒 **24-hour rate limit** on username and display name changes
- 🔒 **150-character bio limit** with live character counter
- 🔔 In-app notifications now **respect user preferences**
- 🎨 Responsive sidebar navigation with horizontal scroll on mobile
- ⚡ Page auto-refreshes after successful settings save
- 🗑️ Removed avatar change/remove buttons (avatar is linked to auth provider)

### 🔹 v2.0.0 — *Social Platform & Gamification Update* (May 19, 2026)
> Full social platform with community interactions, gamification, and premium analytics.
- ✨ **Points & Ranking system** — earn points for likes, saves, downloads, followers, and uploads
- ✨ Five ranking tiers: 🥉 Bronze → 🥈 Silver → 🥇 Gold → 💎 Platinum → 💠 Diamond
- ✨ **Real-time notification system** — instant alerts for likes, saves, downloads, and follows
- ✨ **Global Leaderboard** with sortable columns and animated rank badges
- ✨ **Creator Dashboard** with premium glassmorphic UI and live stats grid
- ✨ **Growth Velocity charts** and engagement breakdown on Analytics page
- ✨ **StyleCard social integration** — inline Follow/Unfollow, author modal with full stats
- ✨ Dynamic author avatar synchronization across all platform cards
- ✨ **Home page** transformed with real-time Firestore-aggregated stats
- 🔐 Protected routes with automatic auth redirects

### 🔹 v1.0.0 — *Initial Release* (May 17, 2026)
> Core platform scaffolding with upload, explore, and authentication.
- ✨ **Upload system** — publish CSS/HTML/JS components with live iframe preview
- ✨ **Explore page** — browse and search all community styles with Fuse.js fuzzy search
- ✨ **Style Detail page** — full code viewer with CodeMirror 6 editor and One Dark theme
- ✨ **Like, Save, and Download** interactions on all style cards
- ✨ **User Profiles** — bio, location, website, social links, and published styles grid
- ✨ **Wishlist page** — view all saved/bookmarked styles
- 🔐 **Firebase Authentication** — Email/Password and Google Sign-In
- 🎨 Custom design token system with TailwindCSS
- ⚙️ Vite 8 build tooling with hot module replacement
- 📱 Fully responsive layout across all breakpoints

---

<p align="center">
  Made with ❤️ and pure CSS magic by <a href="https://github.com/PoojanPatel7">Poojan Patel</a>
</p>
