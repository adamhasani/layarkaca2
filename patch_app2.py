import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = "onPlay={setActiveMovie} />"
start_idx = content.find('<FeaturedHero movies={')

if start_idx == -1:
    print("Not found start")
    exit(1)

end_idx = content.find(target, start_idx) + len(target)

replacement = """
            {historyMovies.length > 0 && (
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
            
            {watchlistMovies.length > 0 && (
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
"""

new_content = content[:end_idx] + replacement + content[end_idx:]

with open('src/App.tsx', 'w') as f:
    f.write(new_content)

print("Patched App.tsx")
