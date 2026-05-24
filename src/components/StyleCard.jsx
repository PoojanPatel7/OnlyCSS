import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Download, Eye, Bookmark, Copy, Trash2, Edit3, X, AlertTriangle, Code, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { createNotification } from '../utils/notifications';
import { updateUserPoints, POINTS } from '../utils/points';

const StyleCard = ({ style, isPreview = false, className = "", authorOverride = null }) => {
  const { currentUser } = useAuth();
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [authorStats, setAuthorStats] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);

  useEffect(() => {
    if (!authorOverride && !authorData && style.authorId) {
      const fetchAuthor = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', style.authorId));
          if (userDoc.exists()) {
            setAuthorData(userDoc.data());
          }
        } catch (err) {
          console.error("Error fetching author data on mount:", err);
        }
      };
      fetchAuthor();
    }
  }, [style.authorId, authorOverride]);

  // Determine current author display variables
  const displayPhoto = authorOverride?.photoURL || authorData?.photoURL || style.authorPhotoURL;
  const displayName = authorOverride?.displayName || authorData?.displayName || style.authorDisplayName || style.authorUsername;
  const displayUsername = authorOverride?.username || authorData?.username || style.authorUsername;
  const displayRank = authorOverride?.rankTier || authorData?.rankTier || style.authorRankTier;

  const handleAuthorClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAuthorModal(true);

    if (!authorStats) {
      setIsLoadingAuthor(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', style.authorId));
        if (userDoc.exists()) {
          setAuthorData(userDoc.data());
        }

        const stylesQuery = query(collection(db, 'styles'), where('authorId', '==', style.authorId));
        const stylesSnapshot = await getDocs(stylesQuery);

        let totalLikes = 0;
        let totalViews = 0;
        let totalDownloads = 0;

        stylesSnapshot.forEach(doc => {
          const data = doc.data();
          totalLikes += (data.likesCount || 0);
          totalViews += (data.viewsCount || 0);
          totalDownloads += (data.downloadsCount || 0);
        });

        setAuthorStats({ totalLikes, totalViews, totalDownloads });
      } catch (err) {
        console.error("Error fetching author details:", err);
      } finally {
        setIsLoadingAuthor(false);
      }
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return alert('Please login to follow users.');
    if (currentUser.uid === style.authorId) return alert('You cannot follow yourself.');

    const isFollowing = authorData?.followers?.includes(currentUser.uid);

    try {
      setAuthorData(prev => ({
        ...prev,
        followers: isFollowing
          ? (prev.followers || []).filter(id => id !== currentUser.uid)
          : [...(prev.followers || []), currentUser.uid]
      }));

      await updateDoc(doc(db, 'users', style.authorId), {
        followers: isFollowing ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
      });
      
      if (!isFollowing) {
        createNotification({
          userId: style.authorId,
          type: 'follow',
          sourceUser: currentUser
        });
      }
      // Update points for the author
      updateUserPoints(style.authorId, isFollowing ? -POINTS.FOLLOW : POINTS.FOLLOW);
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  const autoFitScript = `
    <script>
      function autoFit() {
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
          document.documentElement.style.backgroundColor = bodyBg;
        }

        setTimeout(() => {
          const iw = window.innerWidth;
          const ih = window.innerHeight;
          
          if (!iw || !ih || iw === 0 || ih === 0) return;

          document.body.style.zoom = 1;
          void document.body.offsetHeight;

          let maxW = 0;
          let maxH = 0;
          
          Array.from(document.body.children).forEach(child => {
            if (['SCRIPT', 'STYLE'].includes(child.tagName)) return;
            const rect = child.getBoundingClientRect();
            maxW = Math.max(maxW, rect.width || child.offsetWidth || 0);
            maxH = Math.max(maxH, rect.height || child.offsetHeight || 0);
          });
          
          if (maxW > iw || maxH > ih) {
            const scale = Math.max(0.1, Math.min(iw / (maxW + 40), ih / (maxH + 40)));
            if (scale < 1) {
              document.body.style.zoom = scale;
            }
          }
        }, 150);
      }
      
      window.addEventListener('load', autoFit);
      window.addEventListener('resize', autoFit);
      
      if (window.ResizeObserver) {
        new ResizeObserver(() => {
          if (window.fitTimeout) clearTimeout(window.fitTimeout);
          window.fitTimeout = setTimeout(autoFit, 100);
        }).observe(document.body);
      }
    </script>
  `;

  const previewHtml = style.isCombined
    ? (style.combinedCode?.includes('</body>')
      ? style.combinedCode.replace('</body>', `${autoFitScript}</body>`)
      : (style.combinedCode || '') + autoFitScript)
    : `
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
          background: ${style.previewBgColor || 'transparent'};
          color: ${style.previewBgColor === '#ffffff' ? '#000000' : '#ffffff'};
          overflow: hidden;
        }
        ${style.cssCode || ''}
      </style>
    </head>
    <body>
      ${style.htmlCode || ''}
      <script>${style.jsCode || ''}</script>
      ${autoFitScript}
    </body>
    </html>
  `;

  const navigate = useNavigate();

  const [localStyle, setLocalStyle] = useState({
    likesCount: style.likesCount || 0,
    likedBy: style.likedBy || [],
    savedBy: style.savedBy || [],
    downloadsCount: style.downloadsCount || 0,
    downloadedBy: style.downloadedBy || [],
    viewsCount: style.viewsCount || 0
  });

  // Prevents infinite re-renders by targeting specific primitive values
  useEffect(() => {
    setLocalStyle({
      likesCount: style.likesCount || 0,
      likedBy: style.likedBy || [],
      savedBy: style.savedBy || [],
      downloadsCount: style.downloadsCount || 0,
      downloadedBy: style.downloadedBy || [],
      viewsCount: style.viewsCount || 0
    });
  }, [
    style.id,
    style.likesCount,
    style.downloadsCount,
    style.viewsCount,
    JSON.stringify(style.likedBy),
    JSON.stringify(style.savedBy),
    JSON.stringify(style.downloadedBy)
  ]);

  const hasLiked = currentUser && localStyle.likedBy.includes(currentUser.uid);
  const hasSaved = currentUser && localStyle.savedBy.includes(currentUser.uid);
  const hasDownloaded = currentUser && localStyle.downloadedBy.includes(currentUser.uid);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(style.cssCode);
    // Optional: Add a temporary toast/state change here for user feedback
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return navigate('/auth');

    const isLiking = !hasLiked;
    setLocalStyle(prev => ({
      ...prev,
      likesCount: Math.max((prev.likesCount || 0) + (isLiking ? 1 : -1), 0),
      likedBy: isLiking
        ? [...prev.likedBy, currentUser.uid]
        : prev.likedBy.filter(uid => uid !== currentUser.uid)
    }));

    try {
      await updateDoc(doc(db, 'styles', style.id), {
        likesCount: increment(isLiking ? 1 : -1),
        likedBy: isLiking ? arrayUnion(currentUser.uid) : arrayRemove(currentUser.uid)
      });
      
      if (isLiking) {
        createNotification({
          userId: style.authorId,
          type: 'like',
          sourceUser: currentUser,
          styleId: style.id,
          styleTitle: style.title
        });
      }
      
      if (currentUser.uid !== style.authorId) {
        updateUserPoints(style.authorId, isLiking ? POINTS.LIKE : -POINTS.LIKE);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return navigate('/auth');

    const isSaving = !hasSaved;
    setLocalStyle(prev => ({
      ...prev,
      savedBy: isSaving
        ? [...prev.savedBy, currentUser.uid]
        : prev.savedBy.filter(uid => uid !== currentUser.uid)
    }));

    try {
      await updateDoc(doc(db, 'styles', style.id), {
        savedBy: isSaving ? arrayUnion(currentUser.uid) : arrayRemove(currentUser.uid)
      });
      
      if (isSaving) {
        createNotification({
          userId: style.authorId,
          type: 'save',
          sourceUser: currentUser,
          styleId: style.id,
          styleTitle: style.title
        });
      }
      
      if (currentUser.uid !== style.authorId) {
        updateUserPoints(style.authorId, isSaving ? POINTS.SAVE : -POINTS.SAVE);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return navigate('/auth');

    const htmlContent = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${style.title}</title>\n  <style>\n    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f0f13; }\n    ${style.cssCode}\n  </style>\n</head>\n<body>\n  ${style.htmlCode}\n</body>\n</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(style.title || 'style').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (!hasDownloaded) {
      setLocalStyle(prev => ({
        ...prev,
        downloadsCount: (prev.downloadsCount || 0) + 1,
        downloadedBy: [...prev.downloadedBy, currentUser.uid]
      }));
      try {
        await updateDoc(doc(db, 'styles', style.id), {
          downloadsCount: increment(1),
          downloadedBy: arrayUnion(currentUser.uid)
        });
        
        createNotification({
          userId: style.authorId,
          type: 'download',
          sourceUser: currentUser,
          styleId: style.id,
          styleTitle: style.title
        });
        
        if (currentUser.uid !== style.authorId) {
          updateUserPoints(style.authorId, POINTS.DOWNLOAD);
        }
      } catch (err) {
        console.error("Error updating download count:", err);
      }
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'styles', style.id));
      setIsDeleted(true);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting style:", err);
      alert("Failed to delete style.");
    }
  };

  const cancelDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(false);
  };

  if (isDeleted) return null;

  const renderCardContent = (previewMode) => {
    const isLightBg = style.previewBgColor === '#ffffff';
    const badgeClass = isLightBg 
      ? "bg-white/90 backdrop-blur border-gray-200 text-gray-800 shadow-sm font-bold" 
      : "bg-black/60 backdrop-blur border-white/10 text-white/70 shadow-lg";
    const viewCodeClass = isLightBg
      ? "bg-white/90 backdrop-blur border-gray-200 text-gray-900 shadow-md hover:bg-gray-50"
      : "bg-black/60 backdrop-blur border-white/10 text-white shadow-lg hover:bg-white/20";

    return (
    <div className={`card group block w-full bg-primary-bg rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl ${className}`}>
      {/* Responsive Height Wrapper */}
      <div className="w-full aspect-video sm:aspect-auto sm:h-[280px] flex items-center justify-center relative overflow-hidden border-b border-primary-border">
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {style.isFeatured && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-300 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg">
              FEATURED
            </div>
          )}
          {currentUser && currentUser.uid === style.authorId && !previewMode && (
            <div className="flex gap-2">
              <Link
                to={`/edit/${style.id}`}
                className="bg-accent-purple/80 hover:bg-accent-purple text-text-primary p-1 rounded backdrop-blur transition-colors shadow-lg"
                title="Edit Style"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit3 size={12} />
              </Link>
              <button
                onClick={handleDeleteClick}
                className="bg-red-500/80 hover:bg-red-500 text-text-primary p-1 rounded backdrop-blur transition-colors shadow-lg"
                title="Delete Style"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
        <div className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full border z-10 truncate max-w-[100px] transition-colors ${badgeClass}`}>
          {style.category}
        </div>

        <iframe
          srcDoc={previewHtml}
          title={style.title}
          sandbox="allow-scripts"
          className="w-full h-full border-0"
          tabIndex="-1"
        />

        {!previewMode && (
          <Link
            to={`/style/${style.id}`}
            className={`absolute bottom-3 right-3 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-105 border ${viewCodeClass}`}
          >
            <Code size={14} /> View Code
          </Link>
        )}
      </div>

      <div className={`p-4 flex flex-col justify-between ${previewMode ? 'pointer-events-none' : ''}`}>
        <div>
          <h4 className="font-heading font-semibold text-lg mb-2 group-hover:text-accent-cyan transition-colors truncate">
            {style.title}
          </h4>

          <div className="flex items-center justify-between mb-3 w-full">
            <button onClick={handleAuthorClick} className="flex items-center gap-2 group/author w-fit text-left flex-1 min-w-0">
              {displayPhoto ? (
                <img src={displayPhoto} alt={displayUsername} referrerPolicy="no-referrer" className="w-6 h-6 rounded-full border border-transparent group-hover/author:border-accent-cyan transition-colors object-cover shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-[10px] font-bold text-text-primary border border-transparent group-hover/author:border-white transition-colors shrink-0">
                  {displayName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-sm font-medium text-text-primary/80 group-hover/author:text-text-primary transition-colors truncate">
                {displayName}
              </span>
              {displayRank && (
                <span className="text-[10px] px-1.5 rounded bg-primary-surface border border-primary-border text-amber-500 capitalize shrink-0 ml-1">
                  {displayRank}
                </span>
              )}
            </button>

            {currentUser && currentUser.uid !== style.authorId && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFollow(); }}
                className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all shrink-0 ml-2 ${
                  (authorData?.followers?.includes(currentUser.uid) || authorOverride?.followers?.includes(currentUser.uid))
                    ? 'bg-text-primary/10 text-text-primary/60 hover:bg-text-primary/20'
                    : 'bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 border border-accent-cyan/30'
                }`}
              >
                {(authorData?.followers?.includes(currentUser.uid) || authorOverride?.followers?.includes(currentUser.uid)) ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mb-4 h-5 overflow-hidden">
            {style.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] text-text-muted truncate max-w-[80px]">#{tag}</span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-text-muted border-t border-primary-border pt-3 mt-auto">
          <div className="flex gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 group/icon hover:text-accent-pink transition-colors ${hasLiked ? 'text-accent-pink' : ''}`}
            >
              <Heart size={14} className={`${hasLiked ? 'fill-accent-pink' : 'group-hover/icon:fill-accent-pink'}`} /> {localStyle.likesCount}
            </button>
            <button
              onClick={handleDownloadClick}
              className={`flex items-center gap-1 hover:text-text-primary transition-colors ${hasDownloaded ? 'text-text-primary' : ''}`}
            >
              <Download size={14} /> {localStyle.downloadsCount}
            </button>
            <span className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-default" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <Eye size={14} /> {localStyle.viewsCount}
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
              onClick={handleSave}
              className={`p-1.5 rounded transition-colors ${hasSaved ? 'text-text-primary bg-text-primary/10 hover:bg-text-primary/20' : 'hover:bg-primary-surface hover:text-text-primary'}`}
              title={hasSaved ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Bookmark size={16} className={hasSaved ? "fill-white" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  };

  if (isPreview) return renderCardContent(true);

  return (
    <>
      {renderCardContent(false)}

      {/* Author Modal */}
      {showAuthorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowAuthorModal(false)}>
          <div
            className="bg-primary-surface border border-primary-border rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthorModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              {displayPhoto ? (
                <img src={displayPhoto} alt={displayUsername} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full border-4 border-primary-border mb-4 object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-2xl font-bold text-text-primary mb-4 shadow-lg shadow-accent-purple/20">
                  {displayName?.charAt(0) || 'U'}
                </div>
              )}
              <h3 className="text-xl font-bold text-text-primary mb-1">{displayName}</h3>
              <p className="text-sm text-text-muted mb-4">@{displayUsername}</p>

              {isLoadingAuthor ? (
                <div className="w-full flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-text-primary/5 rounded-xl p-3 border border-text-primary/5">
                      <p className="text-xs text-text-muted mb-1">Followers</p>
                      <p className="text-lg font-bold text-text-primary">{authorData?.followers?.length || 0}</p>
                    </div>
                    <div className="bg-text-primary/5 rounded-xl p-3 border border-text-primary/5">
                      <p className="text-xs text-text-muted mb-1">Total Likes</p>
                      <p className="text-lg font-bold text-accent-pink">{authorStats?.totalLikes || 0}</p>
                    </div>
                    <div className="bg-text-primary/5 rounded-xl p-3 border border-text-primary/5">
                      <p className="text-xs text-text-muted mb-1">Total Views</p>
                      <p className="text-lg font-bold text-accent-cyan">{authorStats?.totalViews || 0}</p>
                    </div>
                    <div className="bg-text-primary/5 rounded-xl p-3 border border-text-primary/5">
                      <p className="text-xs text-text-muted mb-1">Downloads</p>
                      <p className="text-lg font-bold text-accent-purple">{authorStats?.totalDownloads || 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {currentUser?.uid !== style.authorId && (
                      <button
                        onClick={handleFollow}
                        className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${authorData?.followers?.includes(currentUser?.uid) ? 'bg-text-primary/10 text-text-primary hover:bg-text-primary/20 border border-text-primary/10' : 'bg-gradient-to-r from-accent-purple to-accent-cyan text-text-primary hover:opacity-90'}`}
                      >
                        {authorData?.followers?.includes(currentUser?.uid) ? (
                          <><UserMinus size={16} /> Unfollow</>
                        ) : (
                          <><UserPlus size={16} /> Follow</>
                        )}
                      </button>
                    )}
                    <Link
                      to={`/profile/${displayUsername}`}
                      className="flex-1 py-2.5 rounded-xl font-bold border border-primary-border bg-text-primary/5 text-text-primary hover:bg-text-primary/10 transition-colors flex items-center justify-center"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={cancelDelete}>
          <div
            className="bg-[#0f0f13] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold">Delete Style</h3>
            </div>

            <p className="text-text-primary/70 mb-4">
              Are you sure you want to delete <strong>{style.title}</strong>? This action cannot be undone.
            </p>

            <div className="mb-4 scale-95 origin-center opacity-90 pointer-events-none">
              {renderCardContent(true)}
            </div>

            <div className="bg-text-primary/5 rounded-xl p-4 mb-6">
              <p className="text-sm text-text-primary/50 mb-2">You will lose the following metrics forever:</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1 text-accent-pink"><Heart size={14} /> {localStyle.likesCount} Likes</div>
                <div className="flex items-center gap-1 text-text-primary"><Download size={14} /> {localStyle.downloadsCount} Downloads</div>
                <div className="flex items-center gap-1 text-text-primary/70"><Eye size={14} /> {localStyle.viewsCount} Views</div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg font-bold text-text-primary/70 hover:text-text-primary hover:bg-text-primary/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg font-bold bg-red-500 hover:bg-red-600 text-text-primary transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StyleCard;