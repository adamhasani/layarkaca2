import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('<FeaturedHero movies={')
if start_idx == -1:
    print("Not found start")
    exit(1)

end_idx = content.find('/>\n            {/* Section 1:', start_idx)
if end_idx == -1:
    print("Not found end")
    exit(1)
    
end_idx = content.find('/>', end_idx) + 2

replacement = """
            {historyMovies.length > 0 && (
              <div id="section-history">
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
              <div id="section-watchlist">
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
            {/* Section 1:"""

new_content = content[:end_idx] + replacement + content[end_idx+16:]

with open('src/App.tsx', 'w') as f:
    f.write(new_content)

print("Patched App.tsx")
