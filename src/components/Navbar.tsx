import { Search, Bell, Moon, Sun, Menu, X, Loader2, Sparkles, Home, Flame, Film, User, LogIn, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearching?: boolean;
  isAiSearch?: boolean;
  setIsAiSearch?: (val: boolean) => void;
  onSelectCategory?: (category: string | null) => void;
  selectedCategory?: string | null;
  notifications?: Notification[];
}

export function Navbar({ 
  theme, 
  toggleTheme, 
  searchQuery, 
  setSearchQuery, 
  isSearching, 
  isAiSearch, 
  setIsAiSearch,
  onSelectCategory,
  selectedCategory
,
  notifications = []
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const { user, logout } = useAuth();

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = () => {
    setSearchQuery(localSearch);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleHomeClick = () => {

    setSearchQuery('');
    if (onSelectCategory) onSelectCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
  };

  const isSearchActive = isMobileSearchFocused || searchQuery.length > 0;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2.5 sm:py-4 glass-panel bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10' 
          : 'py-3 sm:py-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-8">
          
          {/* Logo & Brand */}
          <button 
            onClick={handleHomeClick}
            className={`flex items-center gap-2 group text-left shrink-0 transition-all duration-300 ${isSearchActive ? 'w-0 opacity-0 md:w-auto md:opacity-100 overflow-hidden pointer-events-none md:pointer-events-auto' : 'w-auto opacity-100'}`}
          >
            <div className="flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span 
                className="text-4xl sm:text-5xl tracking-normal leading-none" 
                style={{ 
                  fontFamily: '"Anton", sans-serif',
                  color: '#E50914',
                  transform: 'scaleY(1.15) scaleX(0.95)', 
                  textShadow: '2px 2px 0px #83050C, 4px 4px 10px rgba(229, 9, 20, 0.4)'
                }}
              >
                LZ
              </span>
            </div>
            <span className="font-display font-bold text-lg sm:text-2xl tracking-wide text-zinc-900 dark:text-white transition-all duration-300">
              LayarZona
            </span>
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative group items-center">
            <button 
              type="button"
              onClick={handleSearchSubmit}
              className="absolute inset-y-0 left-0 pl-4 flex items-center cursor-pointer z-10"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
              ) : isAiSearch ? (
                <Sparkles className="h-5 w-5 text-[var(--color-primary-yellow)] animate-pulse hover:scale-110 transition-transform" />
              ) : (
                <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-[var(--color-primary-red)] transition-all hover:text-[var(--color-primary-red)] hover:scale-110" />
              )}
            </button>
            <input
              type="text"
              placeholder={isAiSearch ? "Tanya AI (misal: film komedi romantis terbaik 2025)..." : "Cari judul film, genre, atau artis..."}
              className={`w-full pl-12 ${localSearch ? 'pr-32' : 'pr-28'} py-2.5 sm:py-3 rounded-full bg-black/5 dark:bg-white/10 border ${
                isAiSearch 
                  ? 'border-[var(--color-primary-yellow)]/60 focus:ring-[var(--color-primary-yellow)]' 
                  : 'border-zinc-200 dark:border-white/10 focus:ring-[var(--color-primary-red)]'
              } text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-md text-sm`}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
                className="absolute right-20 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="absolute right-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-primary-red)] text-white hover:bg-red-700 transition-all cursor-pointer shadow-lg shadow-red-600/20"
            >
              Cari
            </button>
          </div>

          {/* Mobile Search Input Header */}
          <div className={`flex md:hidden items-center justify-end transition-all duration-300 ${isSearchActive ? 'flex-1' : ''}`}>
            <div className={`relative transition-all duration-300 ${isSearchActive ? 'w-full' : 'w-[140px]'}`}>
              <input
                type="text"
                placeholder={isAiSearch ? "Tanya AI..." : "Cari film..."}
                className={`w-full pl-8 pr-10 py-2 rounded-full bg-black/10 dark:bg-white/10 border ${
                  isAiSearch ? 'border-[var(--color-primary-yellow)]/60 focus:ring-[var(--color-primary-yellow)]' : 'border-zinc-300 dark:border-white/15 focus:ring-[var(--color-primary-red)]'
                } text-xs text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1`}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
                onFocus={() => setIsMobileSearchFocused(true)}
                onBlur={() => setIsMobileSearchFocused(false)}
              />
              <button 
                type="button"
                onClick={handleSearchSubmit}
                className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer z-10"
              >
                {isSearching ? (
                  <Loader2 className="h-3.5 w-3.5 text-zinc-400 animate-spin" />
                ) : isAiSearch ? (
                  <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary-yellow)] hover:scale-110 transition-transform" />
                ) : (
                  <Search className="h-3.5 w-3.5 text-zinc-400 hover:text-[var(--color-primary-red)] hover:scale-110 transition-all" />
                )}
              </button>
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setSearchQuery('');
                  }}
                  className="absolute right-7 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {setIsAiSearch && (
                <button
                  type="button"
                  onClick={() => setIsAiSearch(!isAiSearch)}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[10px] font-bold ${
                    isAiSearch ? 'text-[var(--color-primary-yellow)]' : 'text-zinc-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Links for Logged in Users */}
          {user && (
            <div className="hidden md:flex items-center gap-2 mr-2">
              <button
                onClick={() => {
                  document.getElementById('section-history')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors text-sm font-medium cursor-pointer"
                title="Riwayat Tontonan"
              >
                <span className="hidden lg:inline">Riwayat</span>
              </button>
              <button
                onClick={() => {
                  document.getElementById('section-watchlist')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors text-sm font-medium cursor-pointer"
                title="Daftar Tontonan"
              >
                <span className="hidden lg:inline">Watchlist</span>
              </button>
            </div>
          )}

          {/* Right Action Iconscons (Theme, Notifications, Profile) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative text-zinc-800 dark:text-white"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[var(--color-primary-yellow)] ring-2 ring-white dark:ring-black"></span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl overflow-hidden shadow-2xl bg-zinc-900/95 text-white border border-white/10"
                  >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <h3 className="font-semibold font-display text-sm">Notifikasi Film</h3>
                      <span className="text-[11px] text-[var(--color-primary-yellow)] font-medium bg-[var(--color-primary-yellow)]/10 px-2 py-0.5 rounded-full">{unreadCount} Baru</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-3.5 border-b border-white/5 hover:bg-white/5 transition-colors ${notif.unread ? 'bg-white/5' : ''}`}>
                          <div className="flex gap-3">
                            <div className="mt-1">
                              {notif.type === 'release' ? 
                                <div className="w-2 h-2 rounded-full bg-[var(--color-primary-red)]" /> : 
                                <div className="w-2 h-2 rounded-full bg-[var(--color-primary-yellow)]" />
                              }
                            </div>
                            <div>
                              <p className="text-xs leading-relaxed text-zinc-200">{notif.message}</p>
                              <span className="text-[10px] text-zinc-500 mt-1 block">{notif.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-zinc-800 dark:text-white"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-[var(--color-primary-yellow)]" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowNotifications(false);
                  }}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--color-primary-red)] to-[var(--color-primary-yellow)] p-[2px] transition-all hover:scale-105 active:scale-95 focus:outline-none hover:shadow-lg hover:shadow-red-500/20 block"
                >
                  <div className="w-full h-full rounded-full border border-white dark:border-black overflow-hidden bg-zinc-800">
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'User')}`} 
                      alt="User" 
                      className="w-full h-full object-cover transition-transform hover:scale-110" 
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-4 z-50 text-left"
                    >
                      {/* User profile info */}
                      <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-white/10 mb-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border-2 border-[var(--color-primary-red)]">
                          <img 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'User')}`} 
                            alt="User" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold font-display text-sm text-zinc-900 dark:text-white truncate">
                            {user.displayName || 'Member LayarZona'}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      {/* Quick Stats or Status */}
                      <div className="bg-gradient-to-r from-red-600/10 to-amber-600/10 border border-red-500/20 dark:border-red-500/30 rounded-xl p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-red-600 dark:text-red-400 tracking-wider uppercase">VIP PREMIUM</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/10 dark:bg-red-600/30 text-red-600 dark:text-red-200 font-bold">Aktif</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-1">Akses bebas iklan, kecepatan server premium & streaming 4K HDR</p>
                      </div>

                      {/* Actions */}
                      <div className="space-y-1">
                        <button 
                          onClick={() => {
                            setShowProfileDropdown(false);
                            // Smooth scroll to latest movies
                            const el = document.getElementById('section-terbaru');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white flex items-center gap-2.5"
                        >
                          <Film className="w-4 h-4 text-zinc-400" />
                          <span className="font-medium">Daftar Tontonan Saya</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setShowProfileDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white flex items-center gap-2.5"
                        >
                          <User className="w-4 h-4 text-zinc-400" />
                          <span className="font-medium">Pengaturan Akun</span>
                        </button>

                        <div className="h-[1px] bg-zinc-100 dark:bg-white/10 my-2" />

                        <button 
                          onClick={() => {
                            setShowProfileDropdown(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar Sesi</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary-red)] hover:bg-red-700 active:scale-95 transition-all duration-300 rounded-full shadow-lg shadow-red-500/20 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </button>
            )}
          </div>

          {/* Mobile Header Buttons */}
          <div className={`flex items-center gap-1 md:hidden transition-all duration-300 overflow-hidden ${isSearchActive ? 'w-0 opacity-0 pointer-events-none' : 'w-16 opacity-100'}`}>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-zinc-800 dark:text-white shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--color-primary-yellow)]" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button 
              className="p-2 text-zinc-800 dark:text-white shrink-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-2xl pt-24 px-5 md:hidden overflow-y-auto text-white flex flex-col"
          >
            <div className="flex flex-col gap-6 py-4 max-w-md mx-auto w-full">
              
              {/* Profile Header (Login) */}
              {user ? (
                <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/5 rounded-2xl gap-4">
                  <div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden border-2 border-[var(--color-primary-red)] shadow-lg shadow-red-500/20">
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'User')}`} 
                      alt="User" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{user.displayName || 'Member LayarZona'}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{user.email}</p>
                    <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 font-bold mt-2">VIP PREMIUM</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-500 dark:text-red-400 font-bold rounded-xl mt-2 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Sesi</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/5 rounded-2xl gap-4">
                  <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-[var(--color-primary-red)] shadow-lg shadow-red-500/20">
                    <User className="w-8 h-8 text-zinc-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">Belum Login</h3>
                    <p className="text-xs text-zinc-400 mt-1">Login untuk menyimpan daftar tontonan</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3 bg-[var(--color-primary-red)] text-white font-bold rounded-xl mt-2 hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Login Sekarang
                  </button>
                </div>
              )}

              {/* Settings Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">Pengaturan</h4>
                
                <button 
                  onClick={toggleTheme} 
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium transition-colors"
                >
                  <span className="flex items-center gap-3">
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-[var(--color-primary-yellow)]" /> : <Moon className="w-5 h-5" />}
                    <span>Mode Tampilan</span>
                  </span>
                  <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-zinc-300 capitalize">{theme}</span>
                </button>

                {/* Notifications Dummy Toggle (Opsional) */}
                <button 
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-zinc-400" />
                    <span>Notifikasi</span>
                  </span>
                </button>
              </div>

              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full p-4 mt-auto text-center font-semibold text-zinc-400 hover:text-white bg-white/5 rounded-2xl border border-white/5"
              >
                Kembali
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (App Bar) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button 
          onClick={handleHomeClick}
          className={`flex flex-col items-center gap-1 p-1.5 transition-all w-16 ${
            !isMobileMenuOpen && !searchQuery && !selectedCategory ? 'text-[var(--color-primary-red)]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Beranda</span>
        </button>

        <button 
          onClick={() => {
            setIsMobileMenuOpen(true);
          }}
          className={`flex flex-col items-center gap-1 p-1.5 transition-all w-16 ${isMobileMenuOpen ? 'text-[var(--color-primary-red)]' : 'text-zinc-400 hover:text-white'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Profil</span>
        </button>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
