import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import StyleCard from '../components/StyleCard';
import { ArrowRight, Star, TrendingUp, Sparkles, Trophy } from 'lucide-react';

const categories = [
  { name: "Animations", icon: "🎨" }, { name: "Buttons", icon: "🔘" },
  { name: "Typography", icon: "📝" }, { name: "Cards", icon: "🃏" },
  { name: "Gradients", icon: "🌈" }, { name: "Hover Effects", icon: "✨" },
  { name: "Loaders", icon: "📦" }, { name: "Navigation", icon: "🧭" },
  { name: "Glassmorphism", icon: "💎" }, { name: "Neumorphism", icon: "🌑" }
];

const Home = () => {
  const [featuredStyles, setFeaturedStyles] = useState([]);
  const [trendingStyles, setTrendingStyles] = useState([]);
  const [newStyles, setNewStyles] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const stylesRef = collection(db, 'styles');
        
        // Fetch Featured (mocking by just getting some styles if no featured flag exists)
        const featuredQ = query(stylesRef, orderBy('likesCount', 'desc'), limit(4));
        const featuredSnap = await getDocs(featuredQ);
        setFeaturedStyles(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Fetch Trending
        const trendingQ = query(stylesRef, orderBy('viewsCount', 'desc'), limit(6));
        const trendingSnap = await getDocs(trendingQ);
        setTrendingStyles(trendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Fetch New
        const newQ = query(stylesRef, orderBy('publishedAt', 'desc'), limit(8));
        const newSnap = await getDocs(newQ);
        setNewStyles(newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Top Developers
        const usersRef = collection(db, 'users');
        const usersQ = query(usersRef, orderBy('rankPoints', 'desc'), limit(10));
        const usersSnap = await getDocs(usersQ);
        setTopUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-primary-bg z-[-1]">
          {/* Animated CSS background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-accent-purple opacity-20 blur-[100px] animate-pulse"></div>
          <div className="absolute left-1/4 right-0 bottom-0 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-accent-cyan opacity-20 blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-text-muted mb-6">
            <Sparkles size={14} className="text-accent-pink" /> 
            <span>Welcome to the premier CSS community</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 tracking-tight text-white animate-fade-in">
            Where CSS <span className="text-gradient">Becomes Art</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto animate-slide-up">
            Discover, copy, and share beautiful CSS effects created by developers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Link to="/explore" className="btn-primary w-full sm:w-auto">Explore Styles</Link>
            <Link to="/upload" className="btn-outline w-full sm:w-auto">Upload Your CSS</Link>
          </div>
          
          {/* Stats */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-primary-border pt-10">
            <div className="text-center group">
              <h3 className="text-3xl font-heading font-bold text-white mb-1 group-hover:text-accent-purple transition-colors">12.4K+</h3>
              <p className="text-sm text-text-muted">Styles</p>
            </div>
            <div className="text-center group">
              <h3 className="text-3xl font-heading font-bold text-white mb-1 group-hover:text-accent-cyan transition-colors">3.2K+</h3>
              <p className="text-sm text-text-muted">Developers</p>
            </div>
            <div className="text-center group">
              <h3 className="text-3xl font-heading font-bold text-white mb-1 group-hover:text-accent-pink transition-colors">890K+</h3>
              <p className="text-sm text-text-muted">Downloads</p>
            </div>
            <div className="text-center group">
              <h3 className="text-3xl font-heading font-bold text-white mb-1 group-hover:text-status-success transition-colors">2.1M+</h3>
              <p className="text-sm text-text-muted">Likes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner 1 */}
      <div className="container mx-auto px-4 mb-16">
        <div className="ad-slot w-full h-[90px] max-w-[728px] mx-auto">
          <span className="ad-slot__label">Advertisement</span>
          <div className="text-text-muted text-sm text-center">728x90 Leaderboard Ad</div>
        </div>
      </div>

      {/* Featured Section */}
      <section className="py-16 bg-primary-surface/50 border-y border-primary-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
              <Star className="text-amber-500 fill-amber-500" /> Editor's Picks
            </h2>
          </div>
          
          {loading ? (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="min-w-[300px] h-72 animate-pulse bg-primary-surface border border-primary-border rounded-xl"></div>
              ))}
            </div>
          ) : featuredStyles.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x">
              {featuredStyles.map(style => (
                <div key={style.id} className="min-w-[320px] max-w-[350px] snap-start">
                  <StyleCard style={{...style, isFeatured: true}} />
                </div>
              ))}
            </div>
          ) : (
             <div className="text-text-muted py-8 text-center border border-dashed border-primary-border rounded-xl">
               No featured styles yet. Be the first to get featured!
             </div>
          )}
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
              <TrendingUp className="text-status-danger" /> Trending This Week
            </h2>
            <Link to="/explore?sort=trending" className="text-sm text-accent-cyan hover:text-white flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 animate-pulse bg-primary-surface border border-primary-border rounded-xl"></div>)
            ) : trendingStyles.length > 0 ? (
              trendingStyles.map(style => (
                <StyleCard key={style.id} style={style} />
              ))
            ) : (
              <div className="col-span-full text-text-muted py-12 text-center border border-dashed border-primary-border rounded-xl">
                Trending styles will appear here based on community engagement.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-16 bg-primary-surface/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-heading font-bold mb-8 text-center">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(cat => (
              <Link 
                key={cat.name} 
                to={`/explore?category=${cat.name}`}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary-surface border border-primary-border hover:border-accent-purple hover:bg-white/5 transition-all hover:-translate-y-1"
              >
                <span>{cat.icon}</span>
                <span className="font-medium text-sm text-text-muted hover:text-white">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh Uploads */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
              <span className="text-accent-cyan text-xl">🆕</span> Fresh Uploads
            </h2>
            <Link to="/explore?sort=newest" className="text-sm text-accent-cyan hover:text-white flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 animate-pulse bg-primary-surface border border-primary-border rounded-xl"></div>)
            ) : newStyles.length > 0 ? (
              newStyles.map(style => (
                <StyleCard key={style.id} style={style} />
              ))
            ) : (
              <div className="col-span-full text-text-muted py-12 text-center border border-dashed border-primary-border rounded-xl">
                No new uploads yet. Head over to Upload to share your work!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Developers */}
      <section className="py-16 border-t border-primary-border overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-surface/50 z-[-1]"></div>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
              <Trophy className="text-amber-400" /> Top Ranked Developers
            </h2>
            <Link to="/leaderboard" className="text-sm text-accent-cyan hover:text-white flex items-center gap-1 transition-colors">
              Full Leaderboard <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
            {topUsers.length > 0 ? (
              topUsers.map((dev, i) => (
                <div key={i} className="min-w-[250px] card p-6 text-center hover:border-accent-purple/50 transition-colors">
                  <div className="relative inline-block mb-4">
                    {dev.photoURL ? (
                      <img src={dev.photoURL} alt={dev.displayName} className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-primary-border" />
                    ) : (
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan p-1">
                        <div className="w-full h-full bg-primary-bg rounded-full flex items-center justify-center text-2xl font-bold">
                          {dev.displayName?.charAt(0) || 'U'}
                        </div>
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-bg flex items-center justify-center text-xl shadow-lg border border-primary-border">
                      {dev.rankTier === 'diamond' ? '💠' : dev.rankTier === 'platinum' ? '💎' : dev.rankTier === 'gold' ? '🥇' : '🥈'}
                    </div>
                  </div>
                  <h4 className="font-heading font-bold text-lg mb-1">{dev.displayName}</h4>
                  <p className="text-sm text-text-muted mb-4">@{dev.username}</p>
                  <div className="flex justify-between text-xs text-text-muted border-t border-primary-border pt-4 mb-4">
                    <div><span className="text-white font-bold block">{dev.rankPoints || 0}</span>Pts</div>
                    <div><span className="text-white font-bold block">{dev.stylesCount || 0}</span>Styles</div>
                  </div>
                  <button className="w-full btn-outline py-1.5 text-xs">Follow</button>
                </div>
              ))
            ) : (
              <div className="text-text-muted py-8 text-center border border-dashed border-primary-border rounded-xl w-full">
                Leaderboard is currently empty.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 via-primary-bg to-accent-cyan/20 z-[-1]"></div>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4 text-white">Ready to share your CSS mastery?</h2>
          <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
            Join the community, build your portfolio, and climb the global leaderboard.
          </p>
          <Link to="/auth" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Create Free Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
