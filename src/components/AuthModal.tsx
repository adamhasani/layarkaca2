import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Sparkles, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!username || !password) {
      setFormError('Harap isi semua bidang.');
      return;
    }

    if (mode === 'register' && !displayName) {
      setFormError('Harap masukkan nama lengkap Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(username, password);
      } else {
        await signUp(username, password, displayName);
      }
      onClose();
      // Reset form
      setUsername('');
      setPassword('');
      setDisplayName('');
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#050505]/70 backdrop-blur-md"
        />

        {/* Modal container - Double Bezel Premium Layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-md bg-zinc-50/5 p-2 rounded-[2rem] ring-1 ring-white/10 hover:shadow-3xl transition-shadow duration-500 overflow-hidden z-10"
        >
          {/* Inner core */}
          <div className="bg-white dark:bg-[#09090b] rounded-[calc(2rem-0.5rem)] p-6 sm:p-8 border border-zinc-200/50 dark:border-white/5 shadow-2xl relative">
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo & Headline */}
            <div className="text-center mb-6 mt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary-red)]/10 border border-[var(--color-primary-red)]/20 text-[var(--color-primary-red)] text-xs font-bold tracking-wider uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LayarZona Premium</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-900 dark:text-white leading-tight">
                {mode === 'login' ? 'Selamat Datang Kembali' : 'Mulai Streaming Sekarang'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                {mode === 'login' 
                  ? 'Masuk ke akun Anda untuk melanjutkan maraton film tanpa gangguan' 
                  : 'Buat akun gratis untuk menyimpan bookmark dan streaming kualitas ultra HD'}
              </p>
            </div>

            {/* Error Message */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium"
              >
                {formError}
              </motion.div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider pl-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[var(--color-primary-red)] transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider pl-1">
                  Nama Pengguna (Username)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: adamhasani"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[var(--color-primary-red)] transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider pl-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[var(--color-primary-red)] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold overflow-hidden hover:scale-[0.98] active:scale-95 transition-all duration-300 shadow-xl shadow-red-600/5 text-sm cursor-pointer mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'login' ? (
                  <>
                    <div className="w-7 h-7 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                      <LogIn className="w-3.5 h-3.5" />
                    </div>
                    <span>Masuk Akun</span>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                      <UserPlus className="w-3.5 h-3.5" />
                    </div>
                    <span>Daftar Akun</span>
                  </>
                )}
              </button>
            </form>

            {/* Social Sign-In (Google) */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-white/10" />
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Atau</span>
                <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-white/10" />
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-white/5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[0.98] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="text-center mt-6 pt-4 border-t border-zinc-100 dark:border-white/5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {mode === 'login' ? 'Belum punya akun LayarZona?' : 'Sudah terdaftar sebagai member?'}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setFormError(null);
                  }}
                  className="ml-1 text-[var(--color-primary-red)] hover:underline font-bold transition-all"
                >
                  {mode === 'login' ? 'Daftar Sekarang' : 'Masuk di Sini'}
                </button>
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
