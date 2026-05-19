<p align="center">
  <img src="https://img.shields.io/badge/OnlyCSS-Where%20CSS%20Becomes%20Art-8B5CF6?style=for-the-badge&logo=css3&logoColor=white" alt="OnlyCSS Banner"/>
</p>

<h1 align="center">✨ OnlyCSS — Where CSS Becomes Art ✨</h1>

<p align="center">
  A community-driven platform for CSS creators to showcase, discover, and share stunning CSS components, animations, and layouts. Built with React, Firebase, and a passion for beautiful design.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-11.3-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## 🚀 Overview

**OnlyCSS** is a full-stack social platform that lets developers and designers:

- **Upload** CSS/HTML/JS components with live preview
- **Discover** trending styles on a beautiful Explore page
- **Interact** with the community through Likes, Saves, Downloads, and Follows
- **Compete** on a global Leaderboard with a built-in Points & Ranking system
- **Track** personal analytics and growth on a Creator Dashboard

---

## 📸 Key Features

### 🎨 StyleCard System
- Live iframe previews of CSS creations with auto-scaling
- One-click Like, Save, Download, and Follow interactions
- Dynamic author avatars with real-time profile synchronization
- Inline Follow/Unfollow buttons directly on each card
- Author modal with stats (followers, likes, views, downloads)

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
| 👑 Diamond  | 5,000+          |

### 🔔 Real-Time Notification System
- Instant push notifications for likes, saves, downloads, and follows
- Unread notification highlighting with purple accent border
- Click-outside-to-close dropdown behavior
- Auto-pruning: max 50 notifications per user (oldest are deleted automatically)
- Mark-as-read on dropdown close (not on open, so you can review highlights)

### 📊 Creator Dashboard
- Premium glassmorphic UI with dynamic gradient hero panel
- Live stats grid: Total Styles, Views, Likes, Downloads
- Rank & Points badge with real-time tier display
- Admin tool to sync historical points across the entire database
- Empty state with inspiring call-to-action

### 🏅 Global Leaderboard
- Competitive ranking system across all users
- Sortable by points, followers, likes, and downloads
- Animated rank badges and position indicators

### 👤 User Profiles
- Full profile pages with bio, location, website, and social links
- Follow/Unfollow capability with real-time follower count
- Grid view of all published styles
- Profile avatar synchronization across the entire platform

### 🔐 Authentication
- Firebase Auth with Email/Password and Google Sign-In
- Protected routes with automatic redirects
- Persistent sessions across browser refreshes

---

## 🏗️ Project Structure

```
OnlyCSS/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images and media
│   ├── components/
│   │   ├── StyleCard.jsx       # Core component — preview, interactions, follow
│   │   └── layout/
│   │       ├── Header.jsx      # Global header with notification system
│   │       ├── Footer.jsx      # Site-wide footer
│   │       └── DashboardSidebar.jsx  # Dashboard navigation sidebar
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication state provider
│   ├── firebase/
│   │   └── config.js           # Firebase initialization (uses .env)
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Auth.jsx            # Login & Registration
│   │   ├── Explore.jsx         # Browse all styles
│   │   ├── Dashboard.jsx       # Creator dashboard with stats
│   │   ├── Upload.jsx          # Publish new CSS styles
│   │   ├── StyleDetail.jsx     # Full style view with code editor
│   │   ├── Profile.jsx         # User profile page
│   │   ├── Leaderboard.jsx     # Global rankings
│   │   ├── Analytics.jsx       # Personal analytics
│   │   ├── Wishlist.jsx        # Saved styles
│   │   └── Settings.jsx        # Account settings
│   ├── utils/
│   │   ├── notifications.js    # Notification creation & auto-pruning
│   │   └── points.js           # Points calculation & rank engine
│   ├── App.jsx                 # Route definitions
│   ├── main.jsx                # App entry point
│   └── index.css               # Global styles & design tokens
├── .env                        # 🔒 Firebase config (NOT committed)
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js          # Custom design system tokens
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
| Field          | Type     | Description                    |
|----------------|----------|--------------------------------|
| `displayName`  | string   | User's display name            |
| `username`     | string   | Unique @username               |
| `email`        | string   | Email address                  |
| `photoURL`     | string   | Profile avatar URL             |
| `bio`          | string   | Short bio text                 |
| `location`     | string   | User location                  |
| `website`      | string   | Personal website URL           |
| `followers`    | array    | Array of follower UIDs         |
| `rankPoints`   | number   | Total accumulated points       |
| `rankTier`     | string   | Current rank (bronze–diamond)  |
| `createdAt`    | timestamp| Account creation date          |

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

---

## 🛡️ Security Notes

- `.env` is listed in `.gitignore` — Firebase credentials are never committed
- All database operations require Firebase Authentication
- Firestore security rules should enforce `auth.uid` based access control
- Client-side points are validated against server data via `recalculateAllUserPoints()`

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

<p align="center">
  Made with ❤️ and pure CSS magic
</p>
