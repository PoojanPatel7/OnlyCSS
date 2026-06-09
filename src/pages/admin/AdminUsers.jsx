import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Shield, ShieldAlert, Ban, CheckCircle, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminUsers = () => {
  const { userData: currentUserData } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleBan = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isBanned: !currentStatus
      });
    } catch (error) {
      console.error("Error toggling ban status:", error);
      alert("Failed to update user status.");
    }
  };

  const handlePromoteToModerator = async (userId) => {
    if (currentUserData.role !== 'super_admin') return;
    
    if (window.confirm("Are you sure you want to promote this user to Moderator?")) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          role: 'moderator'
        });
      } catch (error) {
        console.error("Error promoting user:", error);
        alert("Failed to promote user.");
      }
    }
  };

  const handleDemoteToUser = async (userId) => {
    if (currentUserData.role !== 'super_admin') return;
    
    if (window.confirm("Are you sure you want to demote this Moderator back to User?")) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          role: 'user'
        });
      } catch (error) {
        console.error("Error demoting user:", error);
        alert("Failed to demote user.");
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-white/50 font-mono text-sm uppercase tracking-wider">Manage Platform Users</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
          />
        </div>
      </div>

      <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 font-mono uppercase tracking-wider text-xs border-b border-white/10">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-white/50">
                    <div className="inline-block w-6 h-6 border-2 border-white/10 border-t-accent-purple rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-white/50">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                          alt="" 
                          className="w-10 h-10 rounded-full bg-white/10"
                        />
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            {user.displayName || 'Unknown User'}
                            {user.role === 'super_admin' && <ShieldAlert className="w-3 h-3 text-red-400" />}
                            {user.role === 'moderator' && <Shield className="w-3 h-3 text-accent-blue" />}
                          </div>
                          <div className="text-white/40 font-mono text-xs mt-0.5">
                            @{user.username || user.id.slice(0, 8)} • {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider border ${
                        user.role === 'super_admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        user.role === 'moderator' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-white/5 text-white/50 border-white/10'
                      }`}>
                        {user.role?.replace('_', ' ') || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1.5 text-red-400 text-xs font-mono uppercase tracking-wider">
                          <Ban className="w-3.5 h-3.5" /> Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.username && (
                          <Link 
                            to={`/profile/${user.username}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            title="View Profile"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        
                        {/* Prevent acting on yourself or super admins */}
                        {user.id !== currentUserData.uid && user.role !== 'super_admin' && (
                          <>
                            {/* Role Management (Super Admin Only) */}
                            {currentUserData.role === 'super_admin' && (
                              user.role === 'moderator' ? (
                                <button 
                                  onClick={() => handleDemoteToUser(user.id)}
                                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider"
                                >
                                  Demote
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handlePromoteToModerator(user.id)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors text-xs font-mono uppercase tracking-wider"
                                >
                                  Promote
                                </button>
                              )
                            )}

                            {/* Ban/Unban */}
                            <button 
                              onClick={() => handleToggleBan(user.id, user.isBanned)}
                              className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-mono uppercase tracking-wider ${
                                user.isBanned 
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                              }`}
                            >
                              {user.isBanned ? 'Unban' : 'Ban'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
