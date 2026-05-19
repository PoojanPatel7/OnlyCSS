import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Bell, Shield, Key, Save } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';

const Settings = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

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
                <SettingsIcon className="text-white/50" /> Account Settings
              </h2>
              <p className="text-white/40">Manage your profile, preferences, and security.</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary py-3 px-6 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Saving...</>
              ) : (
                <><Save size={18} /> Save Changes</>
              )}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Settings Navigation */}
            <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
              {[
                { id: 'profile', label: 'Profile', icon: <User size={16} /> },
                { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
                { id: 'security', label: 'Security', icon: <Shield size={16} /> },
                { id: 'api', label: 'API Keys', icon: <Key size={16} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                    activeTab === tab.id 
                      ? 'bg-white/10 text-white shadow-lg' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Settings Form Area */}
            <div className="flex-grow bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-heading font-bold text-white border-b border-white/5 pb-4 mb-6">Public Profile</h3>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-accent-purple to-accent-cyan shrink-0">
                      {userData?.photoURL ? (
                        <img src={userData.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-[#050508]" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#050508] border-2 border-[#050508] flex items-center justify-center text-2xl font-bold text-white">
                          {userData?.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex gap-3 mb-2">
                        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Change Avatar</button>
                        <button className="text-white/40 hover:text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Remove</button>
                      </div>
                      <p className="text-white/30 text-xs">Recommended size: 256x256px. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-white/60 text-sm font-bold ml-1">Display Name</label>
                      <input type="text" defaultValue={userData?.displayName || ''} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple transition-colors" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/60 text-sm font-bold ml-1">Username</label>
                      <input type="text" defaultValue={userData?.username || ''} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white/50 focus:outline-none cursor-not-allowed" disabled placeholder="username" />
                      <p className="text-white/20 text-xs ml-1">Usernames cannot be changed.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/60 text-sm font-bold ml-1">Bio</label>
                    <textarea defaultValue={userData?.bio || ''} rows="4" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple transition-colors resize-none" placeholder="Tell the world about yourself..." />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-white/60 text-sm font-bold ml-1">Personal Website</label>
                    <input type="url" defaultValue={userData?.website || ''} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple transition-colors" placeholder="https://yourwebsite.com" />
                  </div>
                </div>
              )}

              {activeTab !== 'profile' && (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <SettingsIcon size={24} className="text-white/20" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 capitalize">{activeTab} Settings</h4>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">This section is currently under construction and will be available soon.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
