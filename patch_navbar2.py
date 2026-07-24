import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('          {/* Right Action Icons')
if start_idx == -1:
    print("Not found start")
    exit(1)

replacement = """          {/* Quick Links for Logged in Users */}
          {user && (
            <div className="hidden md:flex items-center gap-2 mr-2">
              <button
                onClick={() => {
                  document.getElementById('section-history')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors text-sm font-medium cursor-pointer"
                title="Riwayat Tontonan"
              >
                <span className="hidden lg:inline">Riwayat</span>
              </button>
              <button
                onClick={() => {
                  document.getElementById('section-watchlist')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors text-sm font-medium cursor-pointer"
                title="Daftar Tontonan"
              >
                <span className="hidden lg:inline">Watchlist</span>
              </button>
            </div>
          )}

          {/* Right Action Icons"""

new_content = content[:start_idx] + replacement + content[start_idx+28:]

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(new_content)

print("Patched Navbar 2")
