import { Link, useLocation } from 'react-router-dom';
import { Search, Plus, Bell, LogOut, LayoutDashboard, Heart, User as UserIcon, Download, UserPlus, Heart as HeartIcon, Bookmark, Sparkles, ChevronDown, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const Header = () => {
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [imageError, setImageError] = useState(false);
  const notificationRef = useRef(null);

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
    <header className="sticky top-0 z-50 w-full bg-[#050508]/80 backdrop-blur-2xl border-b border-white/5 h-20 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Left Section: Logo & Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group relative">
            <div className="absolute -inset-4 bg-accent-purple/20 blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="text-transparent bg-clip-text bg-gradient-to-br from-accent-purple to-accent-cyan text-3xl font-heading font-black transition-transform group-hover:scale-110 group-hover:-rotate-6 duration-300">
              {'{'}
            </div>
            <span className="text-2xl font-heading font-black tracking-tight text-white drop-shadow-sm">
              Only<span className="text-text-primary/40 font-light">CSS</span>
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
          <button className="p-2.5 text-text-primary/50 hover:text-white transition-all duration-300 rounded-full hover:bg-white/5 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Search size={20} />
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
                                <img src={n.sourceUserPhoto} alt={n.sourceUserName} className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-white/30 transition-colors" />
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
                      <button onClick={() => { logout(); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-status-danger/70 hover:text-status-danger hover:bg-status-danger/10 rounded-xl transition-all">
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
  );
};

export default Header;
