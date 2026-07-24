import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add Notification to types import
content = content.replace("import { Movie } from './types';", "import { Movie, Notification } from './types';")

# Add useMemo dynamicNotifications before the return statement
dynamic_notifs_code = """
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
"""

content = content.replace("  return (\n", dynamic_notifs_code)

navbar_replacement = """        <Navbar 
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
        />"""

content = re.sub(r'<Navbar\s+theme=\{theme\}.*?selectedCategory=\{selectedCategory\}\s*/>', navbar_replacement, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Patched App.tsx for notifications")
