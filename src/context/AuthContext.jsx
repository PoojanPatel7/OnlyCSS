import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider, githubProvider, db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync user profile from Firestore real-time
  useEffect(() => {
    let unsubscribeSnapshot;

    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid);
      
      unsubscribeSnapshot = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Emergency override for known admin email to prevent lockout
          if (currentUser.email === 'panchasarapoojan2004@gmail.com' || currentUser.email === 'panchasarapooijan2004@gmail.com') {
            data.role = 'super_admin';
          }
          setUserData(data);
        } else {
          // New user login via OAuth, we need to create profile
          const newUserData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || '',
            username: '',
            photoURL: currentUser.photoURL || '',
            rankTier: 'bronze',
            rankPoints: 0,
            joinedAt: serverTimestamp(),
            isProfileComplete: false,
            role: 'user', // Default role is standard user
          };
          try {
            await setDoc(docRef, newUserData);
            // setDoc will trigger the snapshot again
          } catch (error) {
            console.error("Error creating user data:", error);
            setAuthError("SET_DOC_ERROR: " + error.message);
          }
        }
      }, (error) => {
        console.error("Error listening to user data:", error);
        setAuthError("ON_SNAPSHOT_ERROR: " + error.message);
      });
    } else {
      setUserData(null);
      setAuthError(null);
    }

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const loginWithGithub = () => {
    return signInWithPopup(auth, githubProvider);
  };

  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userData,
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    registerWithEmail,
    logout,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
