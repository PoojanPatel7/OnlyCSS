import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import StyleCard from '../components/StyleCard';
import { Heart, Folder, Plus, Lock, Globe, Search, Filter } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';

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

    setLoading(true);
    let unsubscribe = null;

    try {

      
      const savedQ = query(
        collection(db, 'styles'), 
        where('savedBy', 'array-contains', currentUser.uid),
        where('status', '==', 'published')
      );
      
      unsubscribe = onSnapshot(savedQ, (snapshot) => {
        const stylesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSavedStyles(stylesData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching saved styles:", error);
        setLoading(false);
      });
    } catch (err) {
      console.error("Setup error:", err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, navigate, activeWishlist]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#050508] relative font-sans pb-20">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-accent-purple/5 blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-accent-cyan/5 blur-[150px]" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8 relative z-10">
        <DashboardSidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col lg:flex-row gap-8 min-w-0">
          
          {/* Folders Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-white/[0.02] border border-text-primary/5 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl flex-grow min-h-[300px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-bold text-text-primary tracking-tight flex items-center gap-2">
                  <Folder size={18} className="text-accent-pink" /> Collections
                </h3>
                <button className="w-8 h-8 rounded-full bg-text-primary/5 flex items-center justify-center text-text-primary/50 hover:text-text-primary hover:bg-text-primary/10 transition-colors" title="Create new collection">
                  <Plus size={16} />
                </button>
              </div>
              
              <ul className="space-y-2">
                {wishlists.map(list => (
                  <li key={list.id}>
                    <button 
                      onClick={() => setActiveWishlist(list.id)}
                      className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                        activeWishlist === list.id 
                          ? 'bg-text-primary/10 text-text-primary shadow-lg' 
                          : 'text-text-primary/50 hover:text-text-primary hover:bg-text-primary/5'
                      }`}
                    >
                      {activeWishlist === list.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-pink rounded-r-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
                      )}
                      <div className="flex items-center gap-3">
                        <Folder size={16} className={activeWishlist === list.id ? 'text-accent-pink' : 'text-text-primary/30 group-hover:text-text-primary/50'} />
                        <span className="font-medium text-sm truncate">{list.name}</span>
                      </div>
                      <div className="text-text-primary/30 group-hover:text-text-primary/50 transition-colors">
                        {list.isPublic ? <Globe size={14} /> : <Lock size={14} />}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Styles Grid */}
          <div className="flex-grow flex flex-col gap-6">
            <div className="bg-white/[0.02] border border-text-primary/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-3xl font-heading font-bold text-text-primary mb-2 flex items-center gap-3">
                  {wishlists.find(w => w.id === activeWishlist)?.name}
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-text-primary/5 border border-text-primary/10 text-text-primary/40 uppercase tracking-widest">
                    {wishlists.find(w => w.id === activeWishlist)?.isPublic ? 'Public' : 'Private'}
                  </span>
                </h2>
                <p className="text-text-primary/40">{savedStyles.length} items • Last updated recently</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button className="w-12 h-12 rounded-xl bg-text-primary/5 border border-text-primary/10 flex items-center justify-center text-text-primary/50 hover:text-text-primary hover:bg-text-primary/10 transition-colors tooltip-trigger" title="Search collection">
                  <Search size={18} />
                </button>
                <button className="w-12 h-12 rounded-xl bg-text-primary/5 border border-text-primary/10 flex items-center justify-center text-text-primary/50 hover:text-text-primary hover:bg-text-primary/10 transition-colors tooltip-trigger" title="Filter items">
                  <Filter size={18} />
                </button>
                <button className="btn-outline py-2 px-6 rounded-xl text-sm font-bold">Make Public</button>
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-80 animate-pulse bg-white/[0.02] border border-text-primary/5 rounded-[2rem] backdrop-blur-xl"></div>
                ))}
              </div>
            ) : savedStyles.length === 0 ? (
              <div className="bg-white/[0.02] border border-text-primary/5 rounded-[2rem] p-12 text-center backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 mb-6 rounded-full bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-accent-pink/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Heart size={40} className="text-accent-pink relative z-10" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3 text-text-primary">Your collection is empty</h3>
                <p className="text-text-primary/40 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                  You haven't saved any styles to this collection yet. Browse the community and click the heart icon to save your favorites.
                </p>
                <Link to="/explore" className="btn-primary py-3 px-8 rounded-xl font-bold inline-flex items-center gap-2">
                  <Search size={18} /> Discover Styles
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {savedStyles.map(style => (
                  <StyleCard key={style.id} style={style} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Wishlist;
