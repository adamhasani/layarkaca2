import { Play, Star, Loader2, Clapperboard } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  index: number;
  key?: string | number;
}

const titlePosterMap: Record<string, string> = {
  'dune': 'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg',
  'deadpool': 'https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg',
  'interstellar': 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
  'john wick': 'https://upload.wikimedia.org/wikipedia/en/d/d0/John_Wick_-_Chapter_4_promotional_poster.jpg',
  'pengabdi': 'https://upload.wikimedia.org/wikipedia/en/0/0b/Satan%27s_Slaves_2_-_Communion.jpg',
  'satan': 'https://upload.wikimedia.org/wikipedia/en/0/0b/Satan%27s_Slaves_2_-_Communion.jpg',
  'agak laen': 'https://upload.wikimedia.org/wikipedia/en/9/91/Agak_Laen_film_poster.jpg',
  'godzilla': 'https://upload.wikimedia.org/wikipedia/en/b/be/Godzilla_x_kong_the_new_empire_poster.jpg',
  'oppenheimer': 'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg',
  'spider': 'https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg',
  'exhuma': 'https://upload.wikimedia.org/wikipedia/en/1/13/Exhuma_film_poster.jpg',
  'siksa': 'https://upload.wikimedia.org/wikipedia/en/b/b8/Grave_Torture_poster.jpg',
  'kubur': 'https://upload.wikimedia.org/wikipedia/en/b/b8/Grave_Torture_poster.jpg',
  'grave torture': 'https://upload.wikimedia.org/wikipedia/en/b/b8/Grave_Torture_poster.jpg',
  'inside out': 'https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg',
  'avatar': 'https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg',
  'furiosa': 'https://upload.wikimedia.org/wikipedia/en/3/34/Furiosa_A_Mad_Max_Saga.jpg',
  'batman': 'https://upload.wikimedia.org/wikipedia/en/f/ff/The_Batman_%28film%29_poster.jpg',
  'kung fu': 'https://upload.wikimedia.org/wikipedia/en/7/7f/Kung_Fu_Panda_4_poster.jpg',
  'quiet place': 'https://upload.wikimedia.org/wikipedia/en/e/e7/A_Quiet_Place_Day_One_%282024%29_poster.jpg',
  'venom': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Venom_Let_There_Be_Carnage_poster.jpg',
  'planet of the apes': 'https://upload.wikimedia.org/wikipedia/en/c/cf/Kingdom_of_the_Planet_of_the_Apes_poster.jpg',
  'extraction': 'https://upload.wikimedia.org/wikipedia/en/0/02/Extraction_2_poster.jpg',
  'conjuring': 'https://upload.wikimedia.org/wikipedia/en/1/15/The_Conjuring_The_Devil_Made_Me_Do_It.ky.jpg',
  'barbie': 'https://upload.wikimedia.org/wikipedia/en/0/0b/Barbie_2023_poster.jpg'
};

const verifiedPosters = [
  'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg',
  'https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/d/d0/John_Wick_-_Chapter_4_promotional_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/0/0b/Satan%27s_Slaves_2_-_Communion.jpg',
  'https://upload.wikimedia.org/wikipedia/en/9/91/Agak_Laen_film_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/b/be/Godzilla_x_kong_the_new_empire_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg',
  'https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/1/13/Exhuma_film_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/b/b8/Grave_Torture_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/3/34/Furiosa_A_Mad_Max_Saga.jpg',
  'https://upload.wikimedia.org/wikipedia/en/f/ff/The_Batman_%28film%29_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/7/7f/Kung_Fu_Panda_4_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/e/e7/A_Quiet_Place_Day_One_%282024%29_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/a/a7/Venom_Let_There_Be_Carnage_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/c/cf/Kingdom_of_the_Planet_of_the_Apes_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/0/02/Extraction_2_poster.jpg'
];

function getDistinctPoster(title?: string, id?: string): string {
  const t = (title || id || '').toLowerCase();
  for (const [key, url] of Object.entries(titlePosterMap)) {
    if (t.includes(key)) {
      return url;
    }
  }
  return '';
}

function getProxiedImageUrl(url?: string): string {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return '';
  if (url.startsWith('/api/') || url.startsWith('data:')) return url;
  if (url.includes('tmdb.org')) return url; // TMDB images do not need proxying
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

export function MovieCard({ movie, onPlay, index }: MovieCardProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fallbackPoster = getDistinctPoster(movie.title, movie.id);
  const rawPoster = (movie.posterUrl && movie.posterUrl.startsWith('http') && !movie.posterUrl.includes('placeholder') && !movie.posterUrl.includes('unsplash.com')) 
    ? movie.posterUrl 
    : fallbackPoster;
    
  const displayPoster = getProxiedImageUrl(rawPoster);
  const showPlaceholder = !displayPoster || imageError;

  const handleClick = () => {
    setIsClicked(true);
    onPlay(movie);
    setTimeout(() => setIsClicked(false), 1200);
  };

  const formatViewers = (count?: number) => {
    if (!count) return '';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}jt Penonton`;
    }
    return `${count.toLocaleString('id-ID')} Penonton`;
  };

  const getAudienceDisplay = () => {
    if (movie.boxOffice) return movie.boxOffice;
    if (movie.viewersText) return movie.viewersText;
    if (movie.viewersCount) return formatViewers(movie.viewersCount);
    return null;
  };
  const audienceDisplay = getAudienceDisplay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
      className={`group relative cursor-pointer flex flex-col sm:active:scale-[0.97] transition-all duration-200 touch-manipulation ${isClicked ? 'ring-2 ring-[var(--color-primary-red)] rounded-2xl' : ''}`}
      onClick={handleClick}
    >
      <div className="double-bezel overflow-hidden rounded-xl sm:rounded-2xl mb-1.5 md:mb-0">
        <div className="double-bezel-inner relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
          {showPlaceholder ? (
            <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black select-none border border-zinc-800/50 rounded-xl">
              {/* Top Accent */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-500/20">
                  LayarZona
                </span>
                <span className="text-[9px] font-bold text-zinc-500">
                  HD
                </span>
              </div>

              {/* Center Content */}
              <div className="flex flex-col items-center text-center gap-3 my-auto px-1">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-inner group-hover:border-red-500/30 transition-colors">
                  <Clapperboard className="w-5 h-5 text-zinc-400 group-hover:text-red-500 transition-colors" />
                </div>
                <h3 className="font-display font-black text-white text-xs sm:text-sm md:text-base leading-snug tracking-tight line-clamp-3">
                  {movie.title}
                </h3>
                <span className="text-[11px] text-zinc-400 font-bold bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800/40">
                  {movie.year || new Date().getFullYear()}
                </span>
              </div>

              {/* Bottom Watermark */}
              <div className="text-center">
                <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-zinc-600">
                  Cinema Stream
                </span>
              </div>
            </div>
          ) : (
            <img 
              src={displayPoster} 
              alt={movie.title} 
              draggable="false"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
          
          {/* Rating & Rank Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1.5 z-20 max-w-[calc(100%-12px)] flex-wrap">
            {movie.rank && (() => {
              const r = Number(movie.rank);
              if (r === 1) {
                return (
                  <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black rounded-md shadow-lg shadow-amber-500/40 border border-amber-200 whitespace-nowrap">
                    🏆 #1 TOP
                  </span>
                );
              } else if (r === 2) {
                return (
                  <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 bg-gradient-to-r from-slate-200 via-zinc-100 to-slate-300 text-slate-900 rounded-md shadow-lg shadow-slate-400/30 border border-white whitespace-nowrap">
                    🥈 #2 TOP
                  </span>
                );
              } else if (r === 3) {
                return (
                  <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white rounded-md shadow-lg shadow-amber-900/40 border border-amber-500/40 whitespace-nowrap">
                    🥉 #3 TOP
                  </span>
                );
              } else {
                return (
                  <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 bg-red-600 text-white rounded-md shadow-md border border-red-500/40 whitespace-nowrap">
                    #{movie.rank}
                  </span>
                );
              }
            })()}

            <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 sm:px-2 bg-[var(--color-primary-yellow)] text-black rounded shadow-md whitespace-nowrap">
              ★ {movie.rating || '8.0'}
            </span>
            {(() => {
              const isTvSeries = movie.type === 'series' || movie.type === 'tv_series' || movie.id?.includes('series') || movie.id?.includes('-s1') || movie.id?.includes('-season');
              return (
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 sm:px-2 rounded shadow-md whitespace-nowrap uppercase tracking-wider border ${
                  isTvSeries
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-zinc-800/90 text-zinc-100 border-white/10'
                }`}>
                  {isTvSeries ? 'Series' : 'Film'}
                </span>
              );
            })()}
            {movie.duration && (
              <span className="text-[9px] sm:text-[10px] font-bold px-1 py-0.5 sm:px-1.5 bg-black/80 text-white backdrop-blur-md rounded border border-white/20 whitespace-nowrap hidden sm:inline-block">
                {movie.duration}
              </span>
            )}
          </div>

          {/* Click Loading State Overlay */}
          {isClicked && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-30 flex flex-col items-center justify-center gap-2 p-2">
              <Loader2 className="w-8 h-8 text-[var(--color-primary-red)] animate-spin" />
              <span className="text-[11px] font-semibold text-white tracking-wide">Membuka...</span>
            </div>
          )}

          {/* Play Icon Badge for Mobile (visible on mobile so user knows it's playable) */}
          <div className="absolute bottom-2 right-2 md:hidden z-20 w-8 h-8 rounded-full bg-[var(--color-primary-red)]/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>

          {/* Desktop Hover Overlay: Title + Year + Category + Play button inside Cover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex flex-col justify-between p-4 z-10">
            {/* Top spacer */}
            <div className="h-6" />

            {/* Play Button Icon */}
            <div className="self-center w-12 h-12 rounded-full bg-[var(--color-primary-red)] text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>

            {/* Title & Year Info Inside Cover */}
            <div className="transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <h3 className="font-display font-bold text-white text-sm md:text-base line-clamp-2 leading-tight drop-shadow-md">
                {movie.title}
              </h3>
              <div className="flex flex-col mt-2 gap-1.5">
                <div className="flex items-center justify-between text-zinc-300 text-xs">
                  <span className="font-medium">{movie.year || new Date().getFullYear()}</span>
                  {audienceDisplay && (
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <span>🎟️</span>
                      <span>{audienceDisplay}</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(movie.categories) && movie.categories.length > 0 ? (
                    movie.categories.slice(0, 3).map((cat, idx) => (
                      <span key={idx} className="capitalize text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-md">
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="capitalize text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/20 text-white backdrop-blur-md">
                      Movie
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title & Year display for all screen sizes */}
      <div className="flex flex-col gap-0.5 px-0.5 mt-1.5">
        <h3 className="font-display font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm line-clamp-1 group-hover:text-[var(--color-primary-red)] transition-colors">
          {movie.title}
        </h3>
        <div className="flex flex-col gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          <div className="flex items-center justify-between">
            <span>{movie.year || new Date().getFullYear()}</span>
            {audienceDisplay && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-1 py-0.5 rounded border border-emerald-500/20">
                {audienceDisplay}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(movie.categories) && movie.categories.length > 0 ? (
              movie.categories.slice(0, 2).map((cat, idx) => (
                <span key={idx} className="capitalize text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 truncate max-w-[80px]">
                  {cat}
                </span>
              ))
            ) : (
              <span className="capitalize text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 truncate max-w-[80px]">
                Movie
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
