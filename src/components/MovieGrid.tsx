import { Movie, Category } from '../types';
import { MovieCard } from './MovieCard';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface MovieGridProps {
  title: string;
  movies: Movie[];
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onPlay: (movie: Movie) => void;
  isSearching?: boolean;
  variant?: 'grid' | 'carousel';
}

export function MovieGrid({ 
  title, 
  movies, 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  onPlay, 
  isSearching,
  variant = 'carousel'
}: MovieGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      // Run once initially and on resize
      checkScroll();
      window.addEventListener('resize', checkScroll);
      
      const timer = setTimeout(checkScroll, 100);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timer);
      };
    }
  }, [movies]);

  return (
    <section className="py-6 sm:py-8 md:py-10 max-w-7xl mx-auto px-4 sm:px-6 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-5 md:mb-8">
        <div>
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-primary-red)] mb-1 block">
            CINEMATIC CATALOG
          </span>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight text-zinc-900 dark:text-white">
              {title}
            </h2>
            {!isSearching && movies.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 shrink-0">
                {movies.length} Film
              </span>
            )}
          </div>
          <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-[var(--color-primary-red)] to-red-600 mt-2 sm:mt-2.5 rounded-full shadow-sm shadow-red-500/20"></div>
        </div>
        
        {categories.length > 0 && (
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap w-auto max-w-full touch-pan-x touch-pan-y">
            <button
              onClick={() => onSelectCategory(null)}
              className={`px-4 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 shrink-0 cursor-pointer ${
                selectedCategory === null 
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/10 scale-105' 
                  : 'bg-zinc-200/80 text-zinc-700 dark:bg-white/5 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-white/10 border border-zinc-300/50 dark:border-white/5'
              }`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 shrink-0 cursor-pointer ${
                  selectedCategory === cat.id 
                    ? 'bg-gradient-to-r from-[var(--color-primary-red)] to-red-600 text-white shadow-lg shadow-red-600/30 scale-105' 
                    : 'bg-zinc-200/80 text-zinc-700 dark:bg-white/5 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-white/10 border border-zinc-300/50 dark:border-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {isSearching ? (
        variant === 'carousel' ? (
          <div className="flex overflow-x-auto no-scrollbar gap-4 sm:gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div 
                key={idx} 
                className="w-[115px] sm:w-[180px] md:w-[210px] lg:w-[230px] shrink-0 aspect-[2/3] rounded-xl sm:rounded-2xl bg-zinc-200 dark:bg-zinc-800/60 animate-pulse flex flex-col justify-end p-3 sm:p-4 snap-start"
              >
                <div className="h-3.5 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
                <div className="h-2.5 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="aspect-[2/3] rounded-xl sm:rounded-2xl bg-zinc-200 dark:bg-zinc-800/60 animate-pulse flex flex-col justify-end p-3 sm:p-4">
                <div className="h-3.5 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
                <div className="h-2.5 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          {variant === 'carousel' ? (
            <div className="relative group/carousel -mx-4 px-4 sm:mx-0 sm:px-0">
              {/* Mobile right fade indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-red-50 dark:from-[#0a0000] to-transparent z-20 pointer-events-none block md:hidden" />
              
              {/* Arrow Buttons for desktop */}
              {showLeftArrow && movies.length > 0 && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-1 sm:left-4 top-[40%] -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full hidden md:flex items-center justify-center bg-black/75 hover:bg-black/90 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-white backdrop-blur-md shadow-lg border border-white/10 hover:scale-105 active:scale-95 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              {showRightArrow && movies.length > 0 && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-1 sm:right-4 top-[40%] -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full hidden md:flex items-center justify-center bg-black/75 hover:bg-black/90 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-white backdrop-blur-md shadow-lg border border-white/10 hover:scale-105 active:scale-95 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Scrollable Container */}
              <div
                ref={scrollRef}
                className="flex overflow-x-auto no-scrollbar scroll-smooth gap-4 sm:gap-6 pb-6 pt-1 touch-pan-x touch-pan-y snap-x snap-mandatory"
                onScroll={checkScroll}
              >
                {movies.map((movie, index) => (
                  <div 
                    key={`${movie.id}-${index}`} 
                    className="w-[115px] sm:w-[180px] md:w-[210px] lg:w-[230px] shrink-0 snap-start"
                  >
                    <MovieCard movie={movie} index={index} onPlay={onPlay} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-8">
              {movies.map((movie, index) => (
                <MovieCard key={`${movie.id}-${index}`} movie={movie} index={index} onPlay={onPlay} />
              ))}
            </div>
          )}
          
          {movies.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-zinc-500 font-medium text-sm sm:text-base">Tidak ada film yang ditemukan dalam kategori ini.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
