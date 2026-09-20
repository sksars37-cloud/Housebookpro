import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  disableNetwork,
  enableNetwork,
  getDocFromServer,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { SAMPLE_PROPERTIES } from '../data/sampleListings';
import { Property, UserProfile } from '../types';

// Resolve Firebase configuration with environment variable override support
const resolvedConfig = {
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || (firebaseConfig as any)?.projectId || 'housebook-realty-demo',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || (firebaseConfig as any)?.appId || '1:00000000000:web:0000000000000000000000',
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || (firebaseConfig as any)?.apiKey || 'AIzaSyDummyKeyForBuildVerificationOnly000',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfig as any)?.authDomain || 'housebook-realty-demo.firebaseapp.com',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfig as any)?.storageBucket || 'housebook-realty-demo.appspot.com',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfig as any)?.messagingSenderId || '000000000000',
  firestoreDatabaseId: (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID || (firebaseConfig as any)?.firestoreDatabaseId || '(default)'
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(resolvedConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Check if running with a real configured Firebase project vs demo placeholder
export const isFirebaseConfigured = Boolean(
  resolvedConfig.apiKey &&
  !resolvedConfig.apiKey.includes('Dummy') &&
  resolvedConfig.apiKey.length > 20 &&
  resolvedConfig.projectId &&
  resolvedConfig.projectId !== 'housebook-realty-demo' &&
  !resolvedConfig.projectId.includes('demo')
);

// If running with placeholder / demo credentials, operate in offline mode to prevent network connection failures
if (!isFirebaseConfigured) {
  try {
    disableNetwork(db).catch(() => {
      // Offline mode active
    });
  } catch (e) {
    // Offline mode initialized
  }
}

// Error handling types and helper matching Firebase security specifications
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const err = error as any;
  const authUser = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: err?.message || 'Firestore operation error',
    operationType,
    path,
    authInfo: {
      userId: authUser?.uid || null,
      email: authUser?.email || null,
      emailVerified: authUser?.emailVerified || null,
      isAnonymous: authUser?.isAnonymous || null,
      tenantId: authUser?.tenantId || null,
      providerInfo: authUser?.providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email
      })) || []
    }
  };
  throw new Error(JSON.stringify(errorInfo));
}

// Test connection validator for health checks
export async function testConnection(): Promise<void> {
  if (!isFirebaseConfigured) {
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice: The client is currently operating in offline mode.');
    }
  }
}

// Utility to sanitize Firestore objects removing all undefined fields
export function cleanUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const clean: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = cleanUndefinedFields(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// Seed initial properties if collection is empty
export async function seedInitialPropertiesIfEmpty() {
  if (!isFirebaseConfigured) {
    return;
  }
  try {
    const propsCol = collection(db, 'properties');
    const snapshot = await getDocs(propsCol);
    if (snapshot.empty) {
      for (const prop of SAMPLE_PROPERTIES) {
        await setDoc(doc(db, 'properties', prop.id), cleanUndefinedFields(prop));
      }
    }
  } catch (error) {
    console.warn('Firestore seed check notice:', error);
  }
}

// User Profile helper with graceful offline resilience
export async function syncUserProfile(firebaseUser: FirebaseUser, additionalData?: Partial<UserProfile>): Promise<UserProfile> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  
  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        try {
          await updateDoc(userRef, {
            updatedAt: Date.now(),
            ...(additionalData || {})
          });
        } catch {}
        return { ...data, ...(additionalData || {}) };
      }
    } catch (err) {
      console.warn('User profile fetch notice (operating with local state):', err);
    }
  }

  // Fallback to local storage profile if exists
  try {
    const localUser = localStorage.getItem('housebook_mock_user');
    if (localUser) {
      const parsed = JSON.parse(localUser);
      if (parsed.uid === firebaseUser.uid) {
        const updated = { ...parsed, ...(additionalData || {}), updatedAt: Date.now() };
        localStorage.setItem('housebook_mock_user', JSON.stringify(updated));
        return updated;
      }
    }
  } catch {}

  // New user profile
  const newProfile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || `guest_${firebaseUser.uid.slice(0, 5)}@housebook.com`,
    displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? `House Hunter #${firebaseUser.uid.slice(0, 4)}` : 'HouseBook Member'),
    photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
    phone: additionalData?.phone || '+91 98000 12345',
    bio: additionalData?.bio || 'Looking for modern, spacious homes on HouseBook.',
    role: additionalData?.role || 'buyer',
    coins: 50, // 50 Welcome bonus coins
    subscriptionTier: 'free',
    savedProperties: [],
    unlockedContacts: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...(additionalData || {})
  };

  try {
    localStorage.setItem('housebook_mock_user', JSON.stringify(newProfile));
  } catch {}

  if (isFirebaseConfigured) {
    try {
      await setDoc(userRef, newProfile);
      await addDoc(collection(db, 'notifications'), {
        userId: firebaseUser.uid,
        title: 'Welcome to HouseBook!',
        message: 'You received 50 Welcome Coins. Watch ads or explore featured properties to earn more!',
        type: 'coin',
        read: false,
        createdAt: Date.now()
      });
      await addDoc(collection(db, 'coin_transactions'), {
        userId: firebaseUser.uid,
        amount: 50,
        type: 'welcome_bonus',
        description: 'Welcome to HouseBook signup reward',
        createdAt: Date.now()
      });
    } catch {}
  }

  return newProfile;
}

export {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  disableNetwork,
  enableNetwork,
  getDocFromServer
};
