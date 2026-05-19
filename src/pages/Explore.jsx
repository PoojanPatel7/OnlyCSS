import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import StyleCard from '../components/StyleCard';
import { Filter, Grid, List } from 'lucide-react';

const categories = [
  "Animations", "Buttons", "Typography", "Cards", "Gradients", 
  "Hover Effects", "Loaders", "Navigation", "Backgrounds", 
  "Glassmorphism", "Neumorphism", "Shapes", "Responsive", 
  "Cursors", "Forms", "Transforms"
];

const Explore = () => {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const q = query(collection(db, 'styles'), orderBy('publishedAt', 'desc'), limit(24));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStyles(fetched);
      } catch (err) {
        console.error("Error fetching styles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStyles();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filter */}
      <div className="w-full md:w-64 flex-shrink-0 border-r border-primary-border md:pr-6 min-h-[calc(100vh-10rem)]">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-lg flex items-center gap-2">
              <Filter size={18} /> Filters
            </h3>
            <button className="text-xs text-text-muted hover:text-text-primary">Clear All</button>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-primary mb-3">Sort By</h4>
            <select className="w-full bg-primary-surface border border-primary-border rounded-lg px-3 py-2 text-sm text-text-muted focus:border-accent-cyan focus:outline-none">
              <option>Most Liked</option>
              <option>Most Downloaded</option>
              <option>Trending</option>
              <option>Newest First</option>
            </select>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-primary mb-3">Category</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-primary-border bg-primary-bg text-accent-purple focus:ring-accent-purple/50 focus:ring-offset-primary-bg" />
                  <span className="text-sm text-text-muted group-hover:text-text-primary transition-colors">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-primary mb-3">Type</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-primary-border bg-primary-bg text-accent-purple" />
                <span className="text-sm text-text-muted group-hover:text-text-primary">Pure CSS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-primary-border bg-primary-bg text-accent-purple" />
                <span className="text-sm text-text-muted group-hover:text-text-primary">CSS + HTML</span>
              </label>
            </div>
          </div>
          
          {/* Ad Slot */}
          <div className="ad-slot w-full h-[250px] mt-8">
            <span className="ad-slot__label">Advertisement</span>
            <div className="text-text-muted text-sm text-center px-4">300x250 AdSpace</div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-heading font-bold">Explore Styles</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">{styles.length} results</span>
            <div className="flex bg-primary-surface rounded-lg border border-primary-border p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-border text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary-border text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card h-72 animate-pulse bg-primary-surface border border-primary-border"></div>
            ))}
          </div>
        ) : styles.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center justify-center">
            <div className="text-6xl text-text-muted mb-4">{'{ }'}</div>
            <h3 className="text-xl font-heading font-bold mb-2 text-text-primary">No styles found</h3>
            <p className="text-text-muted">Be the first to upload a style!</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {styles.map(style => (
              <StyleCard key={style.id} style={style} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
