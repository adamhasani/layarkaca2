import { useState, useMemo, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { getWatchlist, getHistory, WatchlistItem, HistoryItem } from './lib/firestore';
import { Navbar } from './components/Navbar';
import { FeaturedHero } from './components/FeaturedHero';
import { MovieGrid } from './components/MovieGrid';
import { VideoModal } from './components/VideoModal';
import { Footer } from './components/Footer';
import { mockMovies, categories, wikipediaBlockbusters, wikipediaAnimatedMovies, wikipediaTrendingPopularMovies,
  wikipediaComedyDramaMovies, indonesianTopMovies } from './data';
import { Movie, Notification } from './types';

const realMovieMetaDataMap: Record<string, { rating: number; duration: string }> = {
  'ne zha 2': { rating: 8.5, duration: '2h 24m' },
  'zootopia 2': { rating: 8.0, duration: '1h 48m' },
  'avatar: fire and ash': { rating: 8.2, duration: '3h 10m' },
  'the super mario galaxy movie': { rating: 7.8, duration: '1h 40m' },
  'the super mario bros. movie': { rating: 7.1, duration: '1h 32m' },
  'lilo & stitch': { rating: 7.5, duration: '1h 52m' },
  'a minecraft movie': { rating: 7.2, duration: '1h 45m' },
  'jurassic world rebirth': { rating: 7.4, duration: '2h 14m' },
  'demon slayer: infinity castle': { rating: 8.8, duration: '2h 30m' },
  'f1': { rating: 8.1, duration: '2h 20m' },
  'superman': { rating: 8.3, duration: '2h 18m' },
  'avatar': { rating: 7.6, duration: '2h 42m' },
  'avengers: endgame': { rating: 8.3, duration: '3h 01m' },
  'avatar: the way of water': { rating: 7.7, duration: '3h 12m' },
  'titanic': { rating: 7.9, duration: '3h 14m' },
  'star wars: the force awakens': { rating: 7.8, duration: '2h 18m' },
  'avengers: infinity war': { rating: 8.2, duration: '2h 29m' },
  'spider-man: no way home': { rating: 8.0, duration: '2h 28m' },
  'jurassic world': { rating: 6.7, duration: '2h 04m' },
  'the lion king': { rating: 7.1, duration: '1h 58m' },
  'the avengers': { rating: 7.7, duration: '2h 23m' },
  'furious 7': { rating: 7.2, duration: '2h 17m' },
  'top gun: maverick': { rating: 8.2, duration: '2h 10m' },
  'frozen ii': { rating: 7.2, duration: '1h 43m' },
  'frozen 2': { rating: 7.2, duration: '1h 43m' },
  'frozen': { rating: 7.2, duration: '1h 42m' },
  'barbie': { rating: 7.1, duration: '1h 54m' },
  'inside out 2': { rating: 7.6, duration: '1h 36m' },
  'incredibles 2': { rating: 7.5, duration: '1h 58m' },
  'minions': { rating: 6.4, duration: '1h 31m' },
  'toy story 4': { rating: 7.5, duration: '1h 40m' },
  'toy story 3': { rating: 7.8, duration: '1h 43m' },
  'despicable me 3': { rating: 6.4, duration: '1h 30m' },
  'finding dory': { rating: 7.0, duration: '1h 37m' },
  'zootopia': { rating: 7.7, duration: '1h 48m' },
  'despicable me 2': { rating: 6.9, duration: '1h 38m' },
  'minions: the rise of gru': { rating: 7.3, duration: '1h 27m' },
  'despicable me 4': { rating: 7.0, duration: '1h 34m' },
  'finding nemo': { rating: 7.8, duration: '1h 40m' },
  'shrek 2': { rating: 7.3, duration: '1h 33m' },
  'ice age: dawn of the dinosaurs': { rating: 6.7, duration: '1h 34m' },
  'ice age: continental drift': { rating: 6.5, duration: '1h 28m' },
  'the secret life of pets': { rating: 6.3, duration: '1h 27m' },
  'agak laen': { rating: 8.0, duration: '1h 59m' },
  'siksa kubur': { rating: 7.2, duration: '1h 57m' },
  'vina: sebelum 7 hari': { rating: 7.1, duration: '1h 40m' },
  'kang mak': { rating: 7.5, duration: '2h 02m' },
  'ipar adalah maut': { rating: 7.4, duration: '2h 11m' },
  'badarawuhi di desa penari': { rating: 7.0, duration: '2h 02m' },
  'sekawan limo': { rating: 7.6, duration: '1h 52m' }
};

function getRealMovieMetaData(rawTitle: string): { rating: number; duration: string } {
  if (!rawTitle) return { rating: 7.5, duration: '1h 50m' };
  const clean = rawTitle.toLowerCase().replace(/\(\d{4}\)/g, '').replace(/ film$/g, '').trim();
  
  if (realMovieMetaDataMap[clean]) {
    return realMovieMetaDataMap[clean];
  }

  for (const key of Object.keys(realMovieMetaDataMap)) {
    if (clean.includes(key) || key.includes(clean)) {
      return realMovieMetaDataMap[key];
    }
  }

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);
  const ratings = [7.8, 8.1, 7.4, 8.3, 7.6, 8.0, 7.9, 8.2, 7.5, 8.4];
  const rating = ratings[posHash % ratings.length];

  let baseMins = 110;
  if (clean.includes('mario') || clean.includes('shrek') || clean.includes('minion') || clean.includes('animation') || clean.includes('lion')) baseMins = 95;
  else if (clean.includes('avatar') || clean.includes('avengers') || clean.includes('batman')) baseMins = 150;

  const totalMins = baseMins + (posHash % 31) - 15;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return { rating, duration: `${h}h ${m}m` };
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);
  const [apiMovies, setApiMovies] = useState<Movie[]>([]);
  const [latestMovies, setLatestMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [netflixTrendingMovies, setNetflixTrendingMovies] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [wikiComedyMovies, setWikiComedyMovies] = useState<Movie[]>(wikipediaComedyDramaMovies);
  const [indoTrendingMovies, setIndoTrendingMovies] = useState<Movie[]>(indonesianTopMovies);
  const [wikiBlockbusterMovies, setWikiBlockbusterMovies] = useState<Movie[]>(wikipediaBlockbusters);
  const [wikiAnimatedMovies, setWikiAnimatedMovies] = useState<Movie[]>(wikipediaAnimatedMovies);
  const [wikiTrendingPopularMovies, setWikiTrendingPopularMovies] = useState<Movie[]>(wikipediaTrendingPopularMovies);
  const [isLoadingHome, setIsLoadingHome] = useState(true);
  const { user } = useAuth();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [historyMovies, setHistoryMovies] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch initial sections from /api/home for dynamic AI-curated homepage
  const loadHomeMovies = async () => {
    setIsLoadingHome(true);
    try {
      const fetchSafe = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          return res;
        } catch (e) {
          return null;
        }
      };
      const [homeRes, netflixRes, indoRes, wikiBlockbusterRes, wikiAnimatedRes, wikiTrendingRes] = await Promise.all([
        fetchSafe('/api/home'),
        fetchSafe('/api/netflix-trending'),
        fetchSafe('/api/indonesian-trending'),
        fetchSafe('/api/wikipedia-blockbusters'),
        fetchSafe('/api/wikipedia-animated'),
        fetch('/api/wikipedia-trending-popular').catch(() => null)
      ]);

      if (homeRes) {
        const data = await homeRes.json();

        const mapResults = (results: any[], defaultMatch = 98) => {
          if (!Array.isArray(results)) return [];
          return results.map((result: any) => ({
            id: result.slug,
            title: result.title,
            description: result.synopsis || (result.type === 'movie' ? 'Movie' : 'Series'),
            type: result.type,
            categories: result.genres && result.genres.length > 0 ? result.genres : ['Action'],
            rating: result.rating || 8.0,
            year: result.year || (() => {
              const match = String(result.slug || '').match(/-(\d{4})$/);
              return match ? parseInt(match[1]) : new Date().getFullYear();
            })(),
            duration: result.duration || result.quality || 'HD',
            posterUrl: (result.poster && typeof result.poster === 'string' && !result.poster.includes('placeholder')) ? result.poster : '',
            bannerUrl: (result.poster && typeof result.poster === 'string' && !result.poster.includes('placeholder')) ? result.poster : '',
            subtitles: [],
            reviews: [],
            match: defaultMatch,
            streamUrl: '',
            embedUrl: ''
          }));
        };

        if (data.status && data.sections) {
          const mergeWithMock = (apiList: any[], categoryMatch?: string) => {
            const mapped = mapResults(apiList);
            const map = new Map<string, Movie>();
            mapped.forEach(m => map.set(m.id || m.title.toLowerCase(), m));
            
            mockMovies.forEach(m => {
              if (!categoryMatch || m.categories.some(c => c.toLowerCase().includes(categoryMatch.toLowerCase()))) {
                if (!map.has(m.id)) {
                  map.set(m.id, m);
                }
              }
            });
            return Array.from(map.values());
          };

          if (data.sections.latest) setLatestMovies(mergeWithMock(data.sections.latest).sort((a, b) => (b.year || 0) - (a.year || 0)));
          if (data.sections.trending) setTrendingMovies(mergeWithMock(data.sections.trending).sort((a, b) => (b.year || 0) - (a.year || 0)));
          if (data.sections.action) setActionMovies(mergeWithMock(data.sections.action, 'action').sort((a, b) => (b.year || 0) - (a.year || 0)));
          if (data.sections.horror) setHorrorMovies(mergeWithMock(data.sections.horror, 'horror').sort((a, b) => (b.year || 0) - (a.year || 0)));
          if (data.sections.comedy) setComedyMovies(mergeWithMock(data.sections.comedy, 'comedy').sort((a, b) => (b.year || 0) - (a.year || 0)));
        }
      }

      if (netflixRes) {
        const data = await netflixRes.json();
        if (data.status && data.result && data.result.results) {
          const mapResults = (results: any[], defaultMatch = 99) => {
            if (!Array.isArray(results)) return [];
            return results.map((result: any) => ({
              id: result.slug,
              title: result.title,
              description: result.synopsis || (result.type === 'movie' ? 'Movie' : 'Series'),
              type: result.type,
              categories: result.genres && result.genres.length > 0 ? result.genres : ['Action'],
              rating: result.rating || 9.5,
              year: result.year || (() => {
                const match = String(result.slug || '').match(/-(\d{4})$/);
                return match ? parseInt(match[1]) : new Date().getFullYear();
              })(),
              duration: result.duration || result.quality || 'HD',
              posterUrl: (result.poster && typeof result.poster === 'string' && !result.poster.includes('placeholder')) ? result.poster : '',
              bannerUrl: (result.poster && typeof result.poster === 'string' && !result.poster.includes('placeholder')) ? result.poster : '',
              subtitles: [],
              reviews: [],
              match: defaultMatch,
              streamUrl: '',
              embedUrl: ''
            }));
          };
          setNetflixTrendingMovies(mapResults(data.result.results));
        }
      }

      if (indoRes) {
        const data = await indoRes.json();
        if (data.status && Array.isArray(data.result) && data.result.length > 0) {
          const formatted = data.result.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.synopsis || 'Movie',
            type: item.type,
            categories: item.genres || ['Drama'],
            rating: typeof item.rating === 'string' ? parseFloat(item.rating) : item.rating || 8.0,
            year: item.year,
            duration: item.duration || '2h 00m',
            posterUrl: item.poster,
            bannerUrl: item.poster,
            subtitles: [{ lang: 'id', label: 'Indo' }],
            reviews: [],
            match: item.match || 98,
            rank: item.rank,
            viewersCount: item.viewersCount,
            viewersText: item.viewersText || (item.viewersCount ? `${item.viewersCount.toLocaleString('id-ID')} Penonton` : undefined),
            director: item.director,
            streamUrl: '',
            embedUrl: ''
          }));
          setIndoTrendingMovies(formatted);
        } else {
          setIndoTrendingMovies(indonesianTopMovies);
        }
      } else {
        setIndoTrendingMovies(indonesianTopMovies);
      }

      if (wikiBlockbusterRes) {
        const data = await wikiBlockbusterRes.json();
        if (data.status && Array.isArray(data.result) && data.result.length > 0) {
          const formatted = data.result.map((item: any) => {
            const meta = getRealMovieMetaData(item.title);
            return {
              id: item.id,
              title: item.title,
              description: item.synopsis || `Film blockbuster global terlaris (#${item.rank} Wikipedia) dengan pendapatan ${item.boxOffice}.`,
              type: 'movie',
              categories: item.genres || ['Action', 'Blockbuster'],
              rating: typeof item.rating === 'string' ? parseFloat(item.rating) : (item.rating || meta.rating),
              year: item.year,
              duration: item.duration || meta.duration,
              posterUrl: item.poster,
              bannerUrl: item.poster,
              subtitles: [{ lang: 'id', label: 'Indo' }],
              reviews: [],
              match: item.match || 98,
              rank: item.rank,
              boxOffice: item.boxOffice,
              streamUrl: '',
              embedUrl: ''
            };
          });
          setWikiBlockbusterMovies(formatted);
        }
      }

      if (wikiAnimatedRes) {
        const data = await wikiAnimatedRes.json();
        if (data.status && Array.isArray(data.result) && data.result.length > 0) {
          const formatted = data.result.map((item: any) => {
            const meta = getRealMovieMetaData(item.title);
            return {
              id: item.id,
              title: item.title,
              description: item.synopsis || `Film animasi terlaris di dunia (#${item.rank} Wikipedia) dengan pendapatan ${item.boxOffice}.`,
              type: 'movie',
              categories: item.genres || ['Animation', 'Family'],
              rating: typeof item.rating === 'string' ? parseFloat(item.rating) : (item.rating || meta.rating),
              year: item.year,
              duration: item.duration || meta.duration,
              posterUrl: item.poster,
              bannerUrl: item.poster,
              subtitles: [{ lang: 'id', label: 'Indo' }],
              reviews: [],
              match: item.match || 98,
              rank: item.rank,
              boxOffice: item.boxOffice,
              streamUrl: '',
              embedUrl: ''
            };
          });
          setWikiAnimatedMovies(formatted);
        }
      }

      if (wikiTrendingRes) {
        const data = await wikiTrendingRes.json();
        if (data.status && Array.isArray(data.result) && data.result.length > 0) {
          const formatted = data.result.map((item: any) => {
            const meta = getRealMovieMetaData(item.title);
            return {
              id: item.id,
              title: item.title,
              description: item.synopsis || `Film paling populer & trending di Wikipedia bulan ini (#${item.rank}) dengan pendapatan ${item.boxOffice}.`,
              type: 'movie',
              categories: item.genres || ['Trending', 'Action'],
              rating: typeof item.rating === 'string' ? parseFloat(item.rating) : (item.rating || meta.rating),
              year: item.year,
              duration: item.duration || meta.duration,
              posterUrl: item.poster,
              bannerUrl: item.poster,
              subtitles: [{ lang: 'id', label: 'Indo' }],
              reviews: [],
              match: item.match || 98,
              rank: item.rank,
              boxOffice: item.boxOffice,
              streamUrl: '',
              embedUrl: ''
            };
          });
          setWikiTrendingPopularMovies(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to load home movies', err);
    } finally {
      setIsLoadingHome(false);
    }
  };

  useEffect(() => {
    loadHomeMovies();
  }, []);

  const fetchUserData = () => {
    if (user) {
      getWatchlist(user.uid).then((items) => { console.log("Watchlist items:", items);
        setWatchlistMovies(items.map(item => ({
          id: item.movieId,
          title: item.movieTitle,
          posterUrl: item.moviePoster,
          bannerUrl: item.moviePoster,
          type: (item.movieType as any) || 'movie',
          description: '',
          categories: [],
          rating: 0,
          year: new Date().getFullYear(),
          duration: '',
          subtitles: [],
          reviews: [],
          match: 99
        })));
      }).catch(err => console.error("Error fetching watchlist:", err));
      getHistory(user.uid).then((items) => { console.log("History items:", items);
        setHistoryMovies(items.map(item => ({
          id: item.movieId,
          title: item.movieTitle,
          posterUrl: item.moviePoster,
          bannerUrl: item.moviePoster,
          type: (item.movieType as any) || 'movie',
          description: '',
          categories: [],
          rating: 0,
          year: new Date().getFullYear(),
          duration: '',
          subtitles: [],
          reviews: [],
          match: 99
        })));
      }).catch(err => console.error("Error fetching history:", err));
    } else {
      setWatchlistMovies([]);
      setHistoryMovies([]);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  // Fetch search or category movies when searchQuery or selectedCategory changes
  useEffect(() => {
    const query = searchQuery.trim() || selectedCategory;
    if (!query) {
      setApiMovies([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const endpoint = isAiSearch
          ? `/api/ai/search?prompt=${encodeURIComponent(query)}`
          : `/api/search?query=${encodeURIComponent(query)}`;
        const res = await fetch(endpoint);
        const data = await res.json();
        
        if (data.status && data.result && data.result.results) {
          const results = data.result.results;
          
          const mappedMovies = results.map((result: any) => ({
            id: result.slug,
            title: result.title,
            description: result.synopsis || (result.type === 'movie' ? 'Movie' : 'Series'),
            type: result.type,
            categories: result.genres && result.genres.length > 0 ? result.genres : ['Action'],
            rating: result.rating || 7.5,
            year: result.year || (() => {
              const match = String(result.slug || '').match(/-(\d{4})$/);
              return match ? parseInt(match[1]) : new Date().getFullYear();
            })(),
            duration: result.duration || result.quality || 'HD',
            posterUrl: (result.poster && typeof result.poster === 'string' && !result.poster.includes('placeholder')) ? result.poster : '',
            bannerUrl: (result.poster && typeof result.poster === 'string' && !result.poster.includes('placeholder')) ? result.poster : '',
            subtitles: [],
            reviews: [],
            match: 95,
            streamUrl: '',
            embedUrl: ''
          }));
          
          setApiMovies(mappedMovies);
        } else {
          setApiMovies([]);
        }
      } catch (err) {
        console.error('Failed to fetch from API', err);
        setApiMovies([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, isAiSearch]);

  // Combine all home section movies for smart category filtering & cache
  const allHomeMovies = useMemo(() => {
    const map = new Map<string, Movie>();
    [...wikiTrendingPopularMovies, ...latestMovies, ...trendingMovies, ...actionMovies, ...horrorMovies, ...comedyMovies, ...wikiComedyMovies, ...indoTrendingMovies, ...wikiBlockbusterMovies, ...wikiAnimatedMovies].forEach(m => {
      if (m && m.id) map.set(m.id, m);
    });
    return Array.from(map.values()).sort((a, b) => (b.year || 0) - (a.year || 0));
  }, [wikiTrendingPopularMovies, latestMovies, trendingMovies, actionMovies, horrorMovies, comedyMovies, wikiComedyMovies, indoTrendingMovies, wikiBlockbusterMovies, wikiAnimatedMovies]);

  const handleSelectCategory = (id: string | null) => {
    setSelectedCategory(id);
    if (id) {
      setTimeout(() => {
        const el = document.getElementById(`section-${id}`);
        if (el) {
          const yOffset = -100; // Account for fixed navbar
          const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 10);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const displayMovies = useMemo(() => {
    if (searchQuery) {
      const map = new Map<string, Movie>();
      
      // First add API search results if present
      apiMovies.forEach(m => map.set(m.id || m.title.toLowerCase(), m));

      // Then merge allHomeMovies and mockMovies
      const candidateList = [...allHomeMovies, ...mockMovies];
      
      const queryLower = searchQuery.toLowerCase();
      candidateList.forEach(m => {
        if (
          m.title.toLowerCase().includes(queryLower) ||
          m.description.toLowerCase().includes(queryLower) ||
          m.categories?.some(c => c.toLowerCase().includes(queryLower))
        ) {
          if (!map.has(m.id)) {
            map.set(m.id, m);
          }
        }
      });

      return Array.from(map.values()).sort((a, b) => (b.year || 0) - (a.year || 0));
    }
    return [];
  }, [searchQuery, apiMovies, allHomeMovies]);

  const featuredMovie = latestMovies.length > 0 ? latestMovies[0] : (trendingMovies.length > 0 ? trendingMovies[0] : [...mockMovies].sort((a, b) => (b.year || 0) - (a.year || 0))[0]);


  const dynamicNotifications = useMemo<Notification[]>(() => {
    const notifs: Notification[] = [];
    if (latestMovies.length > 0) {
      notifs.push({
        id: 'dyn1',
        message: `Rilis Terbaru: "${latestMovies[0].title}" kini tersedia untuk ditonton.`,
        timestamp: 'Baru saja',
        unread: true,
        type: 'release'
      });
    }
    if (wikiTrendingPopularMovies.length > 0) {
      notifs.push({
        id: 'dyn2',
        message: `Film "${wikiTrendingPopularMovies[0].title}" sedang populer! Tonton sekarang sebelum ketinggalan.`,
        timestamp: '1 jam yang lalu',
        unread: true,
        type: 'system'
      });
    }
    if (watchlistMovies.length > 0) {
      notifs.push({
        id: 'dyn3',
        message: `Anda memiliki ${watchlistMovies.length} film di daftar tontonan. Yuk, selesaikan tontonan Anda!`,
        timestamp: 'Hari ini',
        unread: false,
        type: 'system'
      });
    }
    
    if (notifs.length === 0) {
      notifs.push({
        id: 'dyn4',
        message: 'Selamat datang di Cinestream! Temukan film favorit Anda di sini.',
        timestamp: 'Baru saja',
        unread: true,
        type: 'system'
      });
    }
    
    return notifs;
  }, [latestMovies, wikiTrendingPopularMovies, watchlistMovies]);

  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-red-50 dark:bg-[#0a0000] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative overflow-x-clip">
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-red-600/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-yellow-500/10 blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10">
                <Navbar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          isAiSearch={isAiSearch}
          setIsAiSearch={setIsAiSearch}
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
          notifications={dynamicNotifications}
        />

      <main>
        {searchQuery ? (
          <div className="pt-24 sm:pt-28 md:pt-32">
            <MovieGrid 
              title={`Hasil Pencarian "${searchQuery}"`}
              movies={displayMovies}
              categories={[]}
              selectedCategory={null}
              onSelectCategory={() => {}}
              onPlay={setActiveMovie}
              isSearching={isSearching}
              variant="grid"
            />
          </div>
        ) : (
          <>
            <FeaturedHero movies={latestMovies.length > 0 ? latestMovies.slice(0, 5) : (trendingMovies.length > 0 ? trendingMovies.slice(0, 5) : [...mockMovies].sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 5))} onPlay={setActiveMovie} />
            {user && historyMovies.length > 0 && (
              <div id="section-history" className="pt-8">
                <MovieGrid 
                  title="🕒 Lanjutkan Menonton"
                  movies={historyMovies}
                  categories={[]}
                  selectedCategory={null}
                  onSelectCategory={() => {}}
                  onPlay={setActiveMovie}
                />
              </div>
            )}
            
            {user && watchlistMovies.length > 0 && (
              <div id="section-watchlist" className="pt-8">
                <MovieGrid 
                  title="🔖 Daftar Tontonan Saya"
                  movies={watchlistMovies}
                  categories={[]}
                  selectedCategory={null}
                  onSelectCategory={() => {}}
                  onPlay={setActiveMovie}
                />
              </div>
            )}


            {/* Section 1: Film Terbaru */}
            <div id="section-terbaru">
              <MovieGrid 
                title="🆕 Rilis Film Terbaru"
                movies={latestMovies.length > 0 ? latestMovies : [...mockMovies].sort((a, b) => (b.year || 0) - (a.year || 0))}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                onPlay={setActiveMovie}
              />
            </div>

            {/* Section 2: Trending & Blockbuster */}
            <div id="section-trending">
              <MovieGrid 
                title="🔥 Blockbuster Sepanjang Masa"
                movies={wikiBlockbusterMovies.length > 0 ? wikiBlockbusterMovies : wikipediaBlockbusters}
                categories={[]}
                selectedCategory={null}
                onSelectCategory={() => {}}
                onPlay={setActiveMovie}
              />
            </div>

            {/* Section: Trending & Popular Saat Ini (Wikipedia Sync) */}
            <div id="section-trending">
              <MovieGrid 
                title="🔥 Trending & Popular Saat Ini"
                movies={wikiTrendingPopularMovies.length > 0 ? wikiTrendingPopularMovies : (trendingMovies.length > 0 ? trendingMovies : wikipediaTrendingPopularMovies)}
                categories={[]}
                selectedCategory={null}
                onSelectCategory={() => {}}
                onPlay={setActiveMovie}
              />
            </div>

            {/* Section: Indonesia Trending */}
            <div id="section-indonesia">
              <MovieGrid 
                title="🇮🇩 Film Indonesia Terpopuler"
                movies={indoTrendingMovies}
                categories={[]}
                selectedCategory={null}
                onSelectCategory={() => {}}
                onPlay={setActiveMovie}
              />
            </div>

            {/* Section: Animated Movies Terlaris di Dunia (Wikipedia) */}
            <div id="section-animasi-terlaris">
              <MovieGrid 
                title="🎨 Film Animasi Terlaris di Dunia"
                movies={wikiAnimatedMovies.length > 0 ? wikiAnimatedMovies : wikipediaAnimatedMovies}
                categories={[]}
                selectedCategory={null}
                onSelectCategory={() => {}}
                onPlay={setActiveMovie}
              />
            </div>

            {/* Section: Netflix Trending */}
            {netflixTrendingMovies.length > 0 && (
              <div id="section-netflix-trending">
                <MovieGrid 
                  title="🍿 Trending di Netflix"
                  movies={netflixTrendingMovies}
                  categories={[]}
                  selectedCategory={null}
                  onSelectCategory={() => {}}
                  onPlay={setActiveMovie}
                />
              </div>
            )}

            {/* Section 3: Action & Aksi Seru */}
            {actionMovies.length > 0 && (
              <div id="section-action">
                <MovieGrid 
                  title="⚡ Film Action & Aksi Seru"
                  movies={actionMovies}
                  categories={[]}
                  selectedCategory={null}
                  onSelectCategory={() => {}}
                  onPlay={setActiveMovie}
                />
              </div>
            )}

            {/* Section 4: Horror & Mystery */}
            {horrorMovies.length > 0 && (
              <div id="section-horror">
                <MovieGrid 
                  title="👻 Film Horror & Mystery Terseram"
                  movies={horrorMovies}
                  categories={[]}
                  selectedCategory={null}
                  onSelectCategory={() => {}}
                  onPlay={setActiveMovie}
                />
              </div>
            )}

            {/* Section 5: Komedi & Drama */}
            {wikiComedyMovies.length > 0 && (
              <div id="section-comedy">
                <MovieGrid 
                  title="🎭 Film Komedi & Drama Populer"
                  movies={wikiComedyMovies}
                  categories={[]}
                  selectedCategory={null}
                  onSelectCategory={() => {}}
                  onPlay={setActiveMovie}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onSelectCategory={handleSelectCategory} />
      </div>

      {activeMovie && (
        <VideoModal movie={activeMovie} onClose={() => { setActiveMovie(null); fetchUserData(); }} />
      )}
    </div>
  );
}

