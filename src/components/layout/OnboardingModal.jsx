import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { User, Check, X, Loader2, AtSign } from 'lucide-react';

const OnboardingModal = () => {
  const { currentUser, userData } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Username state
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  
  // Display name state
  const [isDisplayNameChecking, setIsDisplayNameChecking] = useState(false);
  const [isDisplayNameAvailable, setIsDisplayNameAvailable] = useState(null);
  const [displayNameError, setDisplayNameError] = useState('');

  useEffect(() => {
    if (currentUser && !displayName) {
      setDisplayName(currentUser.displayName || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!username) {
      setIsAvailable(null);
      setError('');
      return;
    }
    
    // Clean username (no spaces, special chars except underscore)
    const cleanUsername = username.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    if (username !== cleanUsername) {
      setUsername(cleanUsername);
      return;
    }

    if (username.length < 3) {
      setIsAvailable(false);
      setError('Username must be at least 3 characters.');
      return;
    }

    const checkUsername = async () => {
      setIsChecking(true);
      setError('');
      try {
        const q = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setIsAvailable(false);
          setError('This username is already taken.');
        } else {
          setIsAvailable(true);
          setError('');
        }
      } catch (err) {
        console.error("Error checking username:", err);
      } finally {
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  // Check Display Name Uniqueness
  useEffect(() => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setIsDisplayNameAvailable(null);
      setDisplayNameError('');
      return;
    }
    
    if (trimmedName.length < 3) {
      setIsDisplayNameAvailable(false);
      setDisplayNameError('Display name must be at least 3 characters.');
      return;
    }

    const checkDisplayName = async () => {
      setIsDisplayNameChecking(true);
      setDisplayNameError('');
      try {
        const q = query(collection(db, 'users'), where('displayName', '==', trimmedName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setIsDisplayNameAvailable(false);
          setDisplayNameError('This display name is already taken.');
        } else {
          setIsDisplayNameAvailable(true);
          setDisplayNameError('');
        }
      } catch (err) {
        console.error("Error checking display name:", err);
      } finally {
        setIsDisplayNameChecking(false);
      }
    };

    const timeoutId = setTimeout(checkDisplayName, 500);
    return () => clearTimeout(timeoutId);
  }, [displayName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!displayName.trim()) {
      setDisplayNameError('Display name cannot be empty.');
      return;
    }
    if (!isDisplayNameAvailable) {
      setDisplayNameError('Please choose a valid and available display name.');
      return;
    }
    if (!isAvailable) {
      setError('Please choose a valid and available username.');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        username: username,
        displayName: displayName.trim(),
        isProfileComplete: true
      });
      // Force reload to resync state cleanly across app
      window.location.reload();
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
      setLoading(false);
    }
  };

  if (!userData || userData.isProfileComplete !== false) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#050508]/90 backdrop-blur-xl">
      <div className="relative w-full max-w-md bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl animate-scale-in overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-purple bg-[length:200%_auto] animate-gradient-x" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <User className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-heading font-black text-white mb-2">Complete Your Profile</h2>
          <p className="text-text-primary/60 text-sm">Pick a unique username and display name to join the OnlyCSS community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-text-primary/70 uppercase tracking-wider mb-2">
              Display Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. John Doe"
                className={`w-full bg-black/20 border rounded-xl px-4 py-3 pl-11 text-white placeholder-white/30 focus:outline-none transition-all ${
                  isDisplayNameAvailable === true ? 'border-status-success/50 focus:border-status-success' : 
                  isDisplayNameAvailable === false ? 'border-status-danger/50 focus:border-status-danger' : 
                  'border-white/10 focus:border-accent-purple'
                }`}
                required
              />
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isDisplayNameChecking ? (
                  <Loader2 size={18} className="text-accent-purple animate-spin" />
                ) : isDisplayNameAvailable === true ? (
                  <Check size={18} className="text-status-success" />
                ) : isDisplayNameAvailable === false && displayName.trim().length > 0 ? (
                  <X size={18} className="text-status-danger" />
                ) : null}
              </div>
            </div>
            
            {displayNameError ? (
              <p className="mt-2 text-xs text-status-danger font-medium flex items-center gap-1">
                <X size={12} /> {displayNameError}
              </p>
            ) : isDisplayNameAvailable === true ? (
              <p className="mt-2 text-xs text-status-success font-medium flex items-center gap-1">
                <Check size={12} /> Display name is available!
              </p>
            ) : (
              <p className="mt-2 text-xs text-text-primary/40">
                Minimum 3 characters required.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary/70 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className={`w-full bg-black/20 border rounded-xl px-4 py-3 pl-11 text-white placeholder-white/30 focus:outline-none transition-all ${
                  isAvailable === true ? 'border-status-success/50 focus:border-status-success' : 
                  isAvailable === false ? 'border-status-danger/50 focus:border-status-danger' : 
                  'border-white/10 focus:border-accent-cyan'
                }`}
                required
              />
              <AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isChecking ? (
                  <Loader2 size={18} className="text-accent-cyan animate-spin" />
                ) : isAvailable === true ? (
                  <Check size={18} className="text-status-success" />
                ) : isAvailable === false && username.length > 0 ? (
                  <X size={18} className="text-status-danger" />
                ) : null}
              </div>
            </div>
            
            {error ? (
              <p className="mt-2 text-xs text-status-danger font-medium flex items-center gap-1">
                <X size={12} /> {error}
              </p>
            ) : isAvailable === true ? (
              <p className="mt-2 text-xs text-status-success font-medium flex items-center gap-1">
                <Check size={12} /> Username is available!
              </p>
            ) : (
              <p className="mt-2 text-xs text-text-primary/40">
                Minimum 3 characters. Only letters, numbers, and underscores.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isAvailable || !isDisplayNameAvailable}
            className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan font-bold text-white shadow-lg shadow-accent-purple/20 hover:shadow-accent-cyan/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
