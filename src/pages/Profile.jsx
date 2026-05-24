import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, onSnapshot, limit, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import StyleCard from '../components/StyleCard';
import { Code, Layout, Heart, Info, MapPin, Link as LinkIcon, Calendar, Activity, UserPlus, UserCheck, Bookmark, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createNotification } from '../utils/notifications';
import { updateUserPoints, POINTS } from '../utils/points';

const Avatar = ({ src, alt, className, fallbackText, fallbackClass }) => {
  const [error, setError] = useState(false);
  if (src && !error) {
    return (
      <img 
        src={src} 
        alt={alt} 
        referrerPolicy="no-referrer"
        className={`${className} object-cover`} 
        onError={() => setError(true)} 
      />
    );
  }
  return <div className={fallbackClass}>{fallbackText}</div>;
};

const Profile = () => {
  const { username } = useParams();
  const { currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userStyles, setUserStyles] = useState([]);
  const [savedStyles, setSavedStyles] = useState([]);
  const [likedStyles, setLikedStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('styles');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const usersQ = query(collection(db, 'users'), where('username', '==', username), limit(1));
        const usersSnap = await getDocs(usersQ);
        
        if (!usersSnap.empty) {
          const userData = { id: usersSnap.docs[0].id, ...usersSnap.docs[0].data() };
          setProfileUser(userData);
          
          const stylesQ = query(
            collection(db, 'styles'), 
            where('authorId', '==', userData.id)
          );
          const unsubStyles = onSnapshot(stylesQ, (snap) => {
            const stylesData = snap.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(style => style.status === 'published');
            stylesData.sort((a, b) => (b.publishedAt?.toMillis() || 0) - (a.publishedAt?.toMillis() || 0));
            setUserStyles(stylesData);
          });
          
          const savedQ = query(collection(db, 'styles'), where('savedBy', 'array-contains', userData.id));
          const unsubSaved = onSnapshot(savedQ, (snap) => {
            const data = snap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(style => style.status === 'published');
            data.sort((a, b) => (b.publishedAt?.toMillis() || 0) - (a.publishedAt?.toMillis() || 0));
            setSavedStyles(data);
          });

          const likedQ = query(collection(db, 'styles'), where('likedBy', 'array-contains', userData.id));
          const unsubLiked = onSnapshot(likedQ, (snap) => {
            const data = snap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(style => style.status === 'published');
            data.sort((a, b) => (b.publishedAt?.toMillis() || 0) - (a.publishedAt?.toMillis() || 0));
            setLikedStyles(data);
          });

          return () => {
            unsubStyles();
            unsubSaved();
            unsubLiked();
          };
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    
    const unsubscribe = fetchProfile();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      } else {
        unsubscribe.then(unsub => {
          if (typeof unsub === 'function') unsub();
        });
      }
    };
  }, [username]);

  const handleFollow = async () => {
    if (!currentUser) return alert("Please log in to follow developers.");
    if (currentUser.uid === profileUser.id) return alert("You cannot follow yourself.");

    const isFollowing = profileUser.followers?.includes(currentUser.uid);
    try {
      setProfileUser(prev => ({
        ...prev,
        followersCount: Math.max((prev.followersCount || 0) + (isFollowing ? -1 : 1), 0),
        followers: isFollowing
          ? (prev.followers || []).filter(uid => uid !== currentUser.uid)
          : [...(prev.followers || []), currentUser.uid]
      }));

      await updateDoc(doc(db, 'users', profileUser.id), {
        followersCount: increment(isFollowing ? -1 : 1),
        followers: isFollowing ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
      });
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        followingCount: increment(isFollowing ? -1 : 1),
        following: isFollowing ? arrayRemove(profileUser.id) : arrayUnion(profileUser.id)
      });

      if (!isFollowing) {
        createNotification({
          userId: profileUser.id,
          type: 'follow',
          sourceUser: currentUser
        });
      }

      updateUserPoints(profileUser.id, isFollowing ? -POINTS.FOLLOW : POINTS.FOLLOW);
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  const getRankBadge = (tier) => {
    switch(tier) {
      case 'diamond': return '💠';
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  const getRankColor = (tier) => {
    switch(tier) {
      case 'diamond': return 'from-cyan-300 to-blue-500 text-cyan-100 border-cyan-400/30';
      case 'platinum': return 'from-gray-300 to-gray-500 text-gray-100 border-gray-400/30';
      case 'gold': return 'from-yellow-300 to-amber-500 text-yellow-100 border-yellow-400/30';
      case 'silver': return 'from-gray-400 to-gray-600 text-gray-200 border-gray-500/30';
      default: return 'from-orange-400 to-amber-600 text-orange-100 border-orange-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-text-primary/10 border-t-accent-purple animate-spin"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center p-4">
        <div className="bg-white/[0.02] border border-text-primary/5 rounded-[2rem] p-12 text-center backdrop-blur-xl max-w-md w-full shadow-2xl">
          <div className="text-6xl mb-6">👻</div>
          <h2 className="text-3xl font-heading font-bold text-text-primary mb-2 tracking-tight">Ghost User</h2>
          <p className="text-text-primary/40 mb-8">The developer <span className="text-accent-cyan">@{username}</span> doesn't exist or has vanished into the void.</p>
          <Link to="/explore" className="w-full btn-primary py-3 rounded-xl flex justify-center items-center font-bold">Return to Explore</Link>
        </div>
      </div>
    );
  }

  const joinDate = profileUser.createdAt?.toDate ? profileUser.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  return (
    <div className="min-h-screen bg-[#050508] relative font-sans pb-20">
      {/* Cover Image or Animated Gradient */}
      <div className="h-[350px] w-full relative overflow-hidden z-0">
        {profileUser.coverURL ? (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${profileUser.coverURL})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/60 to-[#050508]"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[140%] rounded-full bg-accent-purple/20 blur-[120px] animate-pulse-slow"></div>
              <div className="absolute top-[10%] right-[-10%] w-[60%] h-[120%] rounded-full bg-accent-cyan/20 blur-[120px]" style={{ animationDelay: '2s' }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050508]"></div>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Profile Header Card */}
        <div className="relative -mt-32 mb-12 bg-white/[0.03] backdrop-blur-2xl rounded-[2rem] border border-text-primary/10 p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            
            {/* Avatar Group */}
            <div className="relative shrink-0 -mt-20 md:-mt-24 self-center md:self-start">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple to-accent-cyan rounded-full blur-xl opacity-40 animate-pulse-slow"></div>
              <Avatar 
                src={profileUser.photoURL} 
                alt={profileUser.displayName} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#050508] relative z-10 shadow-2xl"
                fallbackText={profileUser.displayName?.charAt(0) || 'U'}
                fallbackClass="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#050508] relative z-10 shadow-2xl bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-6xl text-text-primary font-bold"
              />
              <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#050508] border border-text-primary/10 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] z-20 tooltip-trigger">
                {getRankBadge(profileUser.rankTier)}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary tracking-tight">
                  {profileUser.displayName}
                </h1>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border bg-gradient-to-r ${getRankColor(profileUser.rankTier)} bg-opacity-10 backdrop-blur-sm self-center md:self-auto`}>
                  <span className="text-xs font-bold uppercase tracking-wider">{profileUser.rankTier || 'Bronze'} Developer</span>
                </div>
              </div>
              
              
              
              {profileUser.bio ? (
                <p className="text-text-primary/60 max-w-2xl text-sm leading-relaxed mb-6 mx-auto md:mx-0">
                  {profileUser.bio}
                </p>
              ) : (
                <p className="text-text-primary/30 max-w-2xl text-sm italic mb-6 mx-auto md:mx-0">
                  This developer is a mystery. No bio provided.
                </p>
              )}

              {/* Meta Links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-text-primary/40 mb-8 md:mb-0">
                <div className="flex items-center gap-1.5"><Calendar size={14} /> Joined {joinDate}</div>
                {profileUser.location && <div className="flex items-center gap-1.5"><MapPin size={14} /> {profileUser.location}</div>}
                {profileUser.website && (
                  <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-accent-cyan hover:text-text-primary transition-colors">
                    <LinkIcon size={14} /> {profileUser.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
            
            {/* Stats & Actions */}
            <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-6 shrink-0">
              <div className="flex gap-4 md:gap-6 bg-black/40 border border-text-primary/5 p-4 rounded-2xl w-full md:w-auto justify-center">
                <div className="text-center px-2">
                  <div className="text-2xl font-bold text-text-primary mb-1">{profileUser.rankPoints || 0}</div>
                  <div className="text-[10px] text-text-primary/40 uppercase tracking-widest">Points</div>
                </div>
                <div className="w-px bg-text-primary/10"></div>
                <div className="text-center px-2">
                  <div className="text-2xl font-bold text-text-primary mb-1">{userStyles.length}</div>
                  <div className="text-[10px] text-text-primary/40 uppercase tracking-widest">Styles</div>
                </div>
                <div className="w-px bg-text-primary/10"></div>
                <div className="text-center px-2">
                  <div className="text-2xl font-bold text-text-primary mb-1">{profileUser.followersCount || 0}</div>
                  <div className="text-[10px] text-text-primary/40 uppercase tracking-widest">Followers</div>
                </div>
              </div>
              
              {(!currentUser || currentUser.uid !== profileUser.id) ? (
                <button 
                  onClick={handleFollow}
                  className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                >
                  <span className={`absolute inset-0 bg-gradient-to-r ${profileUser.followers?.includes(currentUser?.uid) ? 'from-text-primary/20 to-text-primary/10' : 'from-accent-purple to-accent-cyan opacity-70 group-hover:opacity-100'} transition-opacity`}></span>
                  <div className={`relative ${profileUser.followers?.includes(currentUser?.uid) ? 'bg-text-primary/10 text-text-primary' : 'bg-[#050508] hover:bg-transparent'} transition-colors px-8 py-3 rounded-xl flex items-center justify-center gap-2`}>
                    {profileUser.followers?.includes(currentUser?.uid) ? (
                      <><UserCheck size={18} /> Following</>
                    ) : (
                      <><UserPlus size={18} className="text-accent-cyan group-hover:text-text-primary transition-colors" /> <span className="font-bold text-text-primary tracking-wide">Follow</span></>
                    )}
                  </div>
                </button>
              ) : (
                <Link
                  to="/settings"
                  className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-text-primary/20 to-text-primary/10 transition-opacity hover:opacity-100 opacity-70"></span>
                  <div className="relative bg-[#050508] hover:bg-transparent transition-colors px-8 py-3 rounded-xl flex items-center justify-center gap-2">
                    <Settings size={18} className="text-text-primary/70 group-hover:text-text-primary transition-colors" />
                    <span className="font-bold text-text-primary tracking-wide">Settings</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-10 border-b border-text-primary/5 pb-px">
          {[
            { id: 'styles', icon: <Code size={16} />, label: 'Styles', count: userStyles.length },
            { id: 'saved', icon: <Bookmark size={16} />, label: 'Saved', count: savedStyles.length },
            { id: 'liked', icon: <Heart size={16} />, label: 'Liked', count: likedStyles.length },
            { id: 'collections', icon: <Layout size={16} />, label: 'Collections', count: 0 },
            { id: 'activity', icon: <Activity size={16} />, label: 'Activity', count: null },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'text-text-primary' : 'text-text-primary/40 hover:text-text-primary/80 hover:bg-white/[0.02] rounded-t-xl'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== null && <span className="bg-text-primary/10 text-text-primary/70 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>}
              
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'styles' && (
            userStyles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                {userStyles.map(style => (
                  <StyleCard key={style.id} style={style} authorOverride={profileUser} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/[0.01] border border-text-primary/5 rounded-3xl backdrop-blur-sm">
                <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 border border-text-primary/5">
                  <Code className="text-text-primary/20" size={32} />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-2 text-text-primary/80">No styles published</h3>
                <p className="text-text-primary/40 text-center max-w-md">
                  {profileUser.displayName} hasn't shared any CSS magic with the community yet.
                </p>
              </div>
            )
          )}
          {activeTab === 'saved' && (
            savedStyles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                {savedStyles.map(style => (
                  <StyleCard key={style.id} style={style} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/[0.01] border border-text-primary/5 rounded-3xl backdrop-blur-sm">
                <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 border border-text-primary/5">
                  <Bookmark className="text-text-primary/20" size={32} />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-2 text-text-primary/80">No saved styles</h3>
                <p className="text-text-primary/40 text-center max-w-md">
                  {profileUser.displayName} hasn't saved any CSS styles to their wishlist yet.
                </p>
              </div>
            )
          )}
          
          {activeTab === 'liked' && (
            likedStyles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                {likedStyles.map(style => (
                  <StyleCard key={style.id} style={style} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/[0.01] border border-text-primary/5 rounded-3xl backdrop-blur-sm">
                <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 border border-text-primary/5">
                  <Heart className="text-text-primary/20" size={32} />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-2 text-text-primary/80">No liked styles</h3>
                <p className="text-text-primary/40 text-center max-w-md">
                  {profileUser.displayName} hasn't liked any CSS styles yet.
                </p>
              </div>
            )
          )}
          
          {['collections', 'activity'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/[0.01] border border-text-primary/5 rounded-3xl backdrop-blur-sm">
              <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 border border-text-primary/5">
                <Info className="text-text-primary/20" size={32} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-2 text-text-primary/80">Coming Soon</h3>
              <p className="text-text-primary/40 text-center max-w-md">
                This section is currently under construction. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
