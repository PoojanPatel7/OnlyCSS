import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import {
  collection, query, orderBy, limit, getDocs,
  getCountFromServer, getAggregateFromServer, sum
} from 'firebase/firestore';
import StyleCard from '../components/StyleCard';
import AdBlock from '../components/AdBlock';
import AdSlot from '../components/AdSlot';
import { ArrowRight, Flame, Sparkles, Trophy, Zap, Layers, Code2, Eye, Shield, Globe, Layout, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ScrollReveal3D = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        if (domRef.current) observer.unobserve(domRef.current);
      }
    }, { threshold: 0.1 });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={domRef} 
      className={className}
      style={{ 
        transition: `all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`, 
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
      }}
    >
      {children}
    </div>
  );
};

const codeToType = `.hero-magic-btn {
  background: linear-gradient(
    45deg, 
    #7c3aed, 
    #06b6d4
  );
  border-radius: 16px;
  color: white;
  padding: 1.25rem 2.5rem;
  font-weight: 800;
  letter-spacing: 1px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255,255,255,0.1);
}

.hero-magic-btn:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 20px 40px rgba(6, 182, 212, 0.5);
  border-color: rgba(255,255,255,0.5);
}`;

const HeroAnimation = () => {
  const [typedCode, setTypedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedCode(codeToType.slice(0, i));
      i++;
      if (i > codeToType.length + 30) { // pause at end before restarting
        i = 0;
      }
      setIsTyping(i <= codeToType.length);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const btnStyle = typedCode.length < 30 ? {
    backgroundColor: '#16161f',
    color: '#64748b',
    padding: '1.25rem 2.5rem',
    borderRadius: '16px',
    border: '1px dashed #2a2a3a'
  } : {};

  return (
    <div className="mt-20 max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 text-left animate-slide-up" style={{ animationDelay: '250ms' }}>
      {/* Code Editor */}
      <div className="flex-1 bg-[#0a0a0f] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="flex items-center px-4 py-3 bg-[#111118] border-b border-white/5">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <div className="ml-4 text-xs font-mono text-white/40 flex items-center gap-2">
            <Code2 size={12} /> button.css
          </div>
        </div>
        <div className="p-6 font-mono text-sm leading-relaxed h-[340px] overflow-hidden bg-[#050508] text-accent-cyan/90">
          <pre className="whitespace-pre-wrap">
            {typedCode}
            {isTyping && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1 align-middle"></span>}
          </pre>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex-1 bg-[#050508] rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.15)] flex flex-col relative min-h-[340px]">
        <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-text-primary/60 text-xs font-bold border border-white/10 z-10">
          <Eye size={12} className="text-accent-cyan" /> Live Render
        </div>
        <style>{typedCode}</style>
        <div className="flex-1 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]">
          <button className="hero-magic-btn text-lg cursor-pointer" style={btnStyle}>
            Hover Me ✨
          </button>
        </div>
      </div>
    </div>
  );
};

const FeaturesSection = () => (
  <section className="py-24 relative bg-[#050508] border-t border-white/5">
    <div className="container mx-auto px-4">
      <ScrollReveal3D className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 tracking-tight">Built for modern engineering</h2>
        <p className="text-text-muted text-lg max-w-2xl mx-auto font-normal">Everything you need to build stunning interfaces without the bloat of heavy UI libraries.</p>
      </ScrollReveal3D>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <ScrollReveal3D delay={100} className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-150"></div>
          <Zap className="text-accent-purple mb-6" size={32} />
          <h3 className="text-2xl font-bold text-white mb-3">Zero Dependencies</h3>
          <p className="text-text-muted text-lg">Every component is built with pure HTML and CSS. No massive JavaScript bundles, no complex setups. Just copy, paste, and ship.</p>
        </ScrollReveal3D>
        
        <ScrollReveal3D delay={200} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors">
          <Globe className="text-accent-cyan mb-6" size={32} />
          <h3 className="text-xl font-bold text-white mb-3">Framework Agnostic</h3>
          <p className="text-text-muted">Works with React, Vue, Svelte, or plain HTML. It's just CSS.</p>
        </ScrollReveal3D>

        <ScrollReveal3D delay={300} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors">
          <Shield className="text-status-success mb-6" size={32} />
          <h3 className="text-xl font-bold text-white mb-3">Accessible by Default</h3>
          <p className="text-text-muted">Built with semantic HTML tags and ARIA attributes for screen readers.</p>
        </ScrollReveal3D>

        <ScrollReveal3D delay={400} className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[80px] -ml-32 -mb-32 transition-transform group-hover:scale-150"></div>
          <Layout className="text-accent-cyan mb-6" size={32} />
          <h3 className="text-2xl font-bold text-white mb-3">Fully Responsive</h3>
          <p className="text-text-muted text-lg">Every design is crafted to look perfect on mobile devices, tablets, and massive ultra-wide monitors. Fluid typography and responsive grids built-in.</p>
        </ScrollReveal3D>
      </div>

      <div className="max-w-6xl mx-auto mt-12">
        <AdBlock 
          title="Level up with Pro" 
          description="Get access to exclusive premium components and advanced CSS techniques used by top tech companies." 
          ctaText="Unlock Pro"
          ctaLink="/pro"
        />
      </div>
    </div>
  </section>
);

const HowItWorksSection = () => (
  <section className="py-24 relative border-t border-white/5 bg-[#050508]">
    <div className="container mx-auto px-4">
      <ScrollReveal3D className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 tracking-tight">How it works</h2>
        <p className="text-text-muted text-lg max-w-2xl mx-auto font-normal">Three simple steps to upgrade your frontend.</p>
      </ScrollReveal3D>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <ScrollReveal3D delay={100} className="text-center relative">
           <div className="w-16 h-16 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 relative z-10">1</div>
           <div className="hidden md:block absolute top-8 left-1/2 w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent"></div>
           <h3 className="text-xl font-bold text-white mb-3">Discover</h3>
           <p className="text-text-muted">Browse thousands of community-built components.</p>
        </ScrollReveal3D>
        <ScrollReveal3D delay={200} className="text-center relative">
           <div className="w-16 h-16 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 relative z-10">2</div>
           <div className="hidden md:block absolute top-8 left-1/2 w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent"></div>
           <h3 className="text-xl font-bold text-white mb-3">Copy CSS</h3>
           <p className="text-text-muted">One click copies the pure HTML and CSS to your clipboard.</p>
        </ScrollReveal3D>
        <ScrollReveal3D delay={300} className="text-center relative">
           <div className="w-16 h-16 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 relative z-10">3</div>
           <h3 className="text-xl font-bold text-white mb-3">Ship It</h3>
           <p className="text-text-muted">Paste into your project and deploy beautiful UI instantly.</p>
        </ScrollReveal3D>
      </div>
    </div>
  </section>
);

const IdeasSection = () => {
  const ideas = [
    { title: "Glassmorphic Navbars", desc: "Sleek, blurred navigation bars for modern SaaS apps.", tags: ["Navigation", "Glassmorphism"] },
    { title: "Neuromorphic Buttons", desc: "Soft UI buttons that look extruded from the background.", tags: ["Buttons", "3D"] },
    { title: "Bento Box Grids", desc: "Trendy asymmetrical grid layouts for feature sections.", tags: ["Layout", "Grid"] },
    { title: "Animated Tooltips", desc: "Micro-interactions that bring your data to life.", tags: ["Micro-interactions"] },
    { title: "Cyberpunk Inputs", desc: "Neon glowing input fields for gaming or web3 interfaces.", tags: ["Forms", "Neon"] },
    { title: "Mega Menus", desc: "Complex dropdowns with embedded images and links.", tags: ["Navigation", "Complex"] }
  ];

  return (
    <section className="py-24 relative bg-primary-surface/20 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <ScrollReveal3D>
            <h2 className="text-3xl md:text-4xl font-heading font-bold flex items-center gap-3 text-white tracking-tight">
              <div className="p-2 bg-white/5 border border-white/10 rounded-lg"><Lightbulb className="text-amber-400" size={24} /></div>
              Project Ideas
            </h2>
            <p className="text-text-muted mt-2 text-lg font-normal">Need inspiration? Try building and submitting these highly requested components.</p>
          </ScrollReveal3D>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea, i) => (
            <ScrollReveal3D key={i} delay={i * 100}>
              <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 h-full flex flex-col hover:border-accent-purple/50 transition-colors group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-accent-purple transition-colors">{idea.title}</h3>
                  <ArrowRight size={20} className="text-text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-text-muted mb-6 flex-1">{idea.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/5 text-text-muted border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal3D>
          ))}
        </div>

        <div className="mt-16 max-w-5xl mx-auto">
           <AdBlock 
             variant="compact"
             title="Join our Weekly Design Challenges" 
             description="Compete with other developers to build the best CSS components and win exclusive prizes." 
             ctaText="View Challenges"
             ctaLink="/challenges"
           />
        </div>
      </div>
    </section>
  );
};

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
    <div className="w-full bg-[#050508] min-h-screen selection:bg-accent-purple/30 selection:text-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-32 pb-32">
        {/* Minimalist Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent-purple/10 blur-[120px] rounded-full pointer-events-none"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-text-primary mb-8 animate-fade-in transition-colors hover:bg-white/10">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></span>
            <span>v2.0 Database Live</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 tracking-tight text-white drop-shadow-sm animate-slide-up">
            Ship beautiful UI, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">faster.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto animate-slide-up font-normal leading-relaxed" style={{ animationDelay: '100ms' }}>
            A curated registry of high-quality, copy-paste CSS components. Built by the community, for developers who care about design.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/explore" className="px-8 py-4 rounded-xl font-bold text-primary-bg bg-white hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2">
              Explore Components <ArrowRight size={18} />
            </Link>
            <Link to="/upload" className="px-8 py-4 rounded-xl font-bold text-white glass-pro hover:bg-white/10 hover:-translate-y-1 transition-all flex items-center gap-2">
              <Code2 size={18} /> Submit Styles
            </Link>
          </div>

          <HeroAnimation />

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

      <FeaturesSection />
      <AdSlot format="horizontal" className="my-12" />
      <HowItWorksSection />
      <IdeasSection />

      {/* ================= TOP RATED SECTION ================= */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-border to-transparent"></div>
        <div className="container mx-auto px-4">
          <ScrollReveal3D>
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold flex items-center gap-3 text-white tracking-tight">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-lg"><Trophy className="text-text-primary" size={24} /></div>
                  Most Starred
                </h2>
                <p className="text-text-muted mt-2 text-lg font-normal">The highest rated components by the community.</p>
              </div>
              <Link to="/explore?sort=top" className="group flex items-center gap-2 text-accent-cyan hover:text-white transition-colors font-medium">
                View Leaderboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal3D>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-80 animate-pulse bg-primary-surface/50 border border-primary-border rounded-2xl"></div>)
            ) : topRatedStyles.length > 0 ? (
              topRatedStyles.map((style, i) => (
                <ScrollReveal3D key={style.id} delay={i * 100}>
                  <div className="hover:-translate-y-2 transition-transform duration-300 h-full">
                    <StyleCard style={{ ...style, isFeatured: true }} />
                  </div>
                </ScrollReveal3D>
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
          <ScrollReveal3D>
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold flex items-center gap-3 text-white tracking-tight">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-lg"><Flame className="text-text-primary" size={24} /></div>
                  Trending Components
                </h2>
                <p className="text-text-muted mt-2 text-lg font-normal">Styles that are gaining traction right now.</p>
              </div>
            </div>
          </ScrollReveal3D>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 animate-pulse bg-primary-surface/50 border border-primary-border rounded-2xl"></div>)
            ) : trendingStyles.length > 0 ? (
              trendingStyles.map((style, i) => (
                <ScrollReveal3D key={style.id} delay={i * 100}>
                  <StyleCard style={style} />
                </ScrollReveal3D>
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
          <ScrollReveal3D className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-heading font-semibold mb-8 text-white flex justify-center items-center gap-3 tracking-tight">
              <Layers className="text-text-primary/70" size={24} /> Popular Categories
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {activeCategories.map((cat, i) => (
                <Link
                  key={cat}
                  to={`/explore?category=${encodeURIComponent(cat)}`}
                  className="px-6 py-3 rounded-xl bg-primary-surface/80 border border-white/10 hover:border-accent-purple hover:bg-accent-purple/10 text-text-primary transition-all duration-300 hover:-translate-y-1 backdrop-blur-md shadow-sm"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <span className="font-semibold">{cat}</span>
                </Link>
              ))}
            </div>
          </ScrollReveal3D>
        </section>
      )}

      {/* ================= FRESH UPLOADS ================= */}
      <section className="py-24 relative bg-gradient-to-b from-transparent to-primary-surface/20">
        <div className="container mx-auto px-4">
          <ScrollReveal3D>
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold flex items-center gap-3 text-white tracking-tight">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-lg"><Zap className="text-text-primary" size={24} /></div>
                  Recently Added
                </h2>
                <p className="text-text-muted mt-2 text-lg font-normal">The latest additions to the registry.</p>
              </div>
              <Link to="/explore?sort=newest" className="group flex items-center gap-2 text-accent-purple hover:text-white transition-colors font-medium">
                View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal3D>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-72 animate-pulse bg-primary-surface/50 border border-primary-border rounded-2xl"></div>)
            ) : newStyles.length > 0 ? (
              newStyles.map((style, i) => (
                <ScrollReveal3D key={style.id} delay={i * 50}>
                  <StyleCard style={style} />
                </ScrollReveal3D>
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
          <ScrollReveal3D className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 tracking-tight">Top Contributors</h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto font-normal">The engineers powering the component ecosystem.</p>
          </ScrollReveal3D>

          <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar snap-x">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="min-w-[280px] h-64 animate-pulse bg-primary-surface/50 border border-primary-border rounded-2xl"></div>)
            ) : topUsers.length > 0 ? (
              topUsers.map((dev, i) => (
                <ScrollReveal3D key={dev.id || i} delay={i * 100} className="min-w-[280px] snap-center">
                  <div className="bg-primary-surface/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center hover:border-accent-purple/50 hover:bg-primary-surface/80 transition-all duration-300 group h-full">
                    <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple to-accent-cyan rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {dev.photoURL ? (
                      <img src={dev.photoURL} alt={dev.displayName} referrerPolicy="no-referrer" className="relative w-24 h-24 mx-auto rounded-full object-cover border-4 border-primary-bg" />
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
              </ScrollReveal3D>
              ))
            ) : (
              <div className="w-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                <p className="text-text-muted text-lg">No creators found. Start building your reputation!</p>
              </div>
            )}
          </div>
          
          <div className="mt-16">
            <AdBlock 
              title="Become a Sponsor" 
              description="Reach thousands of frontend developers and designers who visit OnlyCSS daily." 
              ctaText="See Sponsorship Options"
              ctaLink="/sponsor"
            />
          </div>
        </div>
      </section>

      {/* ================= GRAND CTA ================= */}
      <section className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 via-primary-bg to-accent-cyan/20 z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[200px] bg-accent-purple/20 blur-[120px] rounded-full pointer-events-none"></div>

        <ScrollReveal3D className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-heading font-black mb-6 text-white drop-shadow-lg">
            {currentUser ? (
              <>Ready to share your next <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">Masterpiece?</span></>
            ) : (
              <>Ready to become a <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">CSS Legend?</span></>
            )}
          </h2>
          <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto font-light">
            {currentUser ?
              "Head to your studio to manage your portfolio and climb the global ranks." :
              "Join the elite community. Build your portfolio, share your masterpieces, and climb the global ranks."
            }
          </p>
          <Link to={currentUser ? "/dashboard" : "/auth"} className="inline-flex items-center gap-3 text-xl font-bold px-10 py-5 rounded-2xl text-white bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_50px_rgba(124,58,237,0.4)] hover:shadow-[0_0_80px_rgba(6,182,212,0.6)] hover:-translate-y-2 transition-all duration-300 group">
            {currentUser ? "Go to Creator Studio" : "Start Creating Now"} <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </ScrollReveal3D>
      </section>
    </div>
  );
};

export default Home;
