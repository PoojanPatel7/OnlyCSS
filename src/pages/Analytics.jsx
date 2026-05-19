import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, Users, Eye, MousePointerClick, Calendar } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';

const Analytics = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    // Simulate loading data
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#050508] relative font-sans pb-20">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-accent-purple/5 blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-accent-cyan/5 blur-[150px]" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8 relative z-10">
        <DashboardSidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-6 min-w-0">
          
          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-white mb-2 flex items-center gap-3">
                <Activity className="text-accent-cyan" /> Analytics Overview
              </h2>
              <p className="text-white/40">Track your performance and audience engagement.</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
              {['7D', '30D', 'All Time'].map((period, i) => (
                <button key={period} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${i === 1 ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                  {period}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 animate-pulse bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-xl"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Total Profile Views', value: '12,405', increase: '+14.5%', icon: <Eye size={20} />, color: 'text-accent-cyan' },
                  { label: 'Total Style Copies', value: '3,842', increase: '+22.1%', icon: <MousePointerClick size={20} />, color: 'text-accent-purple' },
                  { label: 'Followers Gained', value: '489', increase: '+5.4%', icon: <Users size={20} />, color: 'text-accent-pink' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl shadow-lg relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                        <TrendingUp size={12} /> {stat.increase}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight mb-1">{stat.value}</div>
                    <div className="text-white/40 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-heading font-bold text-white">Engagement Over Time</h3>
                  <button className="text-white/40 hover:text-white transition-colors"><Calendar size={20} /></button>
                </div>
                
                <div className="flex-grow flex flex-col items-center justify-center relative">
                  {/* Decorative chart lines */}
                  <div className="w-full h-full absolute inset-0 flex items-end gap-2 opacity-20 px-8">
                    {[40, 60, 30, 80, 50, 90, 70, 100, 60, 80, 40, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-accent-purple to-accent-cyan rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  
                  <div className="relative z-10 text-center p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 max-w-sm">
                    <TrendingUp size={32} className="text-accent-cyan mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">Detailed Charts Coming Soon</h4>
                    <p className="text-white/50 text-sm">We are integrating a premium charting library to bring you beautiful, interactive data visualizations.</p>
                  </div>
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
