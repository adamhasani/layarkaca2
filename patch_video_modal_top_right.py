import re

with open('src/components/VideoModal.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('              <button \n                onClick={() => setShowSettingsMenu(!showSettingsMenu)}')
if start_idx == -1:
    print("Not found start")
    exit(1)

replacement = """              {/* Watchlist Quick Action */}
              <button
                onClick={handleToggleWatchlist}
                disabled={isWatchlistLoading}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md transition-colors text-xs sm:text-sm font-semibold border ${
                  inWatchlist 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30' 
                    : 'bg-black/60 hover:bg-[var(--color-primary-red)] text-white border-white/20 hover:border-transparent'
                } disabled:opacity-50`}
                title={inWatchlist ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}
              >
                {isWatchlistLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : inWatchlist ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{inWatchlist ? "Di Watchlist" : "Watchlist"}</span>
              </button>

              <button 
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}"""

new_content = content[:start_idx] + replacement + content[start_idx+106:]

with open('src/components/VideoModal.tsx', 'w') as f:
    f.write(new_content)

print("Patched Video Modal Top Right")
