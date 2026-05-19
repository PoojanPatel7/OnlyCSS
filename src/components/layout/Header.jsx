import { Link } from 'react-router-dom';
import { Search, Plus, Bell, LogOut, LayoutDashboard, Heart, User as UserIcon, Download, UserPlus, Heart as HeartIcon, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const Header = () => {
  const { currentUser, userData, logout } = useAuth();
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
  }, [currentUser]);

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
      case 'save': return <Bookmark size={14} className="text-white" />;
      case 'download': return <Download size={14} className="text-accent-cyan" />;
      case 'follow': return <UserPlus size={14} className="text-accent-purple" />;
      default: return <Bell size={14} className="text-text-muted" />;
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-border glass h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-accent-purple text-2xl font-heading font-bold transition-transform group-hover:scale-110">
              {'{'}
            </div>
            <span className="text-xl font-heading font-bold tracking-wide">
              Only<span className="text-text-muted font-normal">CSS</span>
            </span>
            <div className="text-accent-cyan text-2xl font-heading font-bold transition-transform group-hover:scale-110">
              {'}'}
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/explore" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
              Explore
            </Link>
            <Link to="/leaderboard" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
              Leaderboard
            </Link>
            {currentUser && (
              <Link to="/dashboard" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
            <div 
              className="relative py-2"
              onMouseEnter={() => setShowTagsDropdown(true)}
              onMouseLeave={() => setShowTagsDropdown(false)}
            >
              <button 
                className="text-sm font-medium text-text-muted hover:text-white transition-colors flex items-center gap-1"
              >
                Tags <span className="text-[10px]">▼</span>
              </button>
              
              {showTagsDropdown && (
                <div className="absolute top-full left-0 w-48 bg-primary-surface border border-primary-border rounded-xl shadow-2xl py-2 overflow-hidden z-50">
                  <div className="px-3 pb-2 mb-2 border-b border-primary-border text-xs font-bold text-text-muted uppercase tracking-wider">
                    Popular Tags
                  </div>
                  <Link to="/explore?tag=buttons" onClick={() => setShowTagsDropdown(false)} className="block px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                    #buttons
                  </Link>
                  <Link to="/explore?tag=cards" onClick={() => setShowTagsDropdown(false)} className="block px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                    #cards
                  </Link>
                  <Link to="/explore?tag=loaders" onClick={() => setShowTagsDropdown(false)} className="block px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                    #loaders
                  </Link>
                  <Link to="/explore?tag=text" onClick={() => setShowTagsDropdown(false)} className="block px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                    #text-effects
                  </Link>
                  <Link to="/explore?tag=forms" onClick={() => setShowTagsDropdown(false)} className="block px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                    #forms
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-text-muted hover:text-white transition-colors rounded-full hover:bg-white/5">
            <Search size={20} />
          </button>
          
          <Link to="/upload" className="hidden sm:flex items-center gap-2 btn-primary py-2 px-4 text-sm">
            <Plus size={16} />
            Upload
          </Link>
          
          <div className="h-6 w-px bg-primary-border mx-2 hidden sm:block"></div>
          
          {currentUser ? (
            <>
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={handleNotificationClick}
                  className="p-2 text-text-muted hover:text-white transition-colors rounded-full hover:bg-white/5 relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-primary-surface border border-primary-border rounded-xl shadow-2xl py-2 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-primary-border flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      {unreadCount > 0 && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-text-muted text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-3 border-b border-white/5 flex gap-3 hover:bg-white/5 transition-colors ${!n.read ? 'bg-accent-purple/10 border-l-2 border-l-accent-purple' : ''}`}>
                            <div className="relative shrink-0">
                              {n.sourceUserPhoto ? (
                                <img src={n.sourceUserPhoto} alt={n.sourceUserName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-xs font-bold text-white">
                                  {n.sourceUserName?.charAt(0) || 'U'}
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 bg-primary-surface rounded-full p-1 border border-primary-border">
                                {getNotificationIcon(n.type)}
                              </div>
                            </div>
                            <div className="text-xs text-text-muted flex-1">
                              {getNotificationText(n)}
                              <div className="text-[10px] text-text-muted/60 mt-1">
                                {n.createdAt?.toMillis ? new Date(n.createdAt.toMillis()).toLocaleString() : 'Just now'}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div 
                className="relative py-2"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <Link 
                  to={`/profile/${userData?.username}`}
                  className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-accent-purple transition-all"
                >
                  {userData?.photoURL && !imageError ? (
                    <img 
                      src={userData.photoURL} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full border border-primary-border object-cover" 
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-xs font-bold text-white">
                      {userData?.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                </Link>
                
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-0 w-56 bg-primary-surface border border-primary-border rounded-xl shadow-2xl py-2 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-primary-border mb-2">
                      <p className="text-sm text-white font-medium">{userData?.displayName || 'User'}</p>
                      <p className="text-xs text-text-muted">@{userData?.username || 'username'}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                        🥉 Bronze
                      </div>
                    </div>
                    
                    <Link to="/dashboard" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                      <LayoutDashboard size={16} /> My Dashboard
                    </Link>
                    <Link to={`/profile/${userData?.username}`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                      <UserIcon size={16} /> Public Profile
                    </Link>
                    <Link to="/wishlist" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                      <Heart size={16} /> My Wishlist
                    </Link>
                    
                    <div className="my-2 border-t border-primary-border"></div>
                    
                    <button onClick={() => { logout(); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-status-danger hover:bg-status-danger/10 transition-colors">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 p-1.5 pl-3 pr-4 rounded-full border border-primary-border hover:border-text-muted transition-colors bg-primary-surface cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-[10px] font-bold text-white">
                G
              </div>
              <span className="text-sm font-medium text-text-muted">Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
