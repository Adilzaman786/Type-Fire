import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserStats } from '../types/typing';

const app = initializeApp(firebaseConfig);

// Configure Firestore with long polling to ensure reliable connectivity across iframes and proxies
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

// Silence internal retry/unavailable notices so they do not trigger erroneous console alerts
setLogLevel('silent');

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Graceful fallback: client continues smoothly in offline mode
  }
}

// Run connection probe safely after hydration
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 1500);
}

// Sign in with Google Popup
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in Error:', error);
    throw error;
  }
}

// Sign out
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out Error:', error);
    throw error;
  }
}

// Save or Sync full user profile & typing stats to Firestore
export async function syncUserProfileToFirestore(user: User, stats: UserStats): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const payload = {
      userId: user.uid,
      displayName: user.displayName || 'AZ Typist',
      email: user.email || 'user@aztyping.fire',
      photoURL: user.photoURL || '',
      xp: stats.xp,
      level: stats.level,
      bestWpm: stats.bestWpm,
      avgWpm: stats.avgWpm,
      avgAccuracy: stats.avgAccuracy,
      totalWordsTyped: stats.totalWordsTyped,
      totalTestsCompleted: stats.totalTestsCompleted,
      totalPracticeTimeSeconds: stats.totalPracticeTimeSeconds,
      dailyStreak: stats.dailyStreak,
      lastActiveDate: stats.lastActiveDate,
      problemKeys: stats.problemKeys || {},
      unlockedAchievements: stats.unlockedAchievements || [],
      lessonProgress: stats.lessonProgress || {},
      gameScores: stats.gameScores || {},
      history: (stats.history || []).slice(0, 20),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch user profile & typing stats from Firestore
export async function fetchUserProfileFromFirestore(userId: string): Promise<UserStats | null> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      xp: data.xp ?? 150,
      level: data.level ?? 1,
      totalWordsTyped: data.totalWordsTyped ?? 0,
      totalTestsCompleted: data.totalTestsCompleted ?? 0,
      totalPracticeTimeSeconds: data.totalPracticeTimeSeconds ?? 0,
      bestWpm: data.bestWpm ?? 0,
      avgWpm: data.avgWpm ?? 0,
      avgAccuracy: data.avgAccuracy ?? 100,
      dailyStreak: data.dailyStreak ?? 1,
      lastActiveDate: data.lastActiveDate ?? new Date().toISOString().split('T')[0],
      problemKeys: data.problemKeys ?? {},
      unlockedAchievements: data.unlockedAchievements ?? [],
      lessonProgress: data.lessonProgress ?? {},
      gameScores: data.gameScores ?? {
        meteor: 0,
        racer: 0,
        bubbles: 0,
        invaders: 0,
        defense: 0,
        runner: 0,
      },
      history: data.history ?? [],
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}
