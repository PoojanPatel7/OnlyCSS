import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Download, Eye, Bookmark, Copy } from 'lucide-react';

const StyleCard = ({ style }) => {
  const [previewHtml, setPreviewHtml] = useState('');
  
  useEffect(() => {
    const combined = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh;
            margin: 0;
            background: transparent;
            overflow: hidden;
          }
          ${style.cssCode}
        </style>
      </head>
      <body>${style.htmlCode}</body>
      </html>
    `;
    setPreviewHtml(combined);
  }, [style.cssCode, style.htmlCode]);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(style.cssCode);
  };

  return (
    <Link to={`/style/${style.id}`} className="card group block">
      <div className="h-48 bg-primary-bg flex items-center justify-center relative overflow-hidden border-b border-primary-border">
        {style.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-300 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10">
            FEATURED
          </div>
        )}
        <div className="absolute top-3 right-3 bg-primary-surface/80 backdrop-blur text-[10px] text-text-muted px-2 py-1 rounded-full border border-primary-border z-10">
          {style.category}
        </div>
        
        {/* Fullscreen icon on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 text-white transform scale-50 group-hover:scale-100 transition-transform duration-300">
            ▶
          </div>
        </div>
        
        <iframe 
          srcDoc={previewHtml}
          title={style.title}
          sandbox="allow-scripts"
          className="w-full h-full border-0 pointer-events-none"
          tabIndex="-1"
        />
      </div>
      
      <div className="p-4">
        <h4 className="font-heading font-semibold text-lg mb-2 group-hover:text-accent-cyan transition-colors truncate">
          {style.title}
        </h4>
        
        <div className="flex items-center gap-2 mb-4">
          {style.authorPhotoURL ? (
            <img src={style.authorPhotoURL} alt={style.authorUsername} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-[10px] font-bold text-white">
              {style.authorDisplayName?.charAt(0) || 'U'}
            </div>
          )}
          <span className="text-sm text-text-muted hover:text-white transition-colors truncate">
            @{style.authorUsername}
          </span>
          {style.authorRankTier && (
            <span className="text-[10px] px-1.5 rounded bg-primary-surface border border-primary-border text-amber-500 capitalize ml-auto">
              {style.authorRankTier}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {style.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] text-text-muted">#{tag}</span>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-sm text-text-muted border-t border-primary-border pt-3">
          <div className="flex gap-3">
            <span className="flex items-center gap-1 group/icon hover:text-accent-pink transition-colors">
              <Heart size={14} className="group-hover/icon:fill-accent-pink" /> {style.likesCount || 0}
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <Download size={14} /> {style.downloadsCount || 0}
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <Eye size={14} /> {style.viewsCount || 0}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-primary-surface hover:text-accent-cyan transition-colors"
              title="Copy CSS"
            >
              <Copy size={16} />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="p-1.5 rounded hover:bg-primary-surface hover:text-white transition-colors"
              title="Save to Wishlist"
            >
              <Bookmark size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StyleCard;
