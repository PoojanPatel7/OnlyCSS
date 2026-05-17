import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { Eye, Code, Layers, Heart, Download, Share2, Bookmark, AlertTriangle } from 'lucide-react';

const StyleDetail = () => {
  const { id } = useParams();
  const [style, setStyle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('css');
  const [previewHtml, setPreviewHtml] = useState('');
  
  useEffect(() => {
    const fetchStyle = async () => {
      try {
        const docRef = doc(db, 'styles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStyle({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching style:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStyle();
  }, [id]);

  useEffect(() => {
    if (style) {
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
            }
            ${style.cssCode}
          </style>
        </head>
        <body>${style.htmlCode}</body>
        </html>
      `;
      setPreviewHtml(combined);
    }
  }, [style]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-text-muted">Loading style...</div>;
  }

  if (!style) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl text-accent-purple mb-4">{'{ }'}</div>
        <h2 className="text-2xl font-heading font-bold mb-2">Style not found</h2>
        <p className="text-text-muted mb-6">This style may have been removed from the vault.</p>
        <Link to="/explore" className="btn-primary">Explore Styles</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-text-muted mb-6">
        <Link to="/" className="hover:text-white">Home</Link> <span className="mx-2">&gt;</span> 
        <Link to="/explore" className="hover:text-white">{style.category}</Link> <span className="mx-2">&gt;</span> 
        <span className="text-white">{style.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
        {/* Preview Panel */}
        <div className="lg:col-span-3">
          <div className="card flex flex-col h-[500px] border border-primary-border relative overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button className="w-8 h-8 rounded-full bg-[#0a0a0f] border border-primary-border hover:ring-2 hover:ring-white transition-all shadow-lg"></button>
              <button className="w-8 h-8 rounded-full bg-white border border-primary-border hover:ring-2 hover:ring-accent-purple transition-all shadow-lg"></button>
              <button className="w-8 h-8 rounded-full bg-checkered bg-[size:10px_10px] border border-primary-border hover:ring-2 hover:ring-accent-cyan transition-all shadow-lg" style={{ backgroundImage: 'linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee)', backgroundPosition: '0 0, 5px 5px' }}></button>
            </div>
            <div className="flex-grow bg-[#0a0a0f] flex items-center justify-center">
              <iframe 
                srcDoc={previewHtml} 
                title={style.title}
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-4">{style.title}</h1>
            <div className="flex items-center gap-3 mb-6">
              {style.authorPhotoURL ? (
                <img src={style.authorPhotoURL} alt="Author" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-sm font-bold text-white">
                  {style.authorDisplayName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <Link to={`/profile/${style.authorUsername}`} className="font-medium hover:text-accent-cyan transition-colors">
                  {style.authorDisplayName || style.authorUsername}
                </Link>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>@{style.authorUsername}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize">
                    {style.authorRankTier}
                  </span>
                </div>
              </div>
              <button className="ml-auto btn-outline py-1.5 px-4 text-xs">Follow</button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-primary-surface border border-primary-border text-xs text-accent-cyan">
                {style.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-primary-surface border border-primary-border text-xs">
                {style.cssType}
              </span>
            </div>

            <p className="text-text-muted mb-8 leading-relaxed">
              {style.description || "No description provided."}
            </p>

            <div className="grid grid-cols-4 gap-4 mb-8 text-center border-y border-primary-border py-4">
              <div>
                <div className="text-xl font-bold text-white mb-1">{style.likesCount}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">Likes</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white mb-1">{style.downloadsCount}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">Downs</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white mb-1">{style.viewsCount || 0}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">Views</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white mb-1">0</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">Comms</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button className="flex items-center justify-center gap-2 bg-primary-surface border border-primary-border hover:border-accent-pink hover:text-accent-pink transition-all py-3 rounded-lg font-medium">
                <Heart size={18} /> Like
              </button>
              <button className="flex items-center justify-center gap-2 bg-primary-surface border border-primary-border hover:border-accent-cyan hover:text-accent-cyan transition-all py-3 rounded-lg font-medium">
                <Bookmark size={18} /> Save
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 btn-primary py-3 rounded-lg font-medium" onClick={() => handleCopy(style.cssCode)}>
                <Code size={18} /> Copy CSS
              </button>
              <button className="flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 transition-colors py-3 rounded-lg font-medium">
                <Download size={18} /> Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Code className="text-accent-cyan" /> Implementation
          </h3>
          <div className="flex gap-2">
            <button className="text-sm text-text-muted hover:text-white flex items-center gap-1"><Share2 size={14}/> Share</button>
            <button className="text-sm text-text-muted hover:text-status-danger flex items-center gap-1"><AlertTriangle size={14}/> Report</button>
          </div>
        </div>
        
        <div className="card overflow-hidden border border-primary-border">
          <div className="flex border-b border-primary-border bg-primary-surface">
            <button 
              onClick={() => setActiveTab('css')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${activeTab === 'css' ? 'text-accent-cyan border-b-2 border-accent-cyan bg-white/5' : 'text-text-muted hover:text-white'}`}
            >
              <Code size={16} /> CSS
            </button>
            <button 
              onClick={() => setActiveTab('html')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${activeTab === 'html' ? 'text-accent-pink border-b-2 border-accent-pink bg-white/5' : 'text-text-muted hover:text-white'}`}
            >
              <Layers size={16} /> HTML
            </button>
            <button 
              className="ml-auto px-6 py-4 text-sm font-medium text-text-muted hover:text-white flex items-center gap-2 border-l border-primary-border"
              onClick={() => handleCopy(activeTab === 'css' ? style.cssCode : style.htmlCode)}
            >
              Copy Code
            </button>
          </div>
          
          <div className="bg-[#282c34]">
            {activeTab === 'css' ? (
              <CodeMirror
                value={style.cssCode}
                theme={oneDark}
                extensions={[css()]}
                readOnly={true}
                basicSetup={{ lineNumbers: true, foldGutter: true }}
                className="text-sm p-4"
              />
            ) : (
              <CodeMirror
                value={style.htmlCode}
                theme={oneDark}
                extensions={[html()]}
                readOnly={true}
                basicSetup={{ lineNumbers: true, foldGutter: true }}
                className="text-sm p-4"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleDetail;
