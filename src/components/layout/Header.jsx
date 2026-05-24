import { Link, useLocation } from 'react-router-dom';
import { Search, Plus, Bell, LogOut, LayoutDashboard, Heart, User as UserIcon, Download, UserPlus, Heart as HeartIcon, Bookmark, Sparkles, ChevronDown, Settings as SettingsIcon, AlertTriangle, X, Hash, Code2, ArrowRight, Command } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';

const Header = () => {
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  
  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({ tags: [], styles: [], users: [] });
  const [allStyles, setAllStyles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const notificationRef = useRef(null);

  // Fetch search data pool on open
  useEffect(() => {
    if (showSearch && allStyles.length === 0) {
      const fetchSearchData = async () => {
        try {
          const stylesSnap = await getDocs(query(collection(db, 'styles'), orderBy('publishedAt', 'desc'), limit(100)));
          const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
          setAllStyles(stylesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          setAllUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch(e) { console.error(e); }
      };
      fetchSearchData();
    }
  }, [showSearch, allStyles.length]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ tags: [], styles: [], users: [] });
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      const lowerQ = searchQuery.toLowerCase();
      const ALL_TAGS = ["Animations", "Buttons", "Typography", "Cards", "Gradients", "Hover Effects", "Loaders", "Navigation", "Backgrounds", "Glassmorphism", "Neumorphism", "Shapes", "Responsive", "Cursors", "Forms", "Transforms"];
      
      const tags = ALL_TAGS.filter(t => t.toLowerCase().includes(lowerQ)).slice(0, 4);
      const styles = allStyles.filter(s => s.title?.toLowerCase().includes(lowerQ) || s.tags?.some(t => t.toLowerCase().includes(lowerQ))).slice(0, 4);
      const users = allUsers.filter(u => u.username?.toLowerCase().includes(lowerQ) || u.displayName?.toLowerCase().includes(lowerQ)).slice(0, 3);
      
      setSearchResults({ tags, styles, users });
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, allStyles, allUsers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        if (showNotifications) {
          setShowNotifications(false);
          markNotificationsAsRead();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, notifications]);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    // Check if user disabled in-app notifications
    if (userData?.preferences && userData.preferences.pushNotifications === false) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      notifs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });

    return () => unsubscribe();
  }, [currentUser, userData?.preferences?.pushNotifications]);

  const markNotificationsAsRead = () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length > 0) {
      unread.forEach(async (n) => {
        try {
          await updateDoc(doc(db, 'notifications', n.id), { read: true });
        } catch (e) {}
      });
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = () => {
    if (showNotifications) {
      markNotificationsAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <HeartIcon size={14} className="text-accent-pink" />;
      case 'save': return <Bookmark size={14} className="text-amber-400" />;
      case 'download': return <Download size={14} className="text-accent-cyan" />;
      case 'follow': return <UserPlus size={14} className="text-accent-purple" />;
      default: return <Bell size={14} className="text-text-primary" />;
    }
  };

  const getNotificationText = (n) => {
    switch (n.type) {
      case 'like': return <span><strong className="text-white">{n.sourceUserName}</strong> liked your style <strong>{n.styleTitle}</strong></span>;
      case 'save': return <span><strong className="text-white">{n.sourceUserName}</strong> saved your style <strong>{n.styleTitle}</strong></span>;
      case 'download': return <span><strong className="text-white">{n.sourceUserName}</strong> downloaded <strong>{n.styleTitle}</strong></span>;
      case 'follow': return <span><strong className="text-white">{n.sourceUserName}</strong> started following you</span>;
      default: return <span>New notification</span>;
    }
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`relative px-1 py-2 text-sm font-bold transition-all duration-300 group ${isActive ? 'text-white' : 'text-text-muted hover:text-white'}`}
      >
        {children}
        <span className={`absolute -bottom-5 left-0 w-full h-[2px] rounded-t-full transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-accent-purple to-accent-cyan opacity-100' : 'bg-white opacity-0 group-hover:opacity-30'}`}></span>
      </Link>
    );
  };

  return (
    <>
    <header className="fixed top-0 z-50 w-full bg-[#050508]/80 backdrop-blur-2xl border-b border-white/5 h-20 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Left Section: Logo & Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group relative">
            <div className="absolute -inset-4 bg-accent-purple/20 blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="text-transparent bg-clip-text bg-gradient-to-br from-accent-purple to-accent-cyan text-3xl font-heading font-black transition-transform group-hover:scale-110 group-hover:-rotate-6 duration-300">
              {'{'}
            </div>
            <span className="text-2xl font-heading font-black tracking-tight text-white drop-shadow-sm flex items-center">
              Only<span className="animate-rgb-lights ml-0.5">CSS</span>
            </span>
            <div className="text-transparent bg-clip-text bg-gradient-to-br from-accent-cyan to-accent-purple text-3xl font-heading font-black transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300">
              {'}'}
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
            <NavLink to="/explore">Explore</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>
            {currentUser && <NavLink to="/dashboard">Studio</NavLink>}
            
            <div 
              className="relative py-2 group"
              onMouseEnter={() => setShowTagsDropdown(true)}
              onMouseLeave={() => setShowTagsDropdown(false)}
            >
              <button 
                className="text-sm font-bold text-text-muted group-hover:text-white transition-colors flex items-center gap-1"
              >
                Tags <ChevronDown size={14} className={`transition-transform duration-300 ${showTagsDropdown ? 'rotate-180 text-accent-cyan' : ''}`} />
              </button>
              
              {showTagsDropdown && (
                <div className="absolute top-full pt-4 left-1/2 -translate-x-1/2 z-50">
                  <div className="w-56 bg-primary-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] py-3 overflow-hidden animate-fade-in relative">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent"></div>
                  <div className="px-5 pb-3 mb-2 border-b border-white/5 text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="text-accent-purple" /> Popular Tags
                  </div>
                  <div className="flex flex-col px-2">
                    {['buttons', 'cards', 'loaders', 'text-effects', 'forms'].map(tag => (
                      <Link key={tag} to={`/explore?tag=${tag}`} onClick={() => setShowTagsDropdown(false)} className="px-4 py-2 text-sm font-medium text-text-primary/70 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-2">
                        <span className="text-accent-cyan/50">#</span> {tag}
                      </Link>
                    ))}
                  </div>
                </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Section: Actions & Auth */}
        <div className="flex items-center gap-3 md:gap-5">
          <button 
            onClick={() => setShowSearch(true)}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <Search size={18} className="text-text-primary/60 group-hover:text-white transition-colors" />
            <span className="hidden sm:inline text-sm font-medium text-text-primary/60 group-hover:text-white transition-colors">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-white/50 border border-white/10">
              <Command size={10} /> K
            </kbd>
          </button>
          
          <div className="h-8 w-px bg-white/10 hidden sm:block mx-1"></div>
          
          <Link to="/upload" className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group hover:-translate-y-0.5">
            <Plus size={18} className="text-accent-cyan group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden lg:block">Upload</span>
          </Link>
          
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={handleNotificationClick}
                  className={`p-2.5 transition-all duration-300 rounded-full relative ${showNotifications || unreadCount > 0 ? 'text-white bg-white/10' : 'text-text-primary/50 hover:text-white hover:bg-white/5'}`}
                >
                  <Bell size={20} className={unreadCount > 0 ? 'animate-pulse' : ''} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-status-danger rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] border border-primary-bg"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full pt-4 z-50">
                    <div className="w-80 md:w-96 bg-primary-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 overflow-hidden animate-fade-in relative">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent"></div>
                    <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Notifications</h3>
                      {unreadCount > 0 && <span className="text-[10px] font-bold bg-status-danger/20 text-status-danger px-2.5 py-1 rounded-full">{unreadCount} NEW</span>}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-text-primary/40 text-sm flex flex-col items-center gap-3">
                          <Bell size={32} className="opacity-20" />
                          You're all caught up!
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-white/5 flex gap-4 hover:bg-white/5 transition-colors group ${!n.read ? 'bg-accent-purple/5 relative' : ''}`}>
                            {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-purple to-accent-cyan"></div>}
                            <div className="relative shrink-0 mt-1">
                              {n.sourceUserPhoto ? (
                                <img src={n.sourceUserPhoto} alt={n.sourceUserName} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-white/30 transition-colors" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-sm font-black text-white shadow-inner">
                                  {n.sourceUserName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 bg-primary-surface rounded-full p-1 border border-white/10 shadow-lg">
                                {getNotificationIcon(n.type)}
                              </div>
                            </div>
                            <div className="text-sm text-text-primary/70 flex-1 leading-relaxed">
                              {getNotificationText(n)}
                              <div className="text-[10px] font-bold text-text-primary/40 mt-1.5 uppercase tracking-wider">
                                {n.createdAt?.toMillis ? new Date(n.createdAt.toMillis()).toLocaleString() : 'Just now'}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  </div>
                )}
              </div>
              
              <div 
                className="relative py-2"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <button className="flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-accent-purple/50 transition-all duration-300 p-0.5">
                  {userData?.photoURL && !imageError ? (
                    <img 
                      src={userData.photoURL} 
                      alt="Avatar" 
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full border border-white/10 object-cover" 
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-sm font-black text-white shadow-inner">
                      {userData?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-full pt-2 z-50">
                    <div className="w-64 bg-primary-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 overflow-hidden animate-fade-in relative">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent"></div>
                    
                    <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                      <p className="text-base text-white font-black truncate">{userData?.displayName || 'Creator'}</p>
                      <p className="text-xs text-text-primary/50 font-medium truncate mb-3">@{userData?.username || 'username'}</p>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white shadow-inner">
                        {userData?.rankTier === 'diamond' ? '💠 Diamond' : 
                         userData?.rankTier === 'platinum' ? '💎 Platinum' : 
                         userData?.rankTier === 'gold' ? '🥇 Gold' : 
                         userData?.rankTier === 'silver' ? '🥈 Silver' : '🥉 Bronze'}
                        <span className="text-text-primary/40 ml-1 font-normal">•</span>
                        <span className="text-accent-cyan">{userData?.rankPoints || 0} pts</span>
                      </div>
                    </div>
                    
                    <div className="p-2 flex flex-col gap-1">
                      <Link to="/dashboard" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-primary/70 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <LayoutDashboard size={16} className="text-accent-purple" /> Creator Studio
                      </Link>
                      <Link to={`/profile/${userData?.username}`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-primary/70 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <UserIcon size={16} className="text-accent-cyan" /> Public Profile
                      </Link>
                      <Link to="/wishlist" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-primary/70 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Heart size={16} className="text-accent-pink" /> Saved Styles
                      </Link>
                      <Link to="/settings" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-text-primary/70 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <SettingsIcon size={16} className="text-text-primary/60" /> Settings
                      </Link>
                    </div>
                    
                    <div className="mx-4 my-1 border-t border-white/5"></div>
                    
                    <div className="p-2">
                      <button onClick={() => { setShowSignOutConfirm(true); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-status-danger/70 hover:text-status-danger hover:bg-status-danger/10 rounded-xl transition-all">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          ) : (
            <Link to="/auth" className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:-translate-y-0.5 transition-all duration-300 group">
              <UserIcon size={18} className="group-hover:scale-110 transition-transform" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
          <div className="absolute inset-0 bg-[#050508]/80 backdrop-blur-md animate-fade-in" onClick={() => setShowSearch(false)} />
          
          <div className="relative w-full max-w-2xl bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in flex flex-col max-h-[80vh]">
            
            {/* Top decorative gradient */}
            <div className="h-1 w-full bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-purple bg-[length:200%_auto] animate-gradient-x" />

            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-white/5">
              <Search size={24} className="text-accent-cyan ml-2 mr-4" />
              <input
                type="text"
                autoFocus
                placeholder="Search styles, tags, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder:text-text-primary/30"
              />
              <button 
                onClick={() => setShowSearch(false)}
                className="p-2 rounded-xl bg-white/5 text-text-primary/50 hover:text-white hover:bg-white/10 hover:rotate-90 transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {!searchQuery.trim() ? (
                <div className="px-6 py-16 text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-accent-purple/10 to-accent-cyan/10 border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                    <Search size={32} className="text-text-primary/30" />
                  </div>
                  <h3 className="text-xl font-heading font-black text-white mb-2">What are you looking for?</h3>
                  <p className="text-text-primary/50 text-sm max-w-sm mx-auto leading-relaxed">
                    Try searching for things like "Buttons", "Glassmorphism", or the name of your favorite creator.
                  </p>
                </div>
              ) : isSearching ? (
                <div className="px-6 py-16 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin mb-4" />
                  <p className="text-text-primary/50 text-sm font-medium">Searching the vault...</p>
                </div>
              ) : (searchResults.tags.length === 0 && searchResults.styles.length === 0 && searchResults.users.length === 0) ? (
                <div className="px-6 py-16 text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-3xl bg-status-danger/10 border border-status-danger/20 flex items-center justify-center mb-6 shadow-inner text-status-danger">
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-xl font-heading font-black text-white mb-2">No results found</h3>
                  <p className="text-text-primary/50 text-sm leading-relaxed">
                    We couldn't find anything matching "<span className="text-white font-bold">{searchQuery}</span>". Try a different keyword.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-6">
                  {/* Tags */}
                  {searchResults.tags.length > 0 && (
                    <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
                      <h4 className="text-[10px] font-black text-text-primary/40 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                        <Hash size={12} className="text-accent-purple" /> Related Tags
                      </h4>
                      <div className="flex flex-wrap gap-2 px-2">
                        {searchResults.tags.map(tag => (
                          <Link 
                            key={tag} 
                            to={`/explore?tag=${tag.toLowerCase()}`}
                            onClick={() => setShowSearch(false)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5 group"
                          >
                            <span className="text-accent-cyan group-hover:text-accent-purple transition-colors">#</span> {tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Styles */}
                  {searchResults.styles.length > 0 && (
                    <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
                      <h4 className="text-[10px] font-black text-text-primary/40 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                        <Code2 size={12} className="text-accent-cyan" /> Popular Styles
                      </h4>
                      <div className="space-y-1">
                        {searchResults.styles.map(style => (
                          <Link
                            key={style.id}
                            to={`/style/${style.id}`}
                            onClick={() => setShowSearch(false)}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#050508] border border-white/10 shrink-0 shadow-inner group-hover:border-accent-cyan/50 transition-colors relative">
                                {style.code ? (
                                  <>
                                    <div className="absolute inset-0 z-10"></div>
                                    <iframe
                                      srcDoc={`
                                        <html>
                                          <head><style>${style.code.css || ''}</style></head>
                                          <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:transparent;transform:scale(0.35);transform-origin:center;">
                                            ${style.code.html || ''}
                                          </body>
                                        </html>
                                      `}
                                      title={style.title}
                                      className="w-full h-full pointer-events-none"
                                      sandbox="allow-scripts"
                                    />
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-text-primary/20 bg-white/5"><Code2 size={20} /></div>
                                )}
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-white group-hover:text-accent-cyan transition-colors">{style.title}</h5>
                                <p className="text-xs text-text-primary/50 mt-1 font-medium">by <span className="text-white/70 group-hover:text-white">{style.authorName}</span></p>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              <ArrowRight size={14} className="text-accent-cyan" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users */}
                  {searchResults.users.length > 0 && (
                    <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                      <h4 className="text-[10px] font-black text-text-primary/40 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                        <UserIcon size={12} className="text-accent-pink" /> Creators
                      </h4>
                      <div className="space-y-1">
                        {searchResults.users.map(user => (
                          <Link
                            key={user.id}
                            to={`/profile/${user.username}`}
                            onClick={() => setShowSearch(false)}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-accent-purple/50 object-cover transition-colors" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-lg font-black text-white shadow-inner">
                                  {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                              )}
                              <div>
                                <h5 className="text-sm font-bold text-white group-hover:text-accent-purple transition-colors">{user.displayName}</h5>
                                <p className="text-xs text-text-primary/50 mt-1 font-medium">@{user.username}</p>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              <ArrowRight size={14} className="text-accent-purple" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] font-bold text-text-primary/40 uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <kbd className="w-5 h-5 flex items-center justify-center rounded bg-white/10 font-mono shadow-sm">esc</kbd> 
                  to close
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 h-5 flex items-center justify-center rounded bg-white/10 font-mono shadow-sm">enter</kbd> 
                  to select
                </span>
              </div>
              <div className="text-[10px] font-bold text-accent-cyan/60 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={10} className="text-accent-purple" /> Powered by OnlyCSS
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowSignOutConfirm(false)}
        >
          {/* Backdrop with fade in */}
          <div className="absolute inset-0 bg-[#050508]/80 backdrop-blur-md animate-fade-in" />

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[360px] animate-scale-in"
          >
            {/* Outer Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-status-danger/40 to-accent-purple/40 rounded-[2.5rem] blur-xl opacity-50 animate-pulse"></div>
            
            <div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
              
              {/* Decorative top border */}
              <div className="h-1 w-full bg-gradient-to-r from-status-danger via-accent-pink to-status-danger bg-[length:200%_auto] animate-gradient-x" />
              
              <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center">
                
                {/* Icon Container */}
                <div className="relative mb-8 group cursor-default">
                  <div className="absolute inset-0 bg-status-danger/20 rounded-full blur-xl group-hover:bg-status-danger/30 transition-colors duration-500"></div>
                  
                  {/* Rotating dashed ring */}
                  <div className="absolute inset-[-12px] rounded-full border border-status-danger/30 border-dashed animate-[spin_8s_linear_infinite]"></div>
                  
                  {/* Reverse rotating outer ring */}
                  <div className="absolute inset-[-24px] rounded-full border border-white/5 border-dotted animate-[spin_12s_linear_infinite_reverse]"></div>

                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-white/5 to-white/0 border border-white/10 flex items-center justify-center shadow-[inset_0_2px_20px_rgba(255,255,255,0.05)] backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                    <LogOut size={32} className="text-status-danger drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-transform duration-500 group-hover:-translate-x-1 group-hover:rotate-[-10deg]" />
                  </div>
                </div>

                <h3 className="text-2xl font-heading font-black text-white mb-2 tracking-tight">Signing Out?</h3>
                <p className="text-sm text-text-primary/60 leading-relaxed">
                  You are about to leave your creative studio. See you next time!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { logout(); setShowSignOutConfirm(false); }}
                  className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-status-danger to-red-600 hover:to-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] border border-red-400/20 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes animate-gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: animate-gradient-x 3s ease infinite;
        }
        @keyframes scale-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Header;
