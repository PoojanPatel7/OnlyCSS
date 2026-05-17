import { Link } from 'react-router-dom';
import { Search, Plus, Bell, LogOut, LayoutDashboard, Heart, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Header = () => {
  const { currentUser, userData, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-border glass h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-accent-purple text-2xl font-heading font-bold transition-transform group-hover:scale-110">
              {'{'}
            </div>
            <span className="text-xl font-heading font-bold tracking-wide">
              CSS<span className="text-text-muted font-normal">Vault</span>
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
            <button className="text-sm font-medium text-text-muted hover:text-white transition-colors flex items-center gap-1">
              Tags <span className="text-[10px]">▼</span>
            </button>
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
              <button className="p-2 text-text-muted hover:text-white transition-colors rounded-full hover:bg-white/5 relative">
                <Bell size={20} />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-accent-purple transition-all"
                >
                  {userData?.photoURL ? (
                    <img src={userData.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-primary-border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-xs font-bold text-white">
                      {userData?.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-primary-surface border border-primary-border rounded-xl shadow-2xl py-2 overflow-hidden">
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
