import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Trophy, Star, ChevronUp, Zap, Info, Award, Upload, Heart, Bookmark, Copy, Users } from 'lucide-react';

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

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('rankPoints', 'desc'), limit(50));
        const snap = await getDocs(q);
        setTopUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (tier) => {
    switch(tier) {
      case 'diamond': return '💠';
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden font-sans pb-20 selection:bg-accent-purple/30 selection:text-white">
      {/* Minimalist Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent-cyan/5 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      <div className="container mx-auto px-4 pt-24 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-text-primary mb-6 transition-colors hover:bg-white/10">
            <Trophy size={14} className="text-amber-400" />
            <span>Global Rankings</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white tracking-tight">Top Contributors</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Discover the most active and appreciated CSS developers shaping the future of UI design. Rankings are driven by community engagement.
          </p>
        </div>

        {/* How Points Work Section */}
        <div className="max-w-5xl mx-auto mb-20 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3 mb-8">
              <Info className="text-accent-cyan" size={24} />
              <h3 className="text-2xl font-bold text-white tracking-tight">How Rankings Work</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
              <div className="p-5 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <Upload className="text-accent-purple mb-3" size={24} />
                <div className="text-white font-bold text-2xl mb-1">+50</div>
                <div className="text-text-muted text-xs uppercase tracking-wider font-semibold">Per Upload</div>
              </div>
              <div className="p-5 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <Users className="text-accent-cyan mb-3" size={24} />
                <div className="text-white font-bold text-2xl mb-1">+20</div>
                <div className="text-text-muted text-xs uppercase tracking-wider font-semibold">Per Follower</div>
              </div>
              <div className="p-5 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <Copy className="text-status-success mb-3" size={24} />
                <div className="text-white font-bold text-2xl mb-1">+15</div>
                <div className="text-text-muted text-xs uppercase tracking-wider font-semibold">Per Copy</div>
              </div>
              <div className="p-5 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <Bookmark className="text-amber-400 mb-3" size={24} />
                <div className="text-white font-bold text-2xl mb-1">+10</div>
                <div className="text-text-muted text-xs uppercase tracking-wider font-semibold">Per Save</div>
              </div>
              <div className="p-5 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center text-center">
                <Heart className="text-status-danger mb-3" size={24} />
                <div className="text-white font-bold text-2xl mb-1">+5</div>
                <div className="text-text-muted text-xs uppercase tracking-wider font-semibold">Per Like</div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/10 gap-6">
              <div className="flex items-center gap-3">
                <Award className="text-amber-400" size={20} />
                <h4 className="text-lg font-bold text-white tracking-tight">Rank Tiers</h4>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm font-medium text-text-muted">
                  <span>🥉</span> Bronze (0+)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm font-medium text-text-muted">
                  <span>🥈</span> Silver (100+)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm font-medium text-amber-500">
                  <span>🥇</span> Gold (500+)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-400/10 border border-gray-400/20 text-sm font-medium text-gray-300">
                  <span>💎</span> Platinum (2k+)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 text-sm font-medium text-accent-cyan">
                  <span>💠</span> Diamond (5k+)
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-4"></div>
            <p className="text-text-muted font-medium">Loading rankings...</p>
          </div>
        ) : topUsers.length === 0 ? (
          <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-xl">
            <p className="text-text-muted text-lg">The arena is empty. Be the first to claim a spot!</p>
          </div>
        ) : (
          <>
            {/* Elite Podium (Top 3) */}
            <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-16 max-w-5xl mx-auto px-4 mt-20 animate-slide-up" style={{ animationDelay: '200ms' }}>
              
              {/* 2nd Place */}
              {topUsers[1] && (
                <div className="flex-1 w-full md:w-auto relative order-2 md:order-1 group">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 pt-12 relative transition-all duration-300 hover:bg-white/10 backdrop-blur-xl flex flex-col items-center text-center">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                      <Avatar 
                        src={topUsers[1].photoURL} 
                        alt={topUsers[1].displayName} 
                        className="w-20 h-20 rounded-full border-4 border-[#050508] shadow-xl"
                        fallbackText={topUsers[1].displayName?.charAt(0) || 'U'}
                        fallbackClass="w-20 h-20 rounded-full border-4 border-[#050508] shadow-xl bg-gray-600 flex items-center justify-center text-2xl font-bold text-white"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-300 text-black flex items-center justify-center font-bold text-sm shadow-lg border-2 border-[#050508]">2</div>
                    </div>
                    
                    <Link to={`/profile/${topUsers[1].username}`} className="font-heading font-bold text-xl text-white group-hover:text-accent-cyan transition-colors mt-2 line-clamp-1">{topUsers[1].displayName}</Link>
                    <div className="text-sm text-text-muted mb-6">@{topUsers[1].username}</div>
                    
                    <div className="w-full bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-center gap-2">
                      <Zap className="text-gray-300" size={16} />
                      <div className="text-gray-300 font-bold text-xl">{topUsers[1].rankPoints || 0}</div>
                      <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Pts</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 1st Place */}
              {topUsers[0] && (
                <div className="flex-1 w-full md:w-auto relative order-1 md:order-2 group z-10 -mt-8">
                  <div className="absolute inset-0 bg-amber-500/10 blur-[40px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="bg-[#111118] border border-amber-500/30 rounded-2xl p-8 pt-16 relative transition-all duration-300 hover:border-amber-500/50 backdrop-blur-xl flex flex-col items-center text-center shadow-2xl">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400">
                        <Trophy size={24} fill="currentColor" />
                      </div>
                      <Avatar 
                        src={topUsers[0].photoURL} 
                        alt={topUsers[0].displayName} 
                        className="w-24 h-24 rounded-full border-4 border-[#050508] ring-2 ring-amber-400 shadow-xl"
                        fallbackText={topUsers[0].displayName?.charAt(0) || 'U'}
                        fallbackClass="w-24 h-24 rounded-full border-4 border-[#050508] ring-2 ring-amber-400 shadow-xl bg-amber-500 flex items-center justify-center text-3xl font-bold text-white"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-sm shadow-lg border-2 border-[#050508]">1</div>
                    </div>
                    
                    <Link to={`/profile/${topUsers[0].username}`} className="font-heading font-bold text-2xl text-white group-hover:text-amber-400 transition-colors mt-2 line-clamp-1">{topUsers[0].displayName}</Link>
                    <div className="text-sm text-amber-400/70 mb-6">@{topUsers[0].username}</div>
                    
                    <div className="w-full bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 flex items-center justify-center gap-2">
                      <Zap className="text-amber-400" size={20} />
                      <div className="text-amber-400 font-bold text-3xl tracking-tight">{topUsers[0].rankPoints || 0}</div>
                      <span className="text-xs text-amber-400/60 uppercase tracking-wider font-semibold">Pts</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 3rd Place */}
              {topUsers[2] && (
                <div className="flex-1 w-full md:w-auto relative order-3 md:order-3 group">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 pt-12 relative transition-all duration-300 hover:bg-white/10 backdrop-blur-xl flex flex-col items-center text-center">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                      <Avatar 
                        src={topUsers[2].photoURL} 
                        alt={topUsers[2].displayName} 
                        className="w-20 h-20 rounded-full border-4 border-[#050508] shadow-xl"
                        fallbackText={topUsers[2].displayName?.charAt(0) || 'U'}
                        fallbackClass="w-20 h-20 rounded-full border-4 border-[#050508] shadow-xl bg-[#cd7f32] flex items-center justify-center text-2xl font-bold text-white"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#cd7f32] text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 border-[#050508]">3</div>
                    </div>
                    
                    <Link to={`/profile/${topUsers[2].username}`} className="font-heading font-bold text-xl text-white group-hover:text-[#cd7f32] transition-colors mt-2 line-clamp-1">{topUsers[2].displayName}</Link>
                    <div className="text-sm text-text-muted mb-6">@{topUsers[2].username}</div>
                    
                    <div className="w-full bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-center gap-2">
                      <Zap className="text-[#cd7f32]" size={16} />
                      <div className="text-[#cd7f32] font-bold text-xl">{topUsers[2].rankPoints || 0}</div>
                      <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Pts</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* List for 4th and Below */}
            {topUsers.length > 3 && (
              <div className="max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-2 backdrop-blur-xl shadow-2xl">
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-white/5">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-6">Developer</div>
                    <div className="col-span-2 text-center">Tier</div>
                    <div className="col-span-3 text-right">Points</div>
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-2">
                    {topUsers.slice(3).map((user, index) => (
                      <Link 
                        key={user.id} 
                        to={`/profile/${user.username}`}
                        className="group grid grid-cols-1 sm:grid-cols-12 gap-4 items-center px-6 py-4 rounded-xl hover:bg-white/5 transition-colors duration-200"
                      >
                        <div className="col-span-1 flex items-center justify-center">
                          <span className="text-lg font-bold text-text-muted group-hover:text-white transition-colors">#{index + 4}</span>
                        </div>
                        
                        <div className="col-span-6 flex items-center gap-4">
                          <Avatar 
                            src={user.photoURL} 
                            alt={user.displayName} 
                            className="w-10 h-10 rounded-full border border-white/10"
                            fallbackText={user.displayName?.charAt(0) || 'U'}
                            fallbackClass="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white"
                          />
                          <div>
                            <div className="font-bold text-white group-hover:text-accent-cyan transition-colors">{user.displayName}</div>
                            <div className="text-xs text-text-muted">@{user.username}</div>
                          </div>
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-center">
                          <div className="bg-white/5 border border-white/5 rounded-lg px-3 py-1 flex items-center gap-2">
                            <span className="text-base">{getRankBadge(user.rankTier)}</span>
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:block">
                              {user.rankTier || 'Bronze'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="col-span-3 flex items-center justify-end gap-2">
                          <div className="font-bold text-lg text-white">{user.rankPoints || 0}</div>
                          <Zap size={14} className="text-text-muted" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
