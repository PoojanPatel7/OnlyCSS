import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Trophy, Star, ChevronUp, Zap } from 'lucide-react';

const Avatar = ({ src, alt, className, fallbackText, fallbackClass }) => {
  const [error, setError] = useState(false);
  if (src && !error) {
    return (
      <img 
        src={src} 
        alt={alt} 
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
    <div className="min-h-screen bg-[#050508] relative overflow-hidden font-sans pb-20">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[0%] left-[20%] w-[60%] h-[40%] rounded-full bg-amber-500/10 blur-[150px] animate-pulse-slow"></div>
        <div className="absolute top-[50%] left-[50%] w-[40%] h-[50%] rounded-full bg-accent-purple/10 blur-[150px]" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="container mx-auto px-4 pt-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Trophy size={16} /> <span className="font-bold text-sm tracking-widest uppercase">Global Rankings</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-white tracking-tight">Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Fame</span></h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Discover the most active and appreciated CSS developers shaping the future of UI design. Rankings are driven by community engagement.
          </p>
        </div>

        {loading ? (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-amber-500 animate-spin mb-4"></div>
            <p className="text-white/50 font-medium">Calculating global rankings...</p>
          </div>
        ) : topUsers.length === 0 ? (
          <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center backdrop-blur-xl">
            <p className="text-white/40 text-lg">The arena is empty. Be the first to claim a spot!</p>
          </div>
        ) : (
          <>
            {/* Elite Podium (Top 3) */}
            <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-24 max-w-5xl mx-auto px-4 mt-32">
              
              {/* 2nd Place */}
              {topUsers[1] && (
                <div className="flex-1 w-full md:w-auto relative order-2 md:order-1 group perspective-1000">
                  <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 pt-16 relative transform transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_0_40px_rgba(192,192,192,0.15)] backdrop-blur-xl h-[300px] flex flex-col items-center justify-end">
                    {/* Crown/Rank Indicator */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="bg-gradient-to-b from-[#e2e2e2] to-[#a0a0a0] text-black w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shadow-[0_5px_15px_rgba(192,192,192,0.4)] mb-3 border-2 border-[#f0f0f0]">2</div>
                      <Avatar 
                        src={topUsers[1].photoURL} 
                        alt={topUsers[1].displayName} 
                        className="w-24 h-24 rounded-full border-4 border-[#c0c0c0] shadow-2xl"
                        fallbackText={topUsers[1].displayName?.charAt(0) || 'U'}
                        fallbackClass="w-24 h-24 rounded-full border-4 border-[#c0c0c0] shadow-2xl bg-gradient-to-tr from-gray-600 to-gray-400 flex items-center justify-center text-3xl font-bold text-white"
                      />
                    </div>
                    
                    <Link to={`/profile/${topUsers[1].username}`} className="font-heading font-bold text-2xl text-white group-hover:text-[#c0c0c0] transition-colors line-clamp-1">{topUsers[1].displayName}</Link>
                    <div className="text-sm text-white/40 mb-6 font-medium">@{topUsers[1].username}</div>
                    
                    <div className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-center gap-2">
                      <Zap className="text-[#c0c0c0]" size={20} />
                      <div className="text-[#c0c0c0] font-bold text-2xl">{topUsers[1].rankPoints || 0}</div>
                      <span className="text-xs text-white/30 font-bold uppercase tracking-wider mt-1">Pts</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 1st Place */}
              {topUsers[0] && (
                <div className="flex-1 w-full md:w-auto relative order-1 md:order-2 group perspective-1000 z-10">
                  {/* Subtle glowing aura */}
                  <div className="absolute inset-0 bg-amber-500/20 blur-[50px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="bg-gradient-to-b from-amber-500/10 to-black/60 border border-amber-500/30 rounded-[2rem] p-8 pt-20 relative transform transition-all duration-500 hover:-translate-y-6 hover:shadow-[0_0_60px_rgba(245,158,11,0.25)] backdrop-blur-2xl h-[350px] flex flex-col items-center justify-end">
                    {/* Crown/Rank Indicator */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400 animate-pulse-slow">
                          <Trophy size={32} fill="currentColor" />
                        </div>
                        <div className="bg-gradient-to-b from-[#ffd700] to-[#b8860b] text-black w-14 h-14 rounded-full flex items-center justify-center font-bold text-3xl shadow-[0_5px_25px_rgba(245,158,11,0.6)] mb-4 border-2 border-[#fff7cc] relative z-10 mt-2">1</div>
                      </div>
                      <Avatar 
                        src={topUsers[0].photoURL} 
                        alt={topUsers[0].displayName} 
                        className="w-32 h-32 rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] ring-4 ring-black"
                        fallbackText={topUsers[0].displayName?.charAt(0) || 'U'}
                        fallbackClass="w-32 h-32 rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] ring-4 ring-black bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-5xl font-bold text-white"
                      />
                    </div>
                    
                    <Link to={`/profile/${topUsers[0].username}`} className="font-heading font-bold text-3xl text-white group-hover:text-amber-400 transition-colors line-clamp-1">{topUsers[0].displayName}</Link>
                    <div className="text-sm text-amber-500/60 mb-8 font-medium">@{topUsers[0].username}</div>
                    
                    <div className="w-full bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20 flex items-center justify-center gap-2">
                      <Zap className="text-amber-400" size={24} />
                      <div className="text-amber-400 font-bold text-4xl tracking-tight">{topUsers[0].rankPoints || 0}</div>
                      <span className="text-xs text-amber-500/50 font-bold uppercase tracking-wider mt-2">Pts</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 3rd Place */}
              {topUsers[2] && (
                <div className="flex-1 w-full md:w-auto relative order-3 md:order-3 group perspective-1000">
                  <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 pt-16 relative transform transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_0_40px_rgba(205,127,50,0.15)] backdrop-blur-xl h-[280px] flex flex-col items-center justify-end">
                    {/* Crown/Rank Indicator */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="bg-gradient-to-b from-[#e6a15c] to-[#a05a2c] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shadow-[0_5px_15px_rgba(205,127,50,0.4)] mb-3 border-2 border-[#f0c399]">3</div>
                      <Avatar 
                        src={topUsers[2].photoURL} 
                        alt={topUsers[2].displayName} 
                        className="w-20 h-20 rounded-full border-4 border-[#cd7f32] shadow-2xl"
                        fallbackText={topUsers[2].displayName?.charAt(0) || 'U'}
                        fallbackClass="w-20 h-20 rounded-full border-4 border-[#cd7f32] shadow-2xl bg-gradient-to-tr from-[#a05a2c] to-[#e6a15c] flex items-center justify-center text-3xl font-bold text-white"
                      />
                    </div>
                    
                    <Link to={`/profile/${topUsers[2].username}`} className="font-heading font-bold text-xl text-white group-hover:text-[#cd7f32] transition-colors line-clamp-1">{topUsers[2].displayName}</Link>
                    <div className="text-sm text-white/40 mb-6 font-medium">@{topUsers[2].username}</div>
                    
                    <div className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-center gap-2">
                      <Zap className="text-[#cd7f32]" size={18} />
                      <div className="text-[#cd7f32] font-bold text-xl">{topUsers[2].rankPoints || 0}</div>
                      <span className="text-xs text-white/30 font-bold uppercase tracking-wider mt-1">Pts</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* List for 4th and Below */}
            {topUsers.length > 3 && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-2 backdrop-blur-xl shadow-2xl">
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wider border-b border-white/5">
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
                        className="group grid grid-cols-1 sm:grid-cols-12 gap-4 items-center px-6 py-4 rounded-2xl hover:bg-white/[0.04] transition-colors duration-300 relative overflow-hidden"
                      >
                        {/* Hover accent line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="col-span-1 text-center hidden sm:block">
                          <span className="text-lg font-bold text-white/20 group-hover:text-white/40 transition-colors">
                            {index + 4}
                          </span>
                        </div>
                        
                        <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                          <div className="sm:hidden text-lg font-bold text-white/20 w-6 text-center">
                            {index + 4}
                          </div>
                          <Avatar 
                            src={user.photoURL} 
                            alt={user.displayName} 
                            className="w-12 h-12 rounded-full border border-white/10 group-hover:border-accent-cyan/50 transition-colors"
                            fallbackText={user.displayName?.charAt(0) || 'U'}
                            fallbackClass="w-12 h-12 rounded-full border border-white/10 bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-sm font-bold text-white"
                          />
                          <div>
                            <div className="font-bold text-white/90 group-hover:text-white transition-colors text-lg">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-white/40">@{user.username}</div>
                          </div>
                        </div>
                        
                        <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                          <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold capitalize text-white/70 group-hover:bg-white/10 group-hover:text-white transition-colors">
                            <span className="text-sm">{getRankBadge(user.rankTier)}</span>
                            {user.rankTier || 'Bronze'}
                          </div>
                        </div>
                        
                        <div className="col-span-1 sm:col-span-3 flex items-center justify-start sm:justify-end gap-2">
                          <div className="text-xl font-bold text-white/80 group-hover:text-white transition-colors">
                            {user.rankPoints || 0}
                          </div>
                          <span className="text-xs font-bold text-white/30 uppercase tracking-wider mt-1">Pts</span>
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
