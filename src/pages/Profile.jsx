import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import StyleCard from '../components/StyleCard';

const Profile = () => {
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [userStyles, setUserStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1. Fetch user by username
        const usersQ = query(collection(db, 'users'), where('username', '==', username), limit(1));
        const usersSnap = await getDocs(usersQ);
        
        if (!usersSnap.empty) {
          const userData = { id: usersSnap.docs[0].id, ...usersSnap.docs[0].data() };
          setProfileUser(userData);
          
          // 2. Fetch their styles
          const stylesQ = query(
            collection(db, 'styles'), 
            where('authorUsername', '==', username),
            where('status', '==', 'published'),
            orderBy('publishedAt', 'desc')
          );
          const stylesSnap = await getDocs(stylesQ);
          setUserStyles(stylesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username]);

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-text-muted">Loading profile...</div>;
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">User not found</h2>
        <p className="text-text-muted mb-6">The developer @{username} doesn't exist.</p>
        <Link to="/explore" className="btn-primary">Explore Styles</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Cover Image */}
      <div className="h-64 w-full bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-pink opacity-80" 
           style={{ backgroundImage: profileUser.coverURL ? `url(${profileUser.coverURL})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-20 mb-12 px-4 sm:px-8 bg-primary-surface rounded-2xl border border-primary-border pb-8 pt-20 shadow-2xl">
          <div className="absolute -top-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-primary-surface bg-primary-bg overflow-hidden relative">
              {profileUser.photoURL ? (
                <img src={profileUser.photoURL} alt={profileUser.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-5xl text-white font-bold">
                  {profileUser.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-bg border-2 border-primary-surface flex items-center justify-center text-xl shadow-lg">
              {profileUser.rankTier === 'diamond' ? '💠' : profileUser.rankTier === 'platinum' ? '💎' : profileUser.rankTier === 'gold' ? '🥇' : profileUser.rankTier === 'silver' ? '🥈' : '🥉'}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ml-[150px] -mt-16 sm:ml-0 sm:mt-0 sm:pt-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
                {profileUser.displayName}
                <span className="text-sm px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize font-medium">
                  {profileUser.rankTier || 'Bronze'} Developer
                </span>
              </h1>
              <p className="text-text-muted text-lg mb-2">@{profileUser.username}</p>
              
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{profileUser.rankPoints || 0}</div>
                  <div className="text-xs text-text-muted uppercase">Rank Points</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{userStyles.length}</div>
                  <div className="text-xs text-text-muted uppercase">Styles</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{profileUser.followersCount || 0}</div>
                  <div className="text-xs text-text-muted uppercase">Followers</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <button className="btn-primary py-2 px-6 flex-1 md:flex-none">Follow</button>
            </div>
          </div>
          
          {profileUser.bio && (
            <p className="mt-8 text-text-muted max-w-2xl text-sm leading-relaxed">
              {profileUser.bio}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-primary-border mb-8">
          <button className="py-3 text-white border-b-2 border-accent-cyan font-medium">Styles ({userStyles.length})</button>
          <button className="py-3 text-text-muted hover:text-white transition-colors">Collections (0)</button>
          <button className="py-3 text-text-muted hover:text-white transition-colors">Liked</button>
          <button className="py-3 text-text-muted hover:text-white transition-colors">About</button>
        </div>

        {/* User Styles Grid */}
        {userStyles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {userStyles.map(style => (
              <StyleCard key={style.id} style={style} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card mb-16">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-heading font-bold mb-2">No styles yet</h3>
            <p className="text-text-muted">@{profileUser.username} hasn't published any styles.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
