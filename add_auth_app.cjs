const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
content = content.replace(
  /import \{ useTheme \} from '\.\/hooks\/useTheme';/,
  "import { useTheme } from './hooks/useTheme';\nimport { useAuth } from './hooks/useAuth';\nimport { getWatchlist, getHistory, WatchlistItem, HistoryItem } from './lib/firestore';"
);

// Add state
content = content.replace(
  /const \[isLoadingHome, setIsLoadingHome\] = useState\(true\);/,
  `const [isLoadingHome, setIsLoadingHome] = useState(true);
  const { user } = useAuth();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [historyMovies, setHistoryMovies] = useState<Movie[]>([]);`
);

// Add effect
const effectRegex = /useEffect\(\(\) => \{\n\s+loadHomeMovies\(\);\n\s+\}, \[\]\);/;
const effectReplacement = `useEffect(() => {
    loadHomeMovies();
  }, []);

  useEffect(() => {
    if (user) {
      getWatchlist(user.uid).then((items) => {
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
      });
      getHistory(user.uid).then((items) => {
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
      });
    } else {
      setWatchlistMovies([]);
      setHistoryMovies([]);
    }
  }, [user]);`;

content = content.replace(effectRegex, effectReplacement);

// Inject Watchlist and History MovieGrid inside the render block
// Before <MovieGrid title="Rekomendasi AI Untukmu (Otomatis)"
const movieGridRegex = /<MovieGrid\s+title="Rekomendasi AI Untukmu \(Otomatis\)"/;
const gridsToInject = `
        {user && historyMovies.length > 0 && (
          <MovieGrid
            title="Lanjutkan Menonton"
            movies={historyMovies}
            onMovieClick={setActiveMovie}
          />
        )}
        
        {user && watchlistMovies.length > 0 && (
          <MovieGrid
            title="Daftar Tontonan Anda"
            movies={watchlistMovies}
            onMovieClick={setActiveMovie}
          />
        )}
        
        <MovieGrid
          title="Rekomendasi AI Untukmu (Otomatis)"`;
content = content.replace(movieGridRegex, gridsToInject);

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx updated with Watchlist and History");
