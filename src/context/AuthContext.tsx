import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  fetchUserProfileFromFirestore,
  syncUserProfileToFirestore
} from '../utils/firebase';
import { UserStats } from '../types/typing';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncStats: (stats: UserStats) => Promise<void>;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  syncStats: async () => {},
  isSyncing: false,
  lastSyncedAt: null,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
  onProfileLoaded?: (stats: UserStats) => void;
  currentStats: UserStats;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  onProfileLoaded,
  currentStats,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          setIsSyncing(true);
          const cloudStats = await fetchUserProfileFromFirestore(firebaseUser.uid);
          if (cloudStats && onProfileLoaded) {
            onProfileLoaded(cloudStats);
            setLastSyncedAt(new Date());
          } else {
            // First time user: save initial local stats to cloud
            await syncUserProfileToFirestore(firebaseUser, currentStats);
            setLastSyncedAt(new Date());
          }
        } catch (err) {
          console.error('Error fetching cloud profile:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setError(null);
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        setIsSyncing(true);
        const cloudStats = await fetchUserProfileFromFirestore(loggedUser.uid);
        if (cloudStats && onProfileLoaded) {
          onProfileLoaded(cloudStats);
        } else {
          await syncUserProfileToFirestore(loggedUser, currentStats);
        }
        setLastSyncedAt(new Date());
      }
    } catch (err) {
      console.error('Sign-in failed:', err);
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.error('Sign-out failed:', err);
      setError(err instanceof Error ? err.message : 'Sign-out failed');
    }
  };

  const syncStats = useCallback(
    async (statsToSync: UserStats) => {
      if (!user) return;
      try {
        setIsSyncing(true);
        await syncUserProfileToFirestore(user, statsToSync);
        setLastSyncedAt(new Date());
      } catch (err) {
        console.error('Sync failed:', err);
      } finally {
        setIsSyncing(false);
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        syncStats,
        isSyncing,
        lastSyncedAt,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
