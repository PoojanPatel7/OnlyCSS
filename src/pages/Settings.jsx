import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Bell, Shield, Key, Save, CheckCircle2, XCircle, Mail, Smartphone, Zap } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const Toggle = ({ enabled, onChange }) => (
  <button 
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-white/10 border border-white/5'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-md ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const Settings = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    website: '',
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
    }
  });
  
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [displayNameStatus, setDisplayNameStatus] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || '',
        username: userData.username || '',
        bio: userData.bio || '',
        website: userData.website || '',
        preferences: {
          emailNotifications: userData.preferences?.emailNotifications ?? true,
          pushNotifications: userData.preferences?.pushNotifications ?? true,
          marketingEmails: userData.preferences?.marketingEmails ?? false,
        }
      });
    }
  }, [userData]);

  useEffect(() => {
    if (!formData.username || formData.username === userData?.username) {
      setUsernameStatus(null);
      return;
    }

    if (formData.username.length < 3) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const q = query(collection(db, 'users'), where('username', '==', formData.username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameStatus(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.username, userData?.username]);

  useEffect(() => {
    if (!formData.displayName || formData.displayName === userData?.displayName) {
      setDisplayNameStatus(null);
      return;
    }

    if (formData.displayName.length < 2) {
      setDisplayNameStatus('invalid');
      return;
    }

    setDisplayNameStatus('checking');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const q = query(collection(db, 'users'), where('displayName', '==', formData.displayName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setDisplayNameStatus('taken');
        } else {
          setDisplayNameStatus('available');
        }
      } catch (error) {
        console.error("Error checking display name:", error);
        setDisplayNameStatus(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.displayName, userData?.displayName]);

  const canChangeField = (fieldName) => {
    if (!userData) return true;
    const lastChange = userData[fieldName];
    if (!lastChange) return true;
    const now = new Date().getTime();
    const changeTime = lastChange.toMillis ? lastChange.toMillis() : lastChange;
    return (now - changeTime) > (24 * 60 * 60 * 1000);
  };

  const canChangeDisplayName = canChangeField('lastDisplayNameChange');
  const canChangeUsername = canChangeField('lastUsernameChange');

  const handleSave = async () => {
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return;
    if (displayNameStatus === 'taken' || displayNameStatus === 'invalid') return;
    
    setIsSaving(true);
    setMessage(null);
    
    const updates = {
      bio: formData.bio,
      website: formData.website,
      preferences: formData.preferences
    };

    if (formData.displayName !== userData?.displayName) {
      if (!canChangeDisplayName) {
        setMessage({ type: 'error', text: 'Display name can only be changed once every 24 hours.' });
        setIsSaving(false);
        return;
      }
      updates.displayName = formData.displayName;
      updates.lastDisplayNameChange = new Date().getTime();
    }

    if (formData.username !== userData?.username) {
      if (!canChangeUsername) {
        setMessage({ type: 'error', text: 'Username can only be changed once every 24 hours.' });
        setIsSaving(false);
        return;
      }
      updates.username = formData.username;
      updates.lastUsernameChange = new Date().getTime();
    }
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), updates);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#050508] relative font-sans pb-20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,rgba(0,0,0,0)_70%)] animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.05)_0%,rgba(0,0,0,0)_70%)]" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-8 relative z-10">
        <DashboardSidebar />
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-6 min-w-0">
          
          {/* Header Card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/10 to-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-heading font-black text-white mb-2 flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                  <SettingsIcon className="text-accent-cyan" size={20} />
                </div>
                Settings
              </h2>
              <p className="text-text-primary/50 text-sm font-medium">Manage your personal profile and account preferences.</p>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto relative z-10">
              {message && (
                <div className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg ${
                  message.type === 'success' ? 'bg-status-success/10 text-status-success border border-status-success/20' : 'bg-status-danger/10 text-status-danger border border-status-danger/20'
                } animate-fade-in`}>
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {message.text}
                </div>
              )}
              
              <button 
                onClick={handleSave}
                disabled={isSaving || usernameStatus === 'taken' || usernameStatus === 'invalid' || displayNameStatus === 'taken' || displayNameStatus === 'invalid'}
                className="w-full sm:w-auto btn-primary py-3 px-8 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 font-bold tracking-wide"
              >
                {isSaving ? (
                  <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Saving</>
                ) : (
                  <><Save size={18} /> Save Changes</>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Settings Navigation */}
            <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 hide-scrollbar">
              {[
                { id: 'profile', label: 'Public Profile', icon: <User size={18} />, desc: 'Your identity on OnlyCSS' },
                { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, desc: 'Alerts & emails' },
                { id: 'security', label: 'Security', icon: <Shield size={18} />, desc: 'Password & auth' },
                { id: 'api', label: 'Developer API', icon: <Key size={18} />, desc: 'Tokens & webhooks' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all text-left min-w-[200px] lg:min-w-0 group relative overflow-hidden ${
                    activeTab === tab.id 
                      ? 'bg-white/[0.04] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.2)]' 
                      : 'border border-transparent hover:bg-white/[0.02] hover:border-white/5'
                  }`}
                >
                  {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-purple to-accent-cyan"></div>}
                  <div className={`mt-0.5 rounded-lg p-2 ${activeTab === tab.id ? 'bg-gradient-to-br from-accent-purple to-accent-cyan text-white shadow-lg' : 'bg-white/5 text-text-primary/50 group-hover:text-text-primary group-hover:bg-white/10'} transition-all`}>
                    {tab.icon}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${activeTab === tab.id ? 'text-white' : 'text-text-primary/70 group-hover:text-white'}`}>{tab.label}</div>
                    <div className="text-xs text-text-primary/40 mt-0.5 hidden lg:block">{tab.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Settings Form Area */}
            <div className="flex-grow bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              {activeTab === 'profile' && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white mb-1">Public Profile</h3>
                    <p className="text-sm text-text-primary/50">This information will be displayed publicly so be careful what you share.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-accent-purple to-accent-cyan rounded-full blur opacity-20 transition-opacity duration-300"></div>
                      <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-accent-purple to-accent-cyan shrink-0 relative z-10">
                        {userData?.photoURL ? (
                          <img src={userData.photoURL} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover border-4 border-[#0a0a0f]" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-[#0a0a0f] border-4 border-[#0a0a0f] flex items-center justify-center text-3xl font-black text-white">
                            {userData?.displayName?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">Profile Picture</h4>
                      <p className="text-text-primary/40 text-xs font-medium">Your avatar is currently linked to your authentication provider.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-text-primary/70 text-sm font-bold ml-1">Display Name <span className="text-status-danger">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <User size={16} className="text-text-primary/30" />
                        </div>
                        <input 
                          type="text" 
                          value={formData.displayName}
                          disabled={!canChangeDisplayName}
                          onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                          className={`w-full bg-[#0a0a0f]/50 border rounded-xl pl-11 pr-4 py-3.5 text-white font-medium focus:outline-none transition-all shadow-inner ${
                            !canChangeDisplayName ? 'opacity-50 cursor-not-allowed border-white/5' :
                            displayNameStatus === 'taken' ? 'border-status-danger/50 focus:border-status-danger bg-status-danger/5' : 
                            displayNameStatus === 'available' ? 'border-status-success/50 focus:border-status-success bg-status-success/5' : 
                            'border-white/10 focus:border-accent-purple'
                          }`} 
                          placeholder="Jane Doe" 
                        />
                      </div>
                      <div className="flex justify-between items-center px-1 mt-1.5 h-4">
                        <div className="flex items-center gap-1.5">
                          {!canChangeDisplayName ? <><Shield size={12} className="text-text-primary/40" /><span className="text-text-primary/40 text-xs font-medium">Can be changed once every 24 hours.</span></> :
                          displayNameStatus === 'checking' ? <><div className="w-2.5 h-2.5 border-2 border-text-primary/30 border-t-white rounded-full animate-spin"></div><span className="text-text-primary/50 text-xs font-medium">Checking...</span></> :
                          displayNameStatus === 'taken' ? <><XCircle size={12} className="text-status-danger" /><span className="text-status-danger text-xs font-medium">Name taken</span></> :
                          displayNameStatus === 'available' ? <><CheckCircle2 size={12} className="text-status-success" /><span className="text-status-success text-xs font-medium">Name available</span></> :
                          displayNameStatus === 'invalid' ? <><XCircle size={12} className="text-status-danger" /><span className="text-status-danger text-xs font-medium">Too short</span></> :
                          <span className="text-text-primary/40 text-xs">How you appear to others.</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-text-primary/70 text-sm font-bold ml-1">Username <span className="text-status-danger">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <span className="text-text-primary/30 font-bold">@</span>
                        </div>
                        <input 
                          type="text" 
                          value={formData.username}
                          disabled={!canChangeUsername}
                          onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                          className={`w-full bg-[#0a0a0f]/50 border rounded-xl pl-11 pr-4 py-3.5 text-white font-medium focus:outline-none transition-all shadow-inner ${
                            !canChangeUsername ? 'opacity-50 cursor-not-allowed border-white/5' :
                            usernameStatus === 'taken' ? 'border-status-danger/50 focus:border-status-danger bg-status-danger/5' : 
                            usernameStatus === 'available' ? 'border-status-success/50 focus:border-status-success bg-status-success/5' : 
                            'border-white/10 focus:border-accent-purple'
                          }`} 
                          placeholder="janedoe" 
                        />
                      </div>
                      <div className="flex justify-between items-center px-1 mt-1.5 h-4">
                        <div className="flex items-center gap-1.5">
                          {!canChangeUsername ? <><Shield size={12} className="text-text-primary/40" /><span className="text-text-primary/40 text-xs font-medium">Can be changed once every 24 hours.</span></> :
                          usernameStatus === 'checking' ? <><div className="w-2.5 h-2.5 border-2 border-text-primary/30 border-t-white rounded-full animate-spin"></div><span className="text-text-primary/50 text-xs font-medium">Checking...</span></> :
                          usernameStatus === 'taken' ? <><XCircle size={12} className="text-status-danger" /><span className="text-status-danger text-xs font-medium">Username taken</span></> :
                          usernameStatus === 'available' ? <><CheckCircle2 size={12} className="text-status-success" /><span className="text-status-success text-xs font-medium">Username available</span></> :
                          usernameStatus === 'invalid' ? <><XCircle size={12} className="text-status-danger" /><span className="text-status-danger text-xs font-medium">Too short</span></> :
                          <span className="text-text-primary/40 text-xs">Your unique profile URL.</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-text-primary/70 text-sm font-bold ml-1">About You</label>
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 150) {
                          setFormData({...formData, bio: e.target.value});
                        }
                      }}
                      rows="4" 
                      className="w-full bg-[#0a0a0f]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-accent-purple transition-all shadow-inner resize-none" 
                      placeholder="I'm a frontend developer passionate about UI/UX..." 
                    />
                    <div className="flex justify-between px-1">
                      <p className="text-text-primary/40 text-xs">Brief description for your profile. URLs are hyperlinked.</p>
                      <p className={`text-xs font-bold ${formData.bio.length === 150 ? 'text-status-danger' : 'text-text-primary/30'}`}>{formData.bio.length}/150</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-text-primary/70 text-sm font-bold ml-1">Personal Website / Portfolio</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Zap size={16} className="text-text-primary/30" />
                      </div>
                      <input 
                        type="url" 
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className="w-full bg-[#0a0a0f]/50 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white font-medium focus:outline-none focus:border-accent-purple transition-all shadow-inner" 
                        placeholder="https://yourwebsite.com" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white mb-1">Notification Preferences</h3>
                    <p className="text-sm text-text-primary/50">Control how and when you want to be notified by OnlyCSS.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl transition-colors hover:bg-white/[0.04]">
                      <div className="p-3 bg-accent-purple/10 rounded-xl border border-accent-purple/20 text-accent-purple shrink-0">
                        <Mail size={20} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-white font-bold text-sm">Email Notifications</h4>
                          <Toggle 
                            enabled={formData.preferences.emailNotifications} 
                            onChange={(val) => handlePreferenceChange('emailNotifications', val)} 
                          />
                        </div>
                        <p className="text-text-primary/50 text-xs leading-relaxed">Receive emails about your account activity, security alerts, and weekly style digests.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl transition-colors hover:bg-white/[0.04]">
                      <div className="p-3 bg-accent-cyan/10 rounded-xl border border-accent-cyan/20 text-accent-cyan shrink-0">
                        <Bell size={20} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-white font-bold text-sm">In-App Notifications</h4>
                          <Toggle 
                            enabled={formData.preferences.pushNotifications} 
                            onChange={(val) => handlePreferenceChange('pushNotifications', val)} 
                          />
                        </div>
                        <p className="text-text-primary/50 text-xs leading-relaxed">Get instant alerts within the app when someone likes, saves, or comments on your CSS styles.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl transition-colors hover:bg-white/[0.04]">
                      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500 shrink-0">
                        <Smartphone size={20} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-white font-bold text-sm">Marketing & Offers</h4>
                          <Toggle 
                            enabled={formData.preferences.marketingEmails} 
                            onChange={(val) => handlePreferenceChange('marketingEmails', val)} 
                          />
                        </div>
                        <p className="text-text-primary/50 text-xs leading-relaxed">Receive occasional updates on new platform features, premium templates, and partner offers.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {['security', 'api'].includes(activeTab) && (
                <div className="h-80 flex flex-col items-center justify-center text-center animate-fade-in relative z-10">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050508]/50 rounded-xl z-0"></div>
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative z-10">
                    {activeTab === 'security' ? <Shield size={32} className="text-text-primary/30" /> : <Key size={32} className="text-text-primary/30" />}
                  </div>
                  <h4 className="text-2xl font-heading font-black text-white mb-2 capitalize relative z-10">{activeTab} Settings</h4>
                  <p className="text-text-primary/40 text-sm max-w-sm mx-auto relative z-10 leading-relaxed">This powerful new feature is currently being crafted in our labs. Check back in the next update!</p>
                  
                  <button className="mt-8 px-6 py-2 rounded-xl bg-white/5 text-white font-bold text-sm border border-white/10 hover:bg-white/10 transition-colors relative z-10" onClick={() => setActiveTab('profile')}>
                    Return to Profile
                  </button>
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
