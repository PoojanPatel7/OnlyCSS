import { useState, useEffect } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Users, Grid, Eye } from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    users: 0,
    styles: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersCol = collection(db, 'users');
        const stylesCol = collection(db, 'styles');
        
        const [usersSnap, stylesSnap] = await Promise.all([
          getCountFromServer(usersCol),
          getCountFromServer(stylesCol)
        ]);

        setStats({
          users: usersSnap.data().count,
          styles: stylesSnap.data().count,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20' },
    { label: 'Total Styles', value: stats.styles, icon: Grid, color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/20' },
    { label: 'Platform Views', value: 'N/A', icon: Eye, color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
  ];

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/10 border-t-accent-purple rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-white/50 font-mono text-sm uppercase tracking-wider">Platform Statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.border} backdrop-blur-xl relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <p className="text-white/50 font-mono text-sm uppercase tracking-wider mb-2">{stat.label}</p>
              <h3 className="text-4xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
