import { Link, useLocation } from 'react-router-dom';
import { Layers, Heart, Activity, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardSidebar = () => {
  const { userData } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'My Styles', path: '/dashboard', icon: <Layers size={18} /> },
    { name: 'Wishlist', path: '/wishlist', icon: <Heart size={18} /> },
    { name: 'Analytics', path: '/analytics', icon: <Activity size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="w-full lg:w-72 flex-shrink-0 lg:pr-8 min-h-[calc(100vh-10rem)] flex flex-col gap-8">
      {/* User Card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/5 to-accent-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-accent-purple to-accent-cyan relative shrink-0">
            {userData?.photoURL ? (
              <img src={userData.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-[#050508]" />
            ) : (
              <div className="w-full h-full rounded-full bg-[#050508] border-2 border-[#050508] flex items-center justify-center text-lg font-bold text-white">
                {userData?.displayName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-white font-bold text-lg truncate group-hover:text-accent-cyan transition-colors">{userData?.displayName}</h3>
            <p className="text-white/40 text-sm truncate">@{userData?.username}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-4 backdrop-blur-xl shadow-2xl flex-grow">
        <h4 className="px-4 text-xs font-bold text-white/30 uppercase tracking-widest mb-4 mt-2">Menu</h4>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link 
                  to={item.path} 
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                    isActive 
                      ? 'text-white bg-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-purple to-accent-cyan rounded-r-full shadow-[0_0_10px_rgba(0,255,255,0.5)]"></div>
                  )}
                  <div className={`${isActive ? 'text-accent-cyan' : 'group-hover:text-white/80 transition-colors'}`}>
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default DashboardSidebar;
