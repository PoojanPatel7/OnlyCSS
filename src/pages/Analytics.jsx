import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Activity, TrendingUp, Users, Eye, Download, Calendar, Heart, Bookmark, BarChart3, Shield, Layers, Zap } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';

const Analytics = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    views: 0,
    downloads: 0,
    likes: 0,
    saves: 0,
    followers: 0,
    uploads: 0
  });
  
  const [chartData, setChartData] = useState([]);
  const [topStyles, setTopStyles] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const stylesQ = query(
          collection(db, 'styles'), 
          where('authorId', '==', currentUser.uid)
        );
        
        const snap = await getDocs(stylesQ);
        const styles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        let views = 0;
        let downloads = 0;
        let likes = 0;
        let saves = 0;
        
        const timeData = {};
        
        styles.forEach(style => {
          views += (style.viewsCount || 0);
          downloads += (style.downloadsCount || 0);
          likes += (style.likesCount || 0);
          saves += (style.savedBy?.length || 0);
          
          if (style.publishedAt) {
            const date = style.publishedAt.toDate();
            const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!timeData[sortKey]) {
              timeData[sortKey] = { label: monthYear, uploads: 0, likes: 0, views: 0 };
            }
            timeData[sortKey].uploads += 1;
            timeData[sortKey].likes += (style.likesCount || 0);
            timeData[sortKey].views += (style.viewsCount || 0);
          }
        });
        
        const sortedKeys = Object.keys(timeData).sort();
        const finalChart = sortedKeys.slice(-8).map(key => timeData[key]);

        // Calculate Top Performing Styles
        const sortedStyles = [...styles].sort((a, b) => {
          const scoreA = (a.viewsCount || 0) + (a.likesCount || 0) * 2 + (a.downloadsCount || 0) * 3;
          const scoreB = (b.viewsCount || 0) + (b.likesCount || 0) * 2 + (b.downloadsCount || 0) * 3;
          return scoreB - scoreA;
        });

        setStats({
          views,
          downloads,
          likes,
          saves,
          followers: userData?.followers?.length || userData?.followersCount || 0,
          uploads: styles.length
        });
        
        setChartData(finalChart);
        setTopStyles(sortedStyles.slice(0, 4));

      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [currentUser, userData, navigate]);

  if (!currentUser) return null;

  const maxViews = Math.max(...chartData.map(c => c.views), 1);
  const maxEngagementValue = Math.max(stats.views, stats.likes, stats.downloads, stats.saves, 1);

  return (
    <div className="min-h-screen bg-[#050508] relative font-sans pb-20 selection:bg-accent-cyan/30 selection:text-white">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] left-[10%] w-[35%] h-[35%] rounded-full bg-accent-purple/10 blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[45%] h-[45%] rounded-full bg-accent-cyan/10 blur-[150px]" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8 relative z-10">
        <DashboardSidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-8 min-w-0">
          
          {/* Header Card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[80px] group-hover:bg-accent-cyan/20 transition-colors duration-500"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-text-primary/5 border border-text-primary/10 text-xs font-bold text-text-primary/70 mb-4">
                <Shield size={14} className="text-accent-purple" /> Live Insights
              </div>
              <h2 className="text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-text-primary/60 mb-2 flex items-center gap-3">
                 Performance Matrix
              </h2>
              <p className="text-text-primary/50 text-lg">Real-time telemetry and engagement metrics for your published assets.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-text-primary/5 border border-text-primary/10 rounded-2xl p-1 relative z-10 shadow-inner">
              {['Lifetime'].map((period, i) => (
                <button key={period} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white/10 text-white shadow-lg border border-white/5">
                  {period}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-40 animate-pulse bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-xl"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Core Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Total Impressions', value: stats.views, icon: <Eye size={22} />, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', border: 'group-hover:border-accent-cyan/30' },
                  { label: 'Asset Copies', value: stats.downloads, icon: <Download size={22} />, color: 'text-accent-purple', bg: 'bg-accent-purple/10', border: 'group-hover:border-accent-purple/30' },
                  { label: 'Total Likes', value: stats.likes, icon: <Heart size={22} />, color: 'text-accent-pink', bg: 'bg-accent-pink/10', border: 'group-hover:border-accent-pink/30' },
                  { label: 'Saves / Bookmarks', value: stats.saves, icon: <Bookmark size={22} />, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'group-hover:border-amber-400/30' },
                  { label: 'Active Followers', value: stats.followers, icon: <Users size={22} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'group-hover:border-emerald-400/30' },
                  { label: 'Published Styles', value: stats.uploads, icon: <Activity size={22} />, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'group-hover:border-blue-400/30' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${stat.border}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                        {stat.icon}
                      </div>
                      <span className="flex items-center gap-1 text-xs font-bold text-text-primary/30 bg-text-primary/5 px-3 py-1.5 rounded-xl border border-text-primary/10">
                        <TrendingUp size={12} /> Live
                      </span>
                    </div>
                    <div className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md">
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-text-primary/40 text-sm font-bold uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Data Visualization Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Engagement Distribution */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-accent-pink/10 text-accent-pink"><TrendingUp size={20} /></div>
                    <div>
                      <h3 className="text-xl font-heading font-black text-white">Engagement Breakdown</h3>
                      <p className="text-text-primary/40 text-xs">Relative distribution of user interactions</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[
                      { label: 'Impressions', value: stats.views, color: 'from-accent-cyan/80 to-blue-500/80', icon: <Eye size={14}/> },
                      { label: 'Likes', value: stats.likes, color: 'from-accent-pink/80 to-rose-500/80', icon: <Heart size={14}/> },
                      { label: 'Saves', value: stats.saves, color: 'from-amber-400/80 to-orange-500/80', icon: <Bookmark size={14}/> },
                      { label: 'Copies', value: stats.downloads, color: 'from-accent-purple/80 to-indigo-500/80', icon: <Download size={14}/> }
                    ].map((item, i) => (
                      <div key={i} className="relative group">
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-text-primary/70 flex items-center gap-2">{item.icon} {item.label}</span>
                          <span className="text-white">{item.value.toLocaleString()}</span>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out group-hover:brightness-125`}
                            style={{ width: `${Math.max((item.value / maxEngagementValue) * 100, 2)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Assets */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-amber-400/10 text-amber-400"><Zap size={20} /></div>
                    <div>
                      <h3 className="text-xl font-heading font-black text-white">Top Performing Assets</h3>
                      <p className="text-text-primary/40 text-xs">Styles generating the highest traction</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {topStyles.length > 0 ? topStyles.map((style, i) => {
                      const styleMax = Math.max(style.viewsCount || 0, style.likesCount || 0, 1);
                      return (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group flex items-center gap-4">
                           <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center font-bold text-text-primary/50 group-hover:text-white transition-colors">
                             #{i + 1}
                           </div>
                           <div className="flex-grow min-w-0">
                              <h4 className="text-white font-bold truncate text-sm mb-2">{style.title}</h4>
                              <div className="flex gap-2 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                 <div className="h-full bg-accent-cyan" style={{ width: `${((style.viewsCount || 0)/styleMax)*100}%` }} title={`Views: ${style.viewsCount || 0}`}></div>
                                 <div className="h-full bg-accent-pink" style={{ width: `${((style.likesCount || 0)/styleMax)*100}%` }} title={`Likes: ${style.likesCount || 0}`}></div>
                              </div>
                           </div>
                           <div className="text-right shrink-0">
                              <div className="text-sm font-black text-white">{((style.viewsCount || 0) + (style.likesCount || 0) * 2).toLocaleString()}</div>
                              <div className="text-[10px] text-text-primary/40 uppercase font-bold tracking-wider">Score</div>
                           </div>
                        </div>
                      );
                    }) : (
                      <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-xl">
                        <Layers className="mx-auto text-text-primary/20 mb-2" size={32} />
                        <span className="text-sm text-text-primary/40">No assets published yet</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Dynamic Chart Section (Growth Velocity) */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl shadow-2xl min-h-[450px] flex flex-col relative overflow-hidden">
                <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-accent-purple/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 relative z-10">
                  <div>
                     <h3 className="text-2xl font-heading font-black text-white flex items-center gap-3">
                        <BarChart3 className="text-accent-cyan" size={24} /> Growth Velocity
                     </h3>
                     <p className="text-text-primary/50 text-sm mt-1">Monthly chronological performance mapping based on style publication.</p>
                  </div>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-text-primary/70 text-sm font-medium flex items-center gap-2">
                     <Calendar size={16} className="text-accent-purple"/> Based on Published Date
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col justify-end relative z-10 h-64 mt-auto">
                  {chartData.length > 0 ? (
                    <div className="flex items-end justify-between gap-2 md:gap-4 h-full border-b-2 border-white/10 pb-4 relative">
                      
                      {/* Background grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                        {[1, 2, 3, 4].map(line => (
                           <div key={line} className="w-full h-px bg-white"></div>
                        ))}
                      </div>

                      {chartData.map((d, i) => {
                        const heightPercent = Math.max((d.views / maxViews) * 100, 5);
                        
                        return (
                          <div key={i} className="flex flex-col items-center gap-3 flex-1 group relative h-full justify-end">
                             {/* Hover Tooltip */}
                             <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 bg-black/80 backdrop-blur-md text-white text-xs px-4 py-3 rounded-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-none whitespace-nowrap z-20 flex flex-col gap-1">
                                <span className="font-bold text-accent-cyan flex items-center justify-between gap-4">Views: <span>{d.views.toLocaleString()}</span></span>
                                <span className="font-bold text-accent-pink flex items-center justify-between gap-4">Likes: <span>{d.likes.toLocaleString()}</span></span>
                                <span className="font-bold text-text-primary/70 flex items-center justify-between gap-4">Uploads: <span>{d.uploads}</span></span>
                             </div>
                             
                             {/* The Bar */}
                             <div className="w-full relative flex items-end justify-center" style={{ height: '100%' }}>
                                <div 
                                   className="w-full max-w-[50px] bg-gradient-to-t from-accent-purple/40 to-accent-cyan/60 rounded-t-lg transition-all duration-500 ease-out group-hover:from-accent-purple group-hover:to-accent-cyan group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] relative overflow-hidden" 
                                   style={{ height: `${heightPercent}%` }}
                                >
                                   {/* Inner shine */}
                                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine"></div>
                                </div>
                             </div>
                             
                             {/* Label */}
                             <span className="text-[10px] md:text-xs text-text-primary/50 font-bold uppercase tracking-widest">{d.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
                      <BarChart3 size={48} className="text-text-primary/20 mb-4" />
                      <h4 className="text-lg font-bold text-text-primary/60">No Chronological Data</h4>
                      <p className="text-text-primary/40 text-sm max-w-sm mt-2">Publish styles to see your performance growth matrix mapped over time.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Analytics;
