import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Upload from './pages/Upload';
import StyleDetail from './pages/StyleDetail';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Wishlist from './pages/Wishlist';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="upload" element={<Upload />} />
          <Route path="style/:id" element={<StyleDetail />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;
