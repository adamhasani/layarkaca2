import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Add a bookmark and history icon in navbar for logged in users
start_idx = content.find('          {/* Right Section: Theme & Profile */}')
if start_idx == -1:
    print("Not found start")
    exit(1)

replacement = """
          {/* Quick Links for Logged in Users */}
          {user && (
            <div className="hidden md:flex items-center gap-2 mr-2">
              <button
                onClick={() => {
                  document.getElementById('section-history')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors text-sm font-medium"
                title="Riwayat Tontonan"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden lg:inline">Riwayat</span>
              </button>
              <button
                onClick={() => {
                  document.getElementById('section-watchlist')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors text-sm font-medium"
                title="Daftar Tontonan"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden lg:inline">Watchlist</span>
              </button>
            </div>
          )}

          {/* Right Section: Theme & Profile */}"""

new_content = content[:start_idx] + replacement + content[start_idx+38:]
with open('src/components/Navbar.tsx', 'w') as f:
    f.write(new_content)

print("Patched Navbar")
