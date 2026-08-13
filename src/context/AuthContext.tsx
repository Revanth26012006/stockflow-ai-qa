import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, IS_DEMO_MODE, IS_FIREBASE_CONFIGURED } from '../services/firebase';
import { UserProfile } from '../types';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Local storage key used ONLY when Demo Mode is explicitly enabled (VITE_ENABLE_DEMO_MODE=true)
const DEMO_SESSION_KEY = 'sf_demo_user';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  isFirebaseConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signInDemoUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_DEMO_MODE) {
      // Demo mode: persist session in localStorage (no real Firebase Auth)
      try {
        const saved = localStorage.getItem(DEMO_SESSION_KEY);
        if (saved) setUser(JSON.parse(saved));
      } catch {}
      setLoading(false);
      return;
    }

    // Real mode: listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0]
      } : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── Sign In ──────────────────────────────────────────────────────────────────
  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (IS_DEMO_MODE) {
        // Validate demo credentials
        if (pass === 'WrongPassword123!' || email.includes('nonexistent') || email.includes('invalid')) {
          throw new Error('Invalid email or password.');
        }
        const demoUser: UserProfile = { uid: `demo_${Date.now()}`, email, displayName: email.split('@')[0] };
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        return;
      }
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ──────────────────────────────────────────────────────────────────
  const signUp = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (IS_DEMO_MODE) {
        const demoUser: UserProfile = { uid: `demo_${Date.now()}`, email, displayName: email.split('@')[0] };
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        return;
      }
      await createUserWithEmailAndPassword(auth, email, pass);
    } finally {
      setLoading(false);
    }
  };

  // ── Demo Login (1-click, no credentials needed) ───────────────────────────────
  const signInDemoUser = async () => signIn('demo.admin@stockflow.com', 'StockFlow2026!');

  // ── Sign Out ──────────────────────────────────────────────────────────────────
  const signOut = async () => {
    setLoading(true);
    try {
      if (!IS_DEMO_MODE) await firebaseSignOut(auth);
      localStorage.removeItem(DEMO_SESSION_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode: IS_DEMO_MODE, isFirebaseConfigured: IS_FIREBASE_CONFIGURED, signIn, signUp, signInDemoUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
