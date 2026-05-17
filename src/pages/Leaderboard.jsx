import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Star } from 'lucide-react';

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
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-6">
        <Trophy size={16} /> Global Rankings
      </div>
      <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">Top Developers</h2>
      <p className="text-text-muted max-w-2xl mx-auto mb-16">
        The most active and appreciated CSS developers in the vault. 
        Rankings are based on likes, downloads, and engagement.
      </p>

      {loading ? (
        <div className="max-w-4xl mx-auto card p-12 text-center">Loading rankings...</div>
      ) : topUsers.length === 0 ? (
        <div className="max-w-4xl mx-auto card p-12 text-center">No rankings available yet.</div>
      ) : (
        <>
          {/* Podium for Top 3 */}
          <div className="flex flex-col md:flex-row justify-center items-end gap-4 mb-16 max-w-4xl mx-auto px-4">
            {/* 2nd Place */}
            {topUsers[1] && (
              <div className="flex-1 card p-6 bg-primary-surface/50 border-[#c0c0c0] relative order-2 md:order-1 transform hover:-translate-y-2 transition-transform h-[280px] flex flex-col items-center justify-end shadow-[0_0_30px_rgba(192,192,192,0.1)]">
                <div className="absolute -top-10 bg-[#c0c0c0] text-black w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-primary-bg">2</div>
                {topUsers[1].photoURL ? (
                  <img src={topUsers[1].photoURL} className="w-24 h-24 rounded-full mb-4 border-2 border-[#c0c0c0]" alt="" />
                ) : (
                  <div className="w-24 h-24 rounded-full mb-4 border-2 border-[#c0c0c0] bg-gradient-to-tr from-gray-500 to-gray-300 flex items-center justify-center text-3xl font-bold text-white">
                    {topUsers[1].displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <Link to={`/profile/${topUsers[1].username}`} className="font-heading font-bold text-xl hover:text-[#c0c0c0]">{topUsers[1].displayName}</Link>
                <div className="text-sm text-text-muted mb-4">@{topUsers[1].username}</div>
                <div className="text-[#c0c0c0] font-bold text-2xl">{topUsers[1].rankPoints || 0} <span className="text-xs text-text-muted uppercase">Pts</span></div>
              </div>
            )}
            
            {/* 1st Place */}
            {topUsers[0] && (
              <div className="flex-1 card p-8 bg-gradient-to-b from-amber-500/10 to-primary-surface border-amber-500 relative order-1 md:order-2 transform hover:-translate-y-2 transition-transform h-[320px] flex flex-col items-center justify-end shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                <div className="absolute -top-12 bg-amber-500 text-black w-16 h-16 rounded-full flex items-center justify-center font-bold text-3xl shadow-[0_0_20px_rgba(245,158,11,0.5)] border-4 border-primary-bg">1</div>
                {topUsers[0].photoURL ? (
                  <img src={topUsers[0].photoURL} className="w-32 h-32 rounded-full mb-4 border-4 border-amber-500" alt="" />
                ) : (
                  <div className="w-32 h-32 rounded-full mb-4 border-4 border-amber-500 bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-4xl font-bold text-white">
                    {topUsers[0].displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <Link to={`/profile/${topUsers[0].username}`} className="font-heading font-bold text-2xl hover:text-amber-500 text-white">{topUsers[0].displayName}</Link>
                <div className="text-sm text-amber-500/80 mb-4">@{topUsers[0].username}</div>
                <div className="text-amber-500 font-bold text-3xl">{topUsers[0].rankPoints || 0} <span className="text-xs text-text-muted uppercase">Pts</span></div>
              </div>
            )}
            
            {/* 3rd Place */}
            {topUsers[2] && (
              <div className="flex-1 card p-6 bg-primary-surface/30 border-[#cd7f32] relative order-3 md:order-3 transform hover:-translate-y-2 transition-transform h-[250px] flex flex-col items-center justify-end shadow-[0_0_20px_rgba(205,127,50,0.1)]">
                <div className="absolute -top-8 bg-[#cd7f32] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-4 border-primary-bg">3</div>
                {topUsers[2].photoURL ? (
                  <img src={topUsers[2].photoURL} className="w-20 h-20 rounded-full mb-4 border-2 border-[#cd7f32]" alt="" />
                ) : (
                  <div className="w-20 h-20 rounded-full mb-4 border-2 border-[#cd7f32] bg-gradient-to-tr from-[#cd7f32] to-[#e69f58] flex items-center justify-center text-2xl font-bold text-white">
                    {topUsers[2].displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <Link to={`/profile/${topUsers[2].username}`} className="font-heading font-bold text-lg hover:text-[#cd7f32]">{topUsers[2].displayName}</Link>
                <div className="text-sm text-text-muted mb-4">@{topUsers[2].username}</div>
                <div className="text-[#cd7f32] font-bold text-xl">{topUsers[2].rankPoints || 0} <span className="text-xs text-text-muted uppercase">Pts</span></div>
              </div>
            )}
          </div>

          {/* List for 4+ */}
          {topUsers.length > 3 && (
            <div className="max-w-4xl mx-auto card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary-surface border-b border-primary-border">
                    <th className="py-4 px-6 text-text-muted font-medium text-sm w-16 text-center">#</th>
                    <th className="py-4 px-6 text-text-muted font-medium text-sm">Developer</th>
                    <th className="py-4 px-6 text-text-muted font-medium text-sm text-center">Rank</th>
                    <th className="py-4 px-6 text-text-muted font-medium text-sm text-center">Followers</th>
                    <th className="py-4 px-6 text-text-muted font-medium text-sm text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-border">
                  {topUsers.slice(3).map((user, index) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-text-muted">{index + 4}</td>
                      <td className="py-4 px-6">
                        <Link to={`/profile/${user.username}`} className="flex items-center gap-3 group">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-sm font-bold text-white">
                              {user.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="font-medium group-hover:text-accent-cyan transition-colors">{user.displayName}</div>
                            <div className="text-xs text-text-muted">@{user.username}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-1 bg-primary-surface border border-primary-border px-2 py-1 rounded text-xs capitalize">
                          {getRankBadge(user.rankTier)} {user.rankTier || 'Bronze'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-text-muted">
                        {user.followersCount || 0}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-white">
                        {user.rankPoints || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
