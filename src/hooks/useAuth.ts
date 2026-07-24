import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const usernameToEmail = (username: string) => {
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
    if (!cleanUsername) {
      throw new Error('Username tidak boleh kosong dan hanya boleh berisi huruf, angka, titik, strip, atau underscore.');
    }
    return `${cleanUsername}@layarzona.internal`;
  };

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const email = usernameToEmail(username);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Firebase Sign In Error:", err);
      const msg = getFriendlyErrorMessage(err.code || err.message);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const signUp = async (username: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const email = usernameToEmail(username);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: displayName || username
      });
      // Force refresh user to get display name
      setUser({ ...userCredential.user });
    } catch (err: any) {
      console.error("Firebase Sign Up Error:", err);
      const msg = getFriendlyErrorMessage(err.code || err.message);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Firebase Google Sign In Error:", err);
      const msg = getFriendlyErrorMessage(err.code || err.message);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const signInAsGuest = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error("Firebase Guest Sign In Error:", err);
      const msg = getFriendlyErrorMessage(err.code || err.message);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error("Firebase Logout Error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getFriendlyErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Format username tidak valid.';
      case 'auth/user-disabled':
        return 'Akun ini telah dinonaktifkan.';
      case 'auth/user-not-found':
        return 'Username tidak ditemukan.';
      case 'auth/wrong-password':
        return 'Kata sandi salah.';
      case 'auth/email-already-in-use':
        return 'Username ini sudah terdaftar.';
      case 'auth/weak-password':
        return 'Kata sandi terlalu lemah (minimal 6 karakter).';
      case 'auth/invalid-credential':
        return 'Username atau kata sandi salah.';
      case 'auth/popup-closed-by-user':
        return 'Login Google dibatalkan oleh pengguna.';
      case 'auth/operation-not-allowed':
        return 'Metode login (Email/Sandi atau Google) belum diaktifkan di Firebase Console. Silakan aktifkan di tab "Sign-in method" menu Authentication.';
      default:
        return `Terjadi kesalahan sistem (${code}). Silakan coba lagi.`;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signInAsGuest,
    logout,
    setError
  };
}
