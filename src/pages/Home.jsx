import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { 
  collection, query, orderBy, limit, getDocs, 
  getCountFromServer, getAggregateFromServer, sum 
} from 'firebase/firestore';
import StyleCard from '../components/StyleCard';
import { ArrowRight, Flame, Sparkles, Trophy, Zap, Layers, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  const [topRatedStyles, setTopRatedStyles] = useState([]);
  const [trendingStyles, setTrendingStyles] = useState([]);
  const [newStyles, setNewStyles] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [stats, setStats] = useState({ styles: 0, devs: 0, likes: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const stylesRef = collection(db, 'styles');
        const usersRef = collection(db, 'users');
        
        // 1. Fetch Real Stats via Firestore Aggregation
        const [stylesCountSnap, usersCountSnap, aggregateSnap] = await Promise.all([
          getCountFromServer(stylesRef),
          getCountFromServer(usersRef),
          getAggregateFromServer(stylesRef, {
            totalLikes: sum('likesCount'),
            totalViews: sum('viewsCount')
          }).catch(() => null) // Fallback if composite index is missing or error
        ]);

        setStats({
          styles: stylesCountSnap.data().count,
          devs: usersCountSnap.data().count,
          likes: aggregateSnap?.data().totalLikes || 0,
          views: aggregateSnap?.data().totalViews || 0
        });

        // 2. Fetch Top Rated Styles (Real Data instead of mocked "Featured")
        const topQ = query(stylesRef, orderBy('likesCount', 'desc'), limit(6));
        const topSnap = await getDocs(topQ);
        const topData = topSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTopRatedStyles(topData);
        
        // 3. Fetch Trending Styles
        const trendingQ = query(stylesRef, orderBy('viewsCount', 'desc'), limit(6));
        const trendingSnap = await getDocs(trendingQ);
        const trendingData = trendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrendingStyles(trendingData);
        
        // 4. Fetch Fresh Uploads
        const newQ = query(stylesRef, orderBy('publishedAt', 'desc'), limit(8));
        const newSnap = await getDocs(newQ);
        const newData = newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNewStyles(newData);

        // 5. Fetch Top Developers
        const usersQ = query(usersRef, orderBy('rankPoints', 'desc'), limit(10));
        const usersSnap = await getDocs(usersQ);
        setTopUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // 6. Dynamically extract real categories from fetched styles
        const allFetchedStyles = [...topData, ...trendingData, ...newData];
        const cats = new Set();
        allFetchedStyles.forEach(s => {
          if (s.category) cats.add(s.category);
        });
        setActiveCategories(Array.from(cats).filter(Boolean).slice(0, 10));
        
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="w-full bg-primary-bg min-h-screen selection:bg-accent-purple/30 selection:text-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-32 pb-40">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-purple/20 blur-[120px] animate-pulse-slow"></div>
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-accent-cyan/15 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent-pink/15 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-surface/50 border border-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(124,58,237,0.1)] text-sm text-text-primary mb-8 animate-slide-up hover:border-accent-purple/30 transition-colors">
            <Sparkles size={16} className="text-accent-cyan animate-pulse" /> 
            <span className="font-medium tracking-wide">100% Real Firebase Data Powered</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-heading font-extrabold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-text-primary to-text-muted animate-fade-in drop-shadow-sm">
            Elevate Your <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-pink animate-glow">
              Digital Canvas
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto animate-slide-up font-light leading-relaxed">
            The elite registry of modern CSS aesthetics. Discover, copy, and integrate breathtaking styles engineered by top developers.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <Link to="/explore" className="relative group px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan overflow-hidden shadow-[0_0_40px_rgba(124,58,237,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] transition-all hover:-translate-y-1">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-2">Explore Styles <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></span>
            </Link>
            <Link to="/upload" className="px-8 py-4 rounded-xl font-bold text-text-primary bg-primary-surface border border-primary-border hover:bg-white/5 hover:border-white/10 transition-all hover:-translate-y-1 flex items-center gap-2">
              <Code2 size={18} /> Submit Your CSS
            </Link>
          </div>
          
          {/* Real Live Stats */}
          <div className="mt-28 grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl bg-primary-surface/30 border border-white/5 backdrop-blur-xl animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="text-center group">
              <h3 className="text-4xl font-heading font-bold text-white mb-2 group-hover:text-accent-cyan transition-colors duration-300">
                {loading ? <span className="text-text-muted text-2xl">...</span> : formatNumber(stats.styles)}
              </h3>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Live Styles</p>
            </div>
            <div className="text-center group">
              <h3 className="text-4xl font-heading font-bold text-white mb-2 group-hover:text-accent-purple transition-colors duration-300">
                {loading ? <span className="text-text-muted text-2xl">...</span> : formatNumber(stats.devs)}
              </h3>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Creators</p>
            </div>
            <div className="text-center group">
              <h3 className="text-4xl font-heading font-bold text-white mb-2 group-hover:text-accent-pink transition-colors duration-300">
                {loading ? <span className="text-text-muted text-2xl">...</span> : formatNumber(stats.likes)}
              </h3>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Total Likes</p>
            </div>
            <div className="text-center group">
              <h3 className="text-4xl font-heading font-bold text-white mb-2 group-hover:text-status-success transition-colors duration-300">
                {loading ? <span className="text-text-muted text-2xl">...</span> : formatNumber(stats.views)}
              </h3>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Impressions</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TOP RATED SECTION ================= */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-border to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold flex items-center gap-3 text-white">
                <div className="p-2 bg-amber-500/10 rounded-lg"><Trophy className="text-amber-400" size={28} /></div>
                Hall of Fame
              </h2>
              <p className="text-text-muted mt-2 text-lg">The absolute highest rated styles by the community.</p>
            </div>
            <Link to="/explore?sort=top" className="group flex items-center gap-2 text-accent-cyan hover:text-white transition-colors font-medium">
              View Leaderboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-80 animate-pulse bg-primary-surface/50 border border-primary-border rounded-2xl"></div>)
            ) : topRatedStyles.length > 0 ? (
              topRatedStyles.map(style => (
                <div key={style.id} className="hover:-translate-y-2 transition-transform duration-300">
                  <StyleCard style={{...style, isFeatured: true}} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                <Trophy className="mx-auto text-text-muted mb-4 opacity-50" size={48} />
                <p className="text-text-muted text-lg">No ratings yet. Start exploring and liking!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= TRENDING SECTION ================= */}
      <section className="py-24 bg-primary-surface/30 border-y border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-status-danger/5 rounded-full blur-[100px] z-0 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold flex items-center gap-3 text-white">
                <div className="p-2 bg-status-danger/10 rounded-lg"><Flame className="text-status-danger" size={28} /></div>
                Trending Now
              </h2>
              <p className="text-text-muted mt-2 text-lg">Styles that are blowing up right now.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 animate-pulse bg-primary-surface/50 border border-primary-border rounded-2xl"></div>)
            ) : trendingStyles.length > 0 ? (
              trendingStyles.map(style => (
                <StyleCard key={style.id} style={style} />
              ))
            ) : (
               <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                 <Flame className="mx-auto text-text-muted mb-4 opacity-50" size={48} />
                 <p className="text-text-muted text-lg">Trends are formulating. Check back soon!</p>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= REAL CATEGORIES SHOWCASE ================= */}
      {activeCategories.length > 0 && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-10 text-white flex justify-center items-center gap-3">
              <Layers className="text-accent-purple" size={28} /> Active Categories
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {activeCategories.map(cat => (
                <Link 
                  key={cat} 
                  to={`/explore?category=${encodeURIComponent(cat)}`}
                  className="px-6 py-3 rounded-xl bg-primary-surface/80 border border-white/10 hover:border-accent-purple hover:bg-accent-purple/10 text-text-primary transition-all duration-300 hover:-translate-y-1 backdrop-blur-md shadow-sm"
                >
                  <span className="font-semibold">{cat}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= FRESH UPLOADS ================= */}
      <section className="py-24 relative bg-gradient-to-b from-transparent to-primary-surface/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold flex items-center gap-3 text-white">
                <div className="p-2 bg-accent-cyan/10 rounded-lg"><Zap className="text-accent-cyan" size={28} /></div>
                Fresh Drops
              </h2>
              <p className="text-text-muted mt-2 text-lg">The newest additions to our design catalog.</p>
            </div>
            <Link to="/explore?sort=newest" className="group flex items-center gap-2 text-accent-purple hover:text-white transition-colors font-medium">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-72 animate-pulse bg-primary-surface/50 border border-primary-border rounded-2xl"></div>)
            ) : newStyles.length > 0 ? (
              newStyles.map(style => (
                <StyleCard key={style.id} style={style} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                <Zap className="mx-auto text-text-muted mb-4 opacity-50" size={48} />
                <p className="text-text-muted text-lg">No new uploads yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= ELITE DEVELOPERS ================= */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-purple/5 via-primary-bg to-primary-bg z-0 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">Elite Creators</h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">The masterminds behind the most incredible CSS interfaces.</p>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar snap-x">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="min-w-[280px] h-64 animate-pulse bg-primary-surface/50 border border-primary-border rounded-2xl"></div>)
            ) : topUsers.length > 0 ? (
              topUsers.map((dev, i) => (
                <div key={i} className="min-w-[280px] snap-center bg-primary-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center hover:border-accent-purple/50 hover:bg-primary-surface/80 transition-all duration-300 group">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple to-accent-cyan rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {dev.photoURL ? (
                      <img src={dev.photoURL} alt={dev.displayName} className="relative w-24 h-24 mx-auto rounded-full object-cover border-4 border-primary-bg" />
                    ) : (
                      <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan p-1">
                        <div className="w-full h-full bg-primary-bg rounded-full flex items-center justify-center text-3xl font-bold text-white">
                          {dev.displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      </div>
                    )}
                    <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-primary-surface border-2 border-primary-bg flex items-center justify-center text-xl shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10">
                      {dev.rankTier === 'diamond' ? '💠' : dev.rankTier === 'platinum' ? '💎' : dev.rankTier === 'gold' ? '🥇' : '🥈'}
                    </div>
                  </div>
                  <h4 className="font-heading font-bold text-xl text-white mb-1 truncate">{dev.displayName}</h4>
                  <p className="text-sm text-accent-cyan mb-6 truncate">@{dev.username}</p>
                  
                  <div className="flex justify-between text-center bg-black/20 rounded-xl p-3 mb-6 border border-white/5">
                    <div className="w-1/2 border-r border-white/10">
                      <span className="text-white font-bold block text-lg">{dev.rankPoints || 0}</span>
                      <span className="text-xs text-text-muted uppercase">Points</span>
                    </div>
                    <div className="w-1/2">
                      <span className="text-white font-bold block text-lg">{dev.stylesCount || 0}</span>
                      <span className="text-xs text-text-muted uppercase">Styles</span>
                    </div>
                  </div>
                  
                  <Link to={`/profile/${dev.username}`} className="block w-full py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-accent-purple hover:border-accent-purple hover:text-white transition-all">
                    View Profile
                  </Link>
                </div>
              ))
            ) : (
              <div className="w-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                <p className="text-text-muted text-lg">No creators found. Start building your reputation!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= GRAND CTA ================= */}
      <section className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 via-primary-bg to-accent-cyan/20 z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[200px] bg-accent-purple/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-heading font-black mb-6 text-white drop-shadow-lg">
            {currentUser ? (
              <>Ready to share your next <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">Masterpiece?</span></>
            ) : (
              <>Ready to become a <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">CSS Legend?</span></>
            )}
          </h2>
          <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto font-light">
            {currentUser ? 
              "Head to your studio to manage your portfolio and climb the global ranks." : 
              "Join the elite community. Build your portfolio, share your masterpieces, and climb the global ranks."
            }
          </p>
          <Link to={currentUser ? "/dashboard" : "/auth"} className="inline-flex items-center gap-3 text-xl font-bold px-10 py-5 rounded-2xl text-white bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_50px_rgba(124,58,237,0.4)] hover:shadow-[0_0_80px_rgba(6,182,212,0.6)] hover:-translate-y-2 transition-all duration-300 group">
            {currentUser ? "Go to Creator Studio" : "Start Creating Now"} <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform"/>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
