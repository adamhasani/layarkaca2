with open('src/App.tsx', 'r') as f:
    content = f.read()

replacement = """
            {user && (
              <div id="section-history" className="pt-8">
                <MovieGrid 
                  title="🕒 Lanjutkan Menonton"
                  movies={historyMovies}
                  categories={[]}
                  selectedCategory={null}
                  onSelectCategory={() => {}}
                  onPlay={setActiveMovie}
                />
                {historyMovies.length === 0 && (
                  <p className="text-zinc-500 text-sm italic px-4 md:px-8 mt-2">Belum ada riwayat tontonan.</p>
                )}
              </div>
            )}
            
            {user && (
              <div id="section-watchlist" className="pt-8">
                <MovieGrid 
                  title="🔖 Daftar Tontonan Saya"
                  movies={watchlistMovies}
                  categories={[]}
                  selectedCategory={null}
                  onSelectCategory={() => {}}
                  onPlay={setActiveMovie}
                />
                {watchlistMovies.length === 0 && (
                  <p className="text-zinc-500 text-sm italic px-4 md:px-8 mt-2">Belum ada daftar tontonan.</p>
                )}
              </div>
            )}
"""

import re
content = re.sub(r'\{historyMovies\.length > 0 && \(\s*<div id="section-history"[\s\S]*?</div>\s*\)\}\s*\{watchlistMovies\.length > 0 && \(\s*<div id="section-watchlist"[\s\S]*?</div>\s*\)\}', replacement.strip(), content)

# Fix typo } [user]);;
content = content.replace('  }, [user]);;', '  }, [user]);')

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Patched App.tsx")
