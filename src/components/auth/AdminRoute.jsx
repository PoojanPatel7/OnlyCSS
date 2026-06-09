import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
  const { currentUser, userData } = useAuth();

  // If we haven't loaded the user or their profile yet, show a loader
  if (currentUser && !userData) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-accent-purple rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user is logged in, redirect to auth
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  // If user is logged in but not an admin/moderator, redirect to home
  if (userData && userData.role !== 'super_admin' && userData.role !== 'moderator') {
    return <Navigate to="/" />;
  }

  // User is an admin, allow access
  return <Outlet />;
};

export default AdminRoute;
