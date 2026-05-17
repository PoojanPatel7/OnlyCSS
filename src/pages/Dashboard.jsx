import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { LayoutDashboard, Heart, Settings, Plus, Eye, Download, Activity, Trash2, Edit, Layers } from 'lucide-react';

const Dashboard = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const fetchMyStyles = async () => {
      try {
        const q = query(
          collection(db, 'styles'), 
          where('authorId', '==', currentUser.uid),
          orderBy('publishedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setStyles(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching styles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyStyles();
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0 border-r border-primary-border lg:pr-6 min-h-[calc(100vh-10rem)]">
        <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
          <LayoutDashboard size={20} className="text-accent-cyan" /> Dashboard
        </h3>
        
        <div className="mb-8 p-4 bg-primary-surface rounded-xl border border-primary-border flex items-center gap-3">
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="Avatar" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-sm font-bold text-white">
              {userData?.displayName?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <p className="text-white font-medium text-sm">{userData?.displayName}</p>
            <p className="text-text-muted text-xs">@{userData?.username}</p>
          </div>
        </div>

        <ul className="space-y-1">
          <li>
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 bg-white/5 text-accent-cyan rounded-lg font-medium">
              <Layers size={18} /> My Styles
            </Link>
          </li>
          <li>
            <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Heart size={18} /> Wishlist
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Activity size={18} /> Analytics
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors mt-4">
              <Settings size={18} /> Settings
            </a>
          </li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-heading font-bold mb-2">My Styles</h2>
            <p className="text-text-muted">Manage your published and draft styles.</p>
          </div>
          <Link to="/upload" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Upload New
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="text-text-muted text-sm mb-1">Total Styles</div>
            <div className="text-2xl font-bold text-white">{styles.length}</div>
          </div>
          <div className="card p-4">
            <div className="text-text-muted text-sm mb-1">Total Views</div>
            <div className="text-2xl font-bold text-white">
              {styles.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0)}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-text-muted text-sm mb-1">Total Likes</div>
            <div className="text-2xl font-bold text-white">
              {styles.reduce((acc, curr) => acc + (curr.likesCount || 0), 0)}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-text-muted text-sm mb-1">Total Downloads</div>
            <div className="text-2xl font-bold text-white">
              {styles.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0)}
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-surface border-b border-primary-border">
                  <th className="py-3 px-6 text-text-muted font-medium text-sm">Style</th>
                  <th className="py-3 px-6 text-text-muted font-medium text-sm">Category</th>
                  <th className="py-3 px-6 text-text-muted font-medium text-sm">Stats</th>
                  <th className="py-3 px-6 text-text-muted font-medium text-sm">Status</th>
                  <th className="py-3 px-6 text-text-muted font-medium text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-border">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-text-muted">Loading your styles...</td>
                  </tr>
                ) : styles.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="text-4xl mb-3">🎨</div>
                      <p className="text-text-muted mb-4">You haven't uploaded any styles yet.</p>
                      <Link to="/upload" className="btn-outline">Upload Your First Style</Link>
                    </td>
                  </tr>
                ) : (
                  styles.map((style) => (
                    <tr key={style.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6">
                        <Link to={`/style/${style.id}`} className="font-medium text-white hover:text-accent-cyan transition-colors">
                          {style.title}
                        </Link>
                        <div className="text-xs text-text-muted mt-1">
                          {new Date(style.publishedAt?.toMillis() || Date.now()).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded bg-primary-surface border border-primary-border text-xs text-text-muted">
                          {style.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1"><Heart size={12} /> {style.likesCount || 0}</span>
                          <span className="flex items-center gap-1"><Eye size={12} /> {style.viewsCount || 0}</span>
                          <span className="flex items-center gap-1"><Download size={12} /> {style.downloadsCount || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${style.status === 'published' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}>
                          {style.status === 'published' ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-text-muted hover:text-accent-cyan hover:bg-primary-surface rounded transition-colors" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-text-muted hover:text-status-danger hover:bg-primary-surface rounded transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
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
    </div>
  );
};

export default Dashboard;
