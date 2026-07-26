import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace initialization
code = code.replace(
  'const [wikiComedyMovies, setWikiComedyMovies] = useState<Movie[]>(wikipediaComedyDramaMovies);',
  'const [wikiComedyMovies, setWikiComedyMovies] = useState<Movie[]>([]);'
);
code = code.replace(
  'const [indoTrendingMovies, setIndoTrendingMovies] = useState<Movie[]>(indonesianTopMovies);',
  'const [indoTrendingMovies, setIndoTrendingMovies] = useState<Movie[]>([]);'
);
code = code.replace(
  'const [wikiBlockbusterMovies, setWikiBlockbusterMovies] = useState<Movie[]>(wikipediaBlockbusters);',
  'const [wikiBlockbusterMovies, setWikiBlockbusterMovies] = useState<Movie[]>([]);'
);
code = code.replace(
  'const [wikiAnimatedMovies, setWikiAnimatedMovies] = useState<Movie[]>(wikipediaAnimatedMovies);',
  'const [wikiAnimatedMovies, setWikiAnimatedMovies] = useState<Movie[]>([]);'
);
code = code.replace(
  'const [wikiTrendingPopularMovies, setWikiTrendingPopularMovies] = useState<Movie[]>(wikipediaTrendingPopularMovies);',
  'const [wikiTrendingPopularMovies, setWikiTrendingPopularMovies] = useState<Movie[]>([]);'
);

// Fallbacks in catch or !res block
// We'll just let the server fix handle the 6-second delay, so maybe we don't even need to remove the initial state. 
// But a 500ms flicker is still annoying.
