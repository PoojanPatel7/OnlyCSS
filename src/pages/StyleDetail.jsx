import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Eye, Code, Layers, Heart, Download, Share2, Bookmark, AlertTriangle, FileCode2, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StyleDetail = () => {
  const { id } = useParams();
  const { currentUser, userData } = useAuth();
  const [style, setStyle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('css');
  const [previewHtml, setPreviewHtml] = useState('');
  
  const hasLiked = currentUser && style?.likedBy?.includes(currentUser.uid);
  const hasSaved = currentUser && style?.savedBy?.includes(currentUser.uid);
  const hasDownloaded = currentUser && style?.downloadedBy?.includes(currentUser.uid);
  
  const [isFollowing, setIsFollowing] = useState(false);
  
  useEffect(() => {
    if (userData && style) {
      setIsFollowing(userData.following?.includes(style.authorId) || false);
    }
  }, [userData, style]);
  
  useEffect(() => {
    const fetchStyle = async () => {
      try {
        const docRef = doc(db, 'styles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStyle({ id: docSnap.id, ...data });
          
          if (currentUser) {
            const viewedBy = data.viewedBy || [];
            if (!viewedBy.includes(currentUser.uid)) {
              await updateDoc(docRef, {
                viewsCount: increment(1),
                viewedBy: arrayUnion(currentUser.uid)
              });
              setStyle(prev => ({ 
                ...prev, 
                viewsCount: (prev.viewsCount || 0) + 1,
                viewedBy: [...(prev.viewedBy || []), currentUser.uid]
              }));
            }
          } else {
            const viewedStyles = JSON.parse(sessionStorage.getItem('viewedStyles') || '[]');
            if (!viewedStyles.includes(id)) {
              await updateDoc(docRef, { viewsCount: increment(1) });
              viewedStyles.push(id);
              sessionStorage.setItem('viewedStyles', JSON.stringify(viewedStyles));
              setStyle(prev => ({ ...prev, viewsCount: (prev.viewsCount || 0) + 1 }));
            }
          }
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
      let combined = '';
      if (style.isCombined) {
        combined = style.combinedCode;
      } else {
        combined = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              *, *::before, *::after {
                box-sizing: border-box;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
              }
              body { 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh;
                background: transparent;
              }
              ${style.cssCode || ''}
            </style>
          </head>
          <body>
            ${style.htmlCode || ''}
            <script>${style.jsCode || ''}</script>
          </body>
          </html>
        `;
      }
      setPreviewHtml(combined);
      
      // Auto set tab if combined
      if (style.isCombined && activeTab !== 'combined') {
        setActiveTab('combined');
      }
    }
  }, [style]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text || '');
  };

  const handleLike = async () => {
    if (!currentUser) return alert('Please login to like this style.');
    if (!style) return;
    
    const isLiking = !hasLiked;
    try {
      setStyle(prev => ({ 
        ...prev, 
        likesCount: Math.max((prev.likesCount || 0) + (isLiking ? 1 : -1), 0),
        likedBy: isLiking 
          ? [...(prev.likedBy || []), currentUser.uid]
          : (prev.likedBy || []).filter(uid => uid !== currentUser.uid)
      }));
      await updateDoc(doc(db, 'styles', id), {
        likesCount: increment(isLiking ? 1 : -1),
        likedBy: isLiking ? arrayUnion(currentUser.uid) : arrayRemove(currentUser.uid)
      });
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleDownload = async () => {
    if (!style) return;
    try {
      if (currentUser) {
        const downloadedBy = style.downloadedBy || [];
        if (!downloadedBy.includes(currentUser.uid)) {
          setStyle(prev => ({ 
            ...prev, 
            downloadsCount: (prev.downloadsCount || 0) + 1,
            downloadedBy: [...(prev.downloadedBy || []), currentUser.uid]
          }));
          await updateDoc(doc(db, 'styles', id), {
            downloadsCount: increment(1),
            downloadedBy: arrayUnion(currentUser.uid)
          });
        }
      } else {
        const downloadedStyles = JSON.parse(sessionStorage.getItem('downloadedStyles') || '[]');
        if (!downloadedStyles.includes(id)) {
          setStyle(prev => ({ ...prev, downloadsCount: (prev.downloadsCount || 0) + 1 }));
          await updateDoc(doc(db, 'styles', id), { downloadsCount: increment(1) });
          downloadedStyles.push(id);
          sessionStorage.setItem('downloadedStyles', JSON.stringify(downloadedStyles));
        }
      }
      
      // Trigger download
      const content = style.isCombined ? style.combinedCode : `<style>${style.cssCode}</style>\n<body>${style.htmlCode}</body>\n<script>${style.jsCode}</script>`;
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${style.title.replace(/\s+/g, '-').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading:", err);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return alert('Please login to save this style.');
    if (!style) return;
    
    const isSaving = !hasSaved;
    try {
      setStyle(prev => ({ 
        ...prev, 
        savedBy: isSaving 
          ? [...(prev.savedBy || []), currentUser.uid]
          : (prev.savedBy || []).filter(uid => uid !== currentUser.uid)
      }));
      await updateDoc(doc(db, 'styles', id), {
        savedBy: isSaving ? arrayUnion(currentUser.uid) : arrayRemove(currentUser.uid)
      });
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return alert('Please login to follow this developer.');
    if (currentUser.uid === style.authorId) return alert('You cannot follow yourself.');
    
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    
    try {
      await updateDoc(doc(db, 'users', style.authorId), {
        followersCount: increment(newFollowingState ? 1 : -1),
        followers: newFollowingState ? arrayUnion(currentUser.uid) : arrayRemove(currentUser.uid)
      });
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        followingCount: increment(newFollowingState ? 1 : -1),
        following: newFollowingState ? arrayUnion(style.authorId) : arrayRemove(style.authorId)
      });
    } catch (err) {
      console.error("Error toggling follow:", err);
      setIsFollowing(!newFollowingState);
    }
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
        <Link to="/" className="hover:text-text-primary">Home</Link> <span className="mx-2">&gt;</span> 
        <Link to="/explore" className="hover:text-text-primary">{style.category}</Link> <span className="mx-2">&gt;</span> 
        <span className="text-text-primary">{style.title}</span>
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
                sandbox="allow-scripts allow-same-origin"
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
                <img src={style.authorPhotoURL} alt="Author" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-sm font-bold text-text-primary">
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
                    {style.authorRankTier || 'bronze'}
                  </span>
                </div>
              </div>
              
              {(!currentUser || currentUser.uid !== style.authorId) && (
                <button 
                  onClick={handleFollow}
                  className={`ml-auto flex items-center gap-1.5 py-1.5 px-4 text-xs font-bold transition-all rounded-full border ${isFollowing ? 'bg-text-primary/10 text-text-primary border-text-primary/20 hover:bg-text-primary/5' : 'bg-transparent text-accent-cyan border-accent-cyan hover:bg-accent-cyan/10'}`}
                >
                  {isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-primary-surface border border-primary-border text-xs text-accent-cyan">
                {style.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-primary-surface border border-primary-border text-xs">
                {style.isCombined ? 'Combined Code' : style.cssType}
              </span>
            </div>

            <p className="text-text-muted mb-8 leading-relaxed">
              {style.description || "No description provided."}
            </p>

            <div className="grid grid-cols-4 gap-4 mb-8 text-center border-y border-primary-border py-4">
              <div>
                <div className="text-xl font-bold text-text-primary mb-1">{style.likesCount || 0}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">Likes</div>
              </div>
              <div>
                <div className="text-xl font-bold text-text-primary mb-1">{style.downloadsCount || 0}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">Downs</div>
              </div>
              <div>
                <div className="text-xl font-bold text-text-primary mb-1">{style.viewsCount || 0}</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">Views</div>
              </div>
              <div>
                <div className="text-xl font-bold text-text-primary mb-1">0</div>
                <div className="text-xs text-text-muted uppercase tracking-wider">Comms</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={handleLike}
                className={`flex items-center justify-center gap-2 bg-primary-surface border ${hasLiked ? 'border-accent-pink text-accent-pink' : 'border-primary-border hover:border-accent-pink hover:text-accent-pink'} transition-all py-3 rounded-lg font-medium`}
              >
                <Heart size={18} fill={hasLiked ? "currentColor" : "none"} /> {hasLiked ? 'Liked' : 'Like'}
              </button>
              <button 
                onClick={handleSave}
                className={`flex items-center justify-center gap-2 bg-primary-surface border ${hasSaved ? 'border-accent-cyan text-accent-cyan' : 'border-primary-border hover:border-accent-cyan hover:text-accent-cyan'} transition-all py-3 rounded-lg font-medium`}
              >
                <Bookmark size={18} fill={hasSaved ? "currentColor" : "none"} /> {hasSaved ? 'Saved' : 'Save'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="flex items-center justify-center gap-2 btn-primary py-3 rounded-lg font-medium" 
                onClick={() => handleCopy(style.isCombined ? style.combinedCode : style.cssCode)}
              >
                <Code size={18} /> Copy {style.isCombined ? 'Code' : 'CSS'}
              </button>
              <button 
                onClick={handleDownload}
                className={`flex items-center justify-center gap-2 ${hasDownloaded ? 'bg-text-primary/80 text-black' : 'bg-white text-black hover:bg-gray-200'} transition-colors py-3 rounded-lg font-medium`}
              >
                <Download size={18} /> {hasDownloaded ? 'Downloaded' : 'Download'}
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
            <button className="text-sm text-text-muted hover:text-text-primary flex items-center gap-1"><Share2 size={14}/> Share</button>
            <button className="text-sm text-text-muted hover:text-status-danger flex items-center gap-1"><AlertTriangle size={14}/> Report</button>
          </div>
        </div>
        
        <div className="card overflow-hidden border border-primary-border">
          <div className="flex border-b border-primary-border bg-primary-surface overflow-x-auto custom-scrollbar">
            {style.isCombined ? (
              <button 
                onClick={() => setActiveTab('combined')}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'combined' ? 'text-accent-purple border-b-2 border-accent-purple bg-text-primary/5' : 'text-text-muted hover:text-text-primary'}`}
              >
                <FileCode2 size={16} /> Combined (HTML+CSS+JS)
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setActiveTab('html')}
                  className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'html' ? 'text-accent-pink border-b-2 border-accent-pink bg-text-primary/5' : 'text-text-muted hover:text-text-primary'}`}
                >
                  <Layers size={16} /> HTML
                </button>
                <button 
                  onClick={() => setActiveTab('css')}
                  className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'css' ? 'text-accent-cyan border-b-2 border-accent-cyan bg-text-primary/5' : 'text-text-muted hover:text-text-primary'}`}
                >
                  <Code size={16} /> CSS
                </button>
                {style.jsCode && (
                  <button 
                    onClick={() => setActiveTab('js')}
                    className={`px-6 py-4 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'js' ? 'text-amber-400 border-b-2 border-amber-400 bg-text-primary/5' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    <FileCode2 size={16} /> JavaScript
                  </button>
                )}
              </>
            )}
            
            <button 
              className="ml-auto px-6 py-4 text-sm font-medium text-text-muted hover:text-text-primary flex items-center gap-2 border-l border-primary-border whitespace-nowrap"
              onClick={() => handleCopy(
                activeTab === 'combined' ? style.combinedCode : 
                activeTab === 'css' ? style.cssCode : 
                activeTab === 'html' ? style.htmlCode : 
                style.jsCode
              )}
            >
              Copy Code
            </button>
          </div>
          
          <div className="bg-[#282c34] max-h-[600px] overflow-y-auto custom-scrollbar">
            {activeTab === 'combined' ? (
              <CodeMirror
                value={style.combinedCode || ''}
                theme={oneDark}
                extensions={[html()]}
                readOnly={true}
                basicSetup={{ lineNumbers: true, foldGutter: true }}
                className="text-sm p-4"
              />
            ) : activeTab === 'css' ? (
              <CodeMirror
                value={style.cssCode || ''}
                theme={oneDark}
                extensions={[css()]}
                readOnly={true}
                basicSetup={{ lineNumbers: true, foldGutter: true }}
                className="text-sm p-4"
              />
            ) : activeTab === 'html' ? (
              <CodeMirror
                value={style.htmlCode || ''}
                theme={oneDark}
                extensions={[html()]}
                readOnly={true}
                basicSetup={{ lineNumbers: true, foldGutter: true }}
                className="text-sm p-4"
              />
            ) : (
              <CodeMirror
                value={style.jsCode || ''}
                theme={oneDark}
                extensions={[javascript()]}
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
