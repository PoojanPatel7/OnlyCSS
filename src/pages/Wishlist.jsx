import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import StyleCard from '../components/StyleCard';
import { Heart, Folder, Plus, Lock, Globe } from 'lucide-react';

const Wishlist = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [wishlists, setWishlists] = useState([{ id: 'default', name: 'Saved', isPublic: false }]);
  const [activeWishlist, setActiveWishlist] = useState('default');
  const [savedStyles, setSavedStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const fetchWishlists = async () => {
      try {
        // Mocking the wishlist items for now as building the full join logic takes more time
        // In a real scenario:
        // 1. Fetch wishlists for user
        // 2. Fetch wishlist_items for active wishlist
        // 3. Fetch style docs for those items
        
        // Simulating empty state for now
        setSavedStyles([]);
      } catch (err) {
        console.error("Error fetching wishlists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlists();
  }, [currentUser, navigate, activeWishlist]);

  if (!currentUser) return null;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar: Wishlists */}
      <div className="w-full md:w-64 flex-shrink-0 border-r border-primary-border md:pr-6 min-h-[calc(100vh-10rem)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <Heart size={18} className="text-accent-pink" /> My Wishlists
          </h3>
          <button className="text-text-muted hover:text-white" title="Create new wishlist">
            <Plus size={18} />
          </button>
        </div>
        
        <ul className="space-y-2">
          {wishlists.map(list => (
            <li key={list.id}>
              <button 
                onClick={() => setActiveWishlist(list.id)}
                className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeWishlist === list.id ? 'bg-white/5 border border-primary-border text-white' : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <Folder size={16} className={activeWishlist === list.id ? 'text-accent-cyan' : ''} />
                  <span className="font-medium text-sm">{list.name}</span>
                </div>
                <div className="text-xs">
                  {list.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow">
        <div className="flex justify-between items-end mb-8 border-b border-primary-border pb-6">
          <div>
            <h2 className="text-3xl font-heading font-bold mb-2 flex items-center gap-3">
              {wishlists.find(w => w.id === activeWishlist)?.name}
              <span className="text-sm font-normal px-2 py-0.5 rounded-full bg-primary-surface border border-primary-border text-text-muted">
                {wishlists.find(w => w.id === activeWishlist)?.isPublic ? 'Public' : 'Private'}
              </span>
            </h2>
            <p className="text-text-muted text-sm">{savedStyles.length} items • Last updated today</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline py-2 px-4 text-sm">Make Public</button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-72 animate-pulse bg-primary-surface border border-primary-border rounded-xl"></div>)}
          </div>
        ) : savedStyles.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 mb-6 rounded-full bg-primary-surface flex items-center justify-center">
              <Heart size={48} className="text-primary-border relative group-hover:text-accent-pink transition-colors" />
            </div>
            <h3 className="text-2xl font-heading font-bold mb-2 text-white">Your wishlist is empty</h3>
            <p className="text-text-muted mb-8 max-w-md mx-auto">
              You haven't saved any styles to this wishlist yet. Browse the community and click the heart icon to save your favorites.
            </p>
            <Link to="/explore" className="btn-primary">Explore Styles</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedStyles.map(style => (
              <StyleCard key={style.id} style={style} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
