import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocFromServer, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isBlocked: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        setUser(authUser);
        if (authUser) {
          try {
            const docRef = doc(db, 'users', authUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const data = docSnap.data();
              setProfile(data);
              if (data.isBlocked) {
                setIsBlocked(true);
                await signOut(auth);
              } else {
                setIsBlocked(false);
              }
            } else {
              // Create initial profile
              const initialProfile = {
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
                role: 'user',
                loyaltyPoints: 0,
                soulPoints: 0,
                isBlocked: false,
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp()
              };
              try {
                await setDoc(docRef, initialProfile);
                setProfile({
                  ...initialProfile,
                  createdAt: new Date().toISOString(),
                  lastActive: new Date().toISOString()
                });
                setIsBlocked(false);
              } catch (e) {
                console.error("Error creating user profile:", e);
              }
            }
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
            setProfile(null);
          }
        } else {
          setProfile(null);
          setIsBlocked(false);
        }
      } finally {
        setLoading(false);
      }
    });

    // Safety timeout for loading state
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("AuthContext: Loading state safety net triggered after 3s. Forcing loading to false.");
        setLoading(false);
      }
    }, 3000); // 3 second safety net (reduced from 5s for better UX)

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isBlocked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
