import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminRoute from './components/auth/AdminRoute';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Upload = lazy(() => import('./pages/Upload'));
const StyleDetail = lazy(() => import('./pages/StyleDetail'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminStyles = lazy(() => import('./pages/admin/AdminStyles'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-screen bg-[#050508] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-white/10 border-t-accent-purple rounded-full animate-spin"></div>
      <p className="text-white/50 font-mono text-sm tracking-widest uppercase">Loading</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public & User Protected Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="upload" element={<Upload />} />
            <Route path="edit/:id" element={<Upload />} />
            <Route path="style/:id" element={<StyleDetail />} />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Auth Route */}
          <Route path="/auth" element={<Auth />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="styles" element={<AdminStyles />} />
            </Route>
          </Route>

        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
