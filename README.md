# 🎨 CSSVault

CSSVault is a full-stack, community-driven platform exclusively for developers and designers to share, discover, copy, and appreciate CSS styles, animations, components, and effects. Think of it as "GitHub meets Dribbble, but only for CSS."

## ✨ Features
- **Interactive Code Editor:** Multi-step upload workflow with side-by-side CSS and HTML editors powered by CodeMirror.
- **Live Previews:** Safely renders user-submitted CSS/HTML using sandboxed `<iframe>` tags with `srcdoc`.
- **Developer Profiles & Dashboards:** Public profiles showcasing user ranks, statistics, and uploaded styles. Private dashboards for managing published styles and drafts.
- **Global Leaderboard:** Rank tracking system featuring a dynamic podium for the top 3 users based on community engagement (likes, views, and downloads).
- **Style Wishlists:** Save and organize favorite styles into public or private folders.
- **Dynamic Explore Grid:** Masonry-style browsing experience with client-side filtering and sorting.
- **Dark & Premium UI:** Custom design system built on Tailwind CSS featuring deep void backgrounds, neon accents (purple, cyan, pink), and smooth glassmorphic effects.

## 🛠️ Tech Stack
- **Frontend Framework:** React 18 + Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v3 + Custom CSS Variables
- **Icons:** Lucide React
- **Code Editor:** `@uiw/react-codemirror` (with CSS/HTML language packs)
- **Backend & Database:** Firebase (Firestore)
- **Authentication:** Firebase Auth (Google & GitHub)
- **Hosting:** Firebase Hosting (Prepared)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/PoojanPatel7/OnlyCSS.git
cd OnlyCSS
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Firebase Configuration
Create a `.env` file in the root directory and add your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to see the app.

## 🔒 Firebase Security Rules (Firestore)
To ensure your database is secure in production, apply the following rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /styles/{styleId} {
      allow read: if resource.data.status == 'published' || (request.auth != null && resource.data.authorId == request.auth.uid);
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.authorId == request.auth.uid;
    }
  }
}
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
