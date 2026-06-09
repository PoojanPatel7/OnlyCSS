import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import StyleCard from '../components/StyleCard';
import { Filter, Grid, List, X, Check } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import AdSlot from '../components/AdSlot';

const Explore = () => {
  const location = useLocation();
  const [styles, setStyles] = useState([]);
  const [filteredStyles, setFilteredStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = sessionStorage.getItem('exploreFilters');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [tempCategories, setTempCategories] = useState([]);
  
  // Parse URL for initial tag
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tag = params.get('tag');
    if (tag) {
      // Find matching category (case-insensitive)
      const matchedCat = CATEGORIES.find(c => c.toLowerCase() === tag.toLowerCase());
      if (matchedCat && !selectedCategories.includes(matchedCat)) {
        const newCats = [matchedCat];
        setSelectedCategories(newCats);
        sessionStorage.setItem('exploreFilters', JSON.stringify(newCats));
      }
    }
  }, [location.search]);
  
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const q = query(collection(db, 'styles'), orderBy('publishedAt', 'desc'), limit(100));
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

  // Handle client-side filtering
  useEffect(() => {
    let result = [...styles];
    
    if (selectedCategories.length > 0) {
      result = result.filter(style => {
        if (style.categories && Array.isArray(style.categories)) {
          return style.categories.some(cat => selectedCategories.includes(cat));
        } else if (style.category) {
          return selectedCategories.includes(style.category);
        }
        return false;
      });
    }
    
    setFilteredStyles(result);
  }, [styles, selectedCategories]);

  const applyFilters = (cats) => {
    setSelectedCategories(cats);
    sessionStorage.setItem('exploreFilters', JSON.stringify(cats));
    setShowMobileFilters(false);
  };

  const FilterContent = ({ categories, setCats, onApply, isMobile }) => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-bold text-lg flex items-center gap-2">
          <Filter size={18} /> Filters
        </h3>
        <button 
          onClick={() => isMobile ? setCats([]) : applyFilters([])} 
          className="text-xs text-text-muted hover:text-text-primary"
        >
          Clear All
        </button>
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-text-primary mb-3">Sort By</h4>
        <select className="w-full bg-primary-surface border border-primary-border rounded-lg px-3 py-2 text-sm text-text-muted focus:border-accent-cyan focus:outline-none">
          <option>Newest First</option>
          <option>Most Liked</option>
          <option>Most Downloaded</option>
          <option>Trending</option>
        </select>
      </div>
      
      <div className="mb-6 flex-grow overflow-hidden flex flex-col">
        <h4 className="text-sm font-medium text-text-primary mb-3">Category</h4>
        <div className={`space-y-2 overflow-y-auto pr-2 custom-scrollbar ${isMobile ? 'flex-grow' : 'max-h-64'}`}>
          {CATEGORIES.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={categories.includes(cat)}
                onChange={(e) => {
                  let newCats;
                  if (e.target.checked) {
                    newCats = [...categories, cat];
                  } else {
                    newCats = categories.filter(c => c !== cat);
                  }
                  
                  if (isMobile) {
                    setCats(newCats);
                  } else {
                    applyFilters(newCats);
                  }
                }}
                className="w-4 h-4 rounded border-primary-border bg-primary-bg text-accent-purple focus:ring-accent-purple/50 focus:ring-offset-primary-bg" 
              />
              <span className="text-sm text-text-muted group-hover:text-text-primary transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>
      
      {isMobile && (
        <div className="mt-auto pt-4 border-t border-primary-border">
          <button 
            onClick={() => onApply(categories)}
            className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-cyan rounded-xl font-bold text-white flex items-center justify-center gap-2"
          >
            <Check size={18} /> Apply Filters
          </button>
        </div>
      )}
      
      {!isMobile && (
        <AdSlot format="rectangle" className="mt-8 shrink-0" />
      )}
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 relative">
      {/* Desktop Sidebar Filter */}
      <div className="hidden md:flex w-64 flex-shrink-0 border-r border-primary-border pr-6 min-h-[calc(100vh-10rem)] flex-col">
        <div className="sticky top-24 flex flex-col">
          <FilterContent 
            categories={selectedCategories} 
            setCats={setSelectedCategories} 
            isMobile={false} 
          />
        </div>
      </div>
      
      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-[85vw] max-w-sm bg-primary-bg h-full shadow-2xl flex flex-col animate-fade-in border-l border-white/10 relative">
            <button 
              onClick={() => setShowMobileFilters(false)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white bg-white/5 rounded-full z-10"
            >
              <X size={20} />
            </button>
            <div className="p-6 flex flex-col h-full overflow-hidden pt-14">
              <FilterContent 
                categories={tempCategories} 
                setCats={setTempCategories} 
                onApply={applyFilters}
                isMobile={true} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-grow w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-heading font-bold">Explore Styles</h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Filter Button */}
            <button 
              onClick={() => {
                setTempCategories(selectedCategories);
                setShowMobileFilters(true);
              }}
              className="md:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary-surface border border-primary-border rounded-xl text-sm font-bold text-white hover:bg-white/5"
            >
              <Filter size={16} className="text-accent-cyan" /> 
              Filters {selectedCategories.length > 0 && <span className="bg-accent-purple text-white text-[10px] px-1.5 py-0.5 rounded-full">{selectedCategories.length}</span>}
            </button>

            <span className="text-sm text-text-muted hidden sm:inline whitespace-nowrap">{filteredStyles.length} results</span>
            
            <div className="flex bg-primary-surface rounded-xl border border-primary-border p-1 shrink-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-text-primary'}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-text-primary'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Active Filters display on Mobile */}
        <div className="md:hidden flex flex-wrap gap-2 mb-6">
          {selectedCategories.map(cat => (
            <div key={cat} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-accent-purple/10 text-accent-purple border border-accent-purple/20 rounded-full">
              {cat}
              <button 
                onClick={() => applyFilters(selectedCategories.filter(c => c !== cat))}
                className="hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {selectedCategories.length > 0 && (
            <button onClick={() => applyFilters([])} className="text-xs text-text-muted hover:text-white px-2 py-1.5">
              Clear All
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card h-72 animate-pulse bg-primary-surface border border-primary-border"></div>
            ))}
          </div>
        ) : filteredStyles.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center justify-center">
            <div className="text-6xl text-text-muted mb-4">{'{ }'}</div>
            <h3 className="text-xl font-heading font-bold mb-2 text-text-primary">No styles found</h3>
            <p className="text-text-muted">Adjust your filters to discover more.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredStyles.map(style => (
              <StyleCard key={style.id} style={style} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
