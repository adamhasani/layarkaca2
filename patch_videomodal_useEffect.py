import re

with open('src/components/VideoModal.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('  useEffect(() => {\n    if (!movie) return;\n    \n    // Load watchlist status')
if start_idx == -1:
    print("Not found start")
    exit(1)

replacement = """  const hasTrackedHistory = useRef(false);

  // User-dependent side effects
  useEffect(() => {
    if (!movie) return;
    if (user && movie.id) {
      checkInWatchlist(user.uid, movie.id).then(setInWatchlist).catch(console.error);
      
      if (!hasTrackedHistory.current) {
        hasTrackedHistory.current = true;
        updateHistory(user.uid, movie, 0, selectedSeason, selectedEpisode).catch(console.error);
      }
    }
  }, [movie, user]);

  useEffect(() => {
    if (!movie) return;
    hasTrackedHistory.current = false; // reset when movie changes
    
    // Load reviews
    if (movie.id) {
      getReviews(movie.id).then(setReviews).catch(console.error);
    }
    
    document.body.style.overflow = 'hidden';

    setDetailedMovie(movie);
    setSeasonsList([]);
    setSelectedSeason(1);
    setSelectedEpisode(1);
    
    if (!movie.streamUrl && !movie.embedUrl) {
      fetchDetailForServer(selectedServer, 1, 1);
    } else {
      setIsDetailLoading(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [movie]);"""

import re
content = re.sub(r'  useEffect\(\(\) => \{\n    if \(!movie\) return;\n    \n    // Load watchlist status.*?  \}, \[movie\]\);', replacement, content, flags=re.DOTALL)

with open('src/components/VideoModal.tsx', 'w') as f:
    f.write(content)

print("Patched VideoModal.tsx")
