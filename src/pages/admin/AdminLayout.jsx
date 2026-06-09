import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Grid, Settings, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Styles Content', path: '/admin/styles', icon: Grid },
    // Only super_admin sees settings
    ...(userData?.role === 'super_admin' ? [{ name: 'Settings', path: '/admin/settings', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col md:flex-row">
      {/* Mobile Header/Nav */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0f]">
        <h2 className="text-lg font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          Admin Panel
        </h2>
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `p-2 rounded-lg transition-all ${isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`
              }
              title={item.name}
            >
              <item.icon className="w-5 h-5" />
            </NavLink>
          ))}
          <button onClick={() => navigate('/')} className="p-2 ml-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/10 flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <p className="text-sm text-white/50 mt-1 capitalize">{userData?.role.replace('_', ' ')}</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-mono text-sm uppercase tracking-wider ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-mono text-sm uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-mono text-sm uppercase tracking-wider text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
