import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('  useEffect(() => {\n    if (user) {')
if start_idx == -1:
    print("Not found start")
    exit(1)

end_idx = content.find('  }, [user]);', start_idx)
if end_idx == -1:
    print("Not found end")
    exit(1)
end_idx += len('  }, [user];') # rough size

replacement = """  const fetchUserData = () => {
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
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);"""

new_content = content[:start_idx] + replacement + content[end_idx:]

with open('src/App.tsx', 'w') as f:
    f.write(new_content)

print("Patched fetchUserData")
