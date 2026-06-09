import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Trash2, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminStyles = () => {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'styles'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stylesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStyles(stylesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteStyle = async (styleId, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'styles', styleId));
      } catch (error) {
        console.error("Error deleting style:", error);
        alert("Failed to delete style.");
      }
    }
  };

  const filteredStyles = styles.filter(style => 
    style.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    style.authorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Moderation</h1>
          <p className="text-white/50 font-mono text-sm uppercase tracking-wider">Manage Uploaded Styles</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search styles or authors..."
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
                <th className="px-6 py-4">Style</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Likes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-white/50">
                    <div className="inline-block w-6 h-6 border-2 border-white/10 border-t-accent-purple rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredStyles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-white/50">
                    No styles found
                  </td>
                </tr>
              ) : (
                filteredStyles.map((style) => (
                  <tr key={style.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white line-clamp-1">{style.title}</div>
                      <div className="text-white/40 font-mono text-xs mt-0.5">
                        {new Date(style.createdAt?.seconds * 1000).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={style.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${style.authorId}`} 
                          alt="" 
                          className="w-6 h-6 rounded-full bg-white/10"
                        />
                        <span>{style.authorName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-white/5 text-white/70 border border-white/10">
                        {style.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {style.likes || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/style/${style.id}`}
                          target="_blank"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                          title="View Style"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        
                        <button 
                          onClick={() => handleDeleteStyle(style.id, style.title)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Style"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
};

export default AdminStyles;
