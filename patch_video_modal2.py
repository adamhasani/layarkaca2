import re

with open('src/components/VideoModal.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('  useEffect(() => {\n    if (movie) {')
end_idx = content.find('  }, [movie]);', start_idx) + len('  }, [movie]);')

replacement = """  const hasTrackedHistory = useRef(false);

  useEffect(() => {
    if (movie) {
      if (user && movie.id) {
        checkInWatchlist(user.uid, movie.id).then(setIsInWatchlist).catch(console.error);
      }
      getReviews(movie.id).then(setReviews).catch(console.error);
    }
    
    document.body.style.overflow = 'hidden';

    setDetailedMovie(movie);
    setSeasonsList([]);
    setSelectedSeason(1);
    setSelectedEpisode(1);

    if (movie && !movie.streamUrl && !movie.embedUrl) {
      fetchDetailForServer(selectedServer, 1, 1);
    } else {
      setIsDetailLoading(false);
    }

    return () => {
      document.body.style.overflow = '';
      hasTrackedHistory.current = false;
    };
  }, [movie]);

  useEffect(() => {
    if (user && movie && movie.id && !hasTrackedHistory.current) {
      updateHistory(user.uid, movie, 0, selectedSeason, selectedEpisode).catch(console.error);
      hasTrackedHistory.current = true;
    }
  }, [user, movie, selectedSeason, selectedEpisode]);"""

new_content = content[:start_idx] + replacement + content[end_idx:]

with open('src/components/VideoModal.tsx', 'w') as f:
    f.write(new_content)

print("Patched VideoModal 2")
