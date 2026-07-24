import { Play, Info, Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Movie } from '../types';

interface FeaturedHeroProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
}

function getProxiedImageUrl(url?: string): string {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return '';
  if (url.startsWith('/api/') || url.startsWith('data:')) return url;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

export function FeaturedHero({ movies, onPlay }: FeaturedHeroProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];

  const handlePlayClick = () => {
    setIsClicked(true);
    onPlay(movie);
    setTimeout(() => setIsClicked(false), 1200);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const rawBanner = (movie.bannerUrl && !movie.bannerUrl.includes('unsplash.com')) 
    ? movie.bannerUrl 
    : (movie.posterUrl || 'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg');

  // Upgrade TMDB image quality if using w500
  const highQualityBanner = typeof rawBanner === 'string' ? rawBanner.replace('/w500/', '/original/') : rawBanner;
  
  const bannerSrc = getProxiedImageUrl(highQualityBanner);
  const darkHeroSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%23020617"/></linearGradient></defs><rect width="1200" height="800" fill="url(%23bg)"/></svg>`;

  return (
    <section className="relative w-full min-h-[70vh] sm:min-h-[85vh] md:min-h-[90dvh] flex items-end sm:items-center pt-20 sm:pt-24 pb-8 sm:pb-16 overflow-x-clip">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-[#050505] pointer-events-none select-none">
        <AnimatePresence mode="popLayout">
          <motion.img 
            key={bannerSrc}
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
            src={bannerSrc} 
            alt={movie.title}
            draggable="false"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-top sm:object-center pointer-events-none select-none"
            onError={(e) => {
              const target = e.currentTarget;
              if (movie.posterUrl && target.src !== getProxiedImageUrl(movie.posterUrl)) {
                target.src = getProxiedImageUrl(movie.posterUrl);
              } else {
                target.onerror = null;
                target.src = darkHeroSvg;
              }
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/70 to-transparent dark:from-[#050505] dark:via-[#050505]/80 dark:to-transparent pointer-events-none select-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50/90 to-transparent dark:from-[#050505] dark:via-[#050505]/90 dark:to-transparent w-full md:w-3/4 pointer-events-none select-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-start sm:items-center justify-between">
          
          <div className="w-full md:w-[60%] flex flex-col gap-3 sm:gap-6 min-h-[300px] justify-center">
            <AnimatePresence mode="wait">
              <motion.div 
                key={movie.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="flex flex-col gap-3 sm:gap-6"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em] bg-[var(--color-primary-red)] text-white rounded-full shadow-lg shadow-red-600/30">
                    FEATURED SELECTION
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-primary-yellow)] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-yellow-500/20">
                    {movie.match}% Match
                  </span>
                </div>
                
                <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-7xl leading-[1.08] tracking-tight text-zinc-900 dark:text-white drop-shadow-2xl select-none">
                  {movie.title}
                </h1>

                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex-wrap">
                  <span className="flex items-center gap-1.5 text-[var(--color-primary-yellow)] font-extrabold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-current" /> {movie.rating}
                  </span>
                  <span className="text-zinc-500">•</span>
                  <span className="px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">{movie.year}</span>
                  {movie.duration && (
                    <>
                      <span className="text-zinc-500">•</span>
                      <span className="px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">{movie.duration}</span>
                    </>
                  )}
                  <div className="flex gap-1.5 ml-1">
                    {movie.categories.slice(0, 2).map(cat => (
                      <span key={cat} className="px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-white/15 text-[11px] font-medium bg-black/5 dark:bg-white/5 backdrop-blur-md">{cat}</span>
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-base md:text-lg text-zinc-700 dark:text-zinc-300 max-w-xl leading-relaxed line-clamp-3 sm:line-clamp-4 drop-shadow-md select-none font-normal">
                  {movie.description}
                </p>

                <div className="flex flex-row gap-3.5 mt-3 sm:mt-5">
                  <button 
                    onClick={handlePlayClick}
                    disabled={isClicked}
                    className="group relative flex-1 sm:flex-initial flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-full font-bold overflow-hidden hover:scale-[0.98] active:scale-95 transition-all duration-300 shadow-2xl shadow-red-600/20 text-sm sm:text-base cursor-pointer"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 dark:bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                      {isClicked ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </div>
                    <span>{isClicked ? 'Membuka...' : 'Tonton Sekarang'}</span>
                  </button>
                  
                  <button 
                    onClick={handlePlayClick}
                    disabled={isClicked}
                    className="group flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-white backdrop-blur-xl rounded-full font-bold hover:bg-black/20 dark:hover:bg-white/20 active:scale-95 transition-all duration-300 text-sm sm:text-base border border-black/10 dark:border-white/15 cursor-pointer"
                  >
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-300 group-hover:scale-110 transition-transform" />
                    <span>Detail Film</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Slider Controls */}
          {movies.length > 1 && (
            <div className="hidden md:flex flex-col gap-4 items-end mt-20">
              <div className="flex gap-2">
                <button 
                  onClick={prevSlide}
                  className="w-12 h-12 rounded-full border border-zinc-300 dark:border-white/20 flex items-center justify-center bg-white/5 dark:bg-black/20 backdrop-blur-md text-zinc-900 dark:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full border border-zinc-300 dark:border-white/20 flex items-center justify-center bg-white/5 dark:bg-black/20 backdrop-blur-md text-zinc-900 dark:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                {movies.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-[var(--color-primary-red)]' : 'w-2 bg-zinc-300 dark:bg-white/20'}`}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
        
        {/* Mobile Slider Controls */}
        {movies.length > 1 && (
          <div className="flex md:hidden items-center justify-between w-full mt-8">
            <div className="flex gap-1.5">
              {movies.slice(0, 5).map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-6 bg-[var(--color-primary-red)]' : 'w-1.5 bg-zinc-300 dark:bg-white/20'}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevSlide}
                className="w-10 h-10 rounded-full border border-zinc-300 dark:border-white/20 flex items-center justify-center bg-white/5 dark:bg-black/20 backdrop-blur-md text-zinc-900 dark:text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border border-zinc-300 dark:border-white/20 flex items-center justify-center bg-white/5 dark:bg-black/20 backdrop-blur-md text-zinc-900 dark:text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
