import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { Plus, Eye, Download, Heart, Edit, Trash2, Code, RefreshCw, Trophy, Zap, Shield, ChevronRight } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import StyleCard from '../components/StyleCard';
import { recalculateAllUserPoints } from '../utils/points';

const Dashboard = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [styles, setStyles] = useState([]);
  const [userCache, setUserCache] = useState({});
  const cacheRef = useRef({});
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const q = query(
      collection(db, 'styles'), 
      where('authorId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const stylesData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort locally to avoid requiring a composite index in Firestore
      stylesData.sort((a, b) => (b.publishedAt?.toMillis() || 0) - (a.publishedAt?.toMillis() || 0));
      setStyles(stylesData);
      setLoading(false);
      
      const uids = new Set();
      stylesData.forEach(s => {
         (s.likedBy || []).forEach(uid => uids.add(uid));
         (s.viewedBy || []).forEach(uid => uids.add(uid));
         (s.downloadedBy || []).forEach(uid => uids.add(uid));
         (s.savedBy || []).forEach(uid => uids.add(uid));
      });
      
      Array.from(uids).forEach(uid => {
        if (!cacheRef.current[uid]) {
          cacheRef.current[uid] = '...'; // mark as fetching
          setUserCache(prev => ({ ...prev, [uid]: '...' }));
          
          getDoc(doc(db, 'users', uid)).then(snap => {
            const name = snap.exists() ? (snap.data().displayName || snap.data().username || 'Unknown') : 'Unknown';
            cacheRef.current[uid] = name;
            setUserCache(prev => ({ ...prev, [uid]: name }));
          }).catch(err => {
            cacheRef.current[uid] = 'Unknown';
            setUserCache(prev => ({ ...prev, [uid]: 'Unknown' }));
          });
        }
      });
    }, (err) => {
      console.error("Error fetching live styles:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const totalViews = styles.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);
  const totalLikes = styles.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);
  const totalDownloads = styles.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);
  const userRank = userData?.rankTier || 'Bronze';
  const userPoints = userData?.rankPoints || 0;

  return (
    <div className="min-h-screen bg-[#050508] relative font-sans pb-20 overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-accent-purple/10 via-transparent to-transparent pointer-events-none opacity-50 z-0"></div>
      <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-accent-purple/5 blur-[150px] animate-pulse-slow pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-accent-cyan/5 blur-[150px] pointer-events-none z-0" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8 relative z-10">
        <DashboardSidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-8 min-w-0">
          
          {/* Welcome Hero Panel */}
          <div className="relative bg-white/[0.02] border border-text-primary/5 rounded-[2rem] p-8 sm:p-10 backdrop-blur-xl shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-text-primary/5 border border-text-primary/10 text-xs font-bold text-text-primary/70 mb-4">
                  <Shield size={14} className="text-accent-cyan" /> Creator Dashboard
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-text-primary/60 mb-3">
                  Welcome back,<br/>{userData?.displayName || 'Creator'}
                </h2>
                <p className="text-text-primary/50 max-w-md text-lg">
                  Manage your styles, track your influence, and climb the global leaderboards.
                </p>
              </div>

              {/* Rank Badge */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-text-primary/5 to-white/[0.01] border border-text-primary/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] shrink-0 min-w-[180px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan p-[2px] mb-3 relative group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-shadow">
                  <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
                    <Trophy size={28} className="text-amber-400" />
                  </div>
                </div>
                <div className="text-2xl font-black text-text-primary capitalize tracking-wide">{userRank}</div>
                <div className="text-accent-cyan font-bold flex items-center gap-1 mt-1">
                  <Zap size={14} /> {userPoints.toLocaleString()} PTS
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-2xl font-heading font-bold text-text-primary flex items-center gap-2">
              <Code size={24} className="text-accent-purple" /> Published Styles
            </h3>
            <Link to="/upload" className="w-full sm:w-auto bg-gradient-to-r from-accent-purple to-accent-cyan text-text-primary py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] transition-all">
              <Plus size={18} /> Create New Style
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Styles', value: styles.length, icon: <Code size={20} />, color: 'from-blue-500/20 to-cyan-500/20', text: 'text-cyan-400' },
              { label: 'Total Views', value: totalViews, icon: <Eye size={20} />, color: 'from-emerald-500/20 to-green-500/20', text: 'text-emerald-400' },
              { label: 'Total Likes', value: totalLikes, icon: <Heart size={20} />, color: 'from-pink-500/20 to-rose-500/20', text: 'text-pink-400' },
              { label: 'Downloads', value: totalDownloads, icon: <Download size={20} />, color: 'from-purple-500/20 to-indigo-500/20', text: 'text-purple-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.02] border border-text-primary/5 rounded-[1.5rem] p-6 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:bg-white/[0.04] transition-colors cursor-default">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
                
                <div className={`w-10 h-10 rounded-xl bg-text-primary/5 border border-text-primary/10 flex items-center justify-center mb-4 ${stat.text}`}>
                  {stat.icon}
                </div>
                <div className="text-text-primary/40 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                <div className="text-3xl font-black text-text-primary tracking-tight">{stat.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
          
          {/* Grid of Styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full border-4 border-text-primary/10 border-t-accent-cyan animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Loading Studio...</h3>
                <span className="text-text-primary/40">Fetching your creative assets</span>
              </div>
            ) : styles.length === 0 ? (
              <div className="col-span-full bg-gradient-to-b from-white/[0.05] to-transparent border border-text-primary/10 rounded-[2rem] p-16 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-accent-purple/20 to-accent-cyan/20 border border-text-primary/10 mx-auto flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-accent-cyan/20 blur-[20px] rounded-full animate-pulse-slow"></div>
                  <span className="text-5xl relative z-10">✨</span>
                </div>
                <h3 className="text-3xl font-heading font-black text-text-primary mb-3">Your Canvas is Empty</h3>
                <p className="text-text-primary/50 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                  Every great creator starts somewhere. Upload your very first CSS component and share your magic with the world.
                </p>
                <Link to="/upload" className="btn-primary py-4 px-10 rounded-2xl inline-flex items-center gap-3 text-lg font-bold shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform">
                  <Plus size={24} /> Create Magic Now
                </Link>
              </div>
            ) : (
              styles.map((style) => (
                <StyleCard key={style.id} style={style} authorOverride={userData} />
              ))
            )}
          </div>

          {/* Admin Tools Section */}
          {currentUser && (
            <div className="mt-8 pt-8 border-t border-text-primary/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.01] border border-text-primary/5">
                <div>
                  <h4 className="text-text-primary font-bold mb-1 flex items-center gap-2"><Shield size={16} className="text-text-muted"/> System Tools</h4>
                  <p className="text-text-primary/40 text-sm">Manually synchronize the global database points and ranks.</p>
                </div>
                <button 
                  onClick={async () => {
                    setIsSyncing(true);
                    try {
                      const count = await recalculateAllUserPoints();
                      alert(`Successfully synced points for ${count} users based on their existing followers and styles!`);
                      window.location.reload();
                    } catch(e) {
                      alert("Error syncing points: " + e.message);
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-text-primary/5 border border-text-primary/10 hover:bg-text-primary/10 hover:border-text-primary/20 text-text-primary/60 hover:text-text-primary transition-all font-bold text-sm w-full sm:w-auto"
                >
                  <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                  {isSyncing ? "Syncing..." : "Sync Historical Points"}
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
