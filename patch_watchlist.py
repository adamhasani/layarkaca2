import re

with open('src/components/VideoModal.tsx', 'r') as f:
    content = f.read()

start_idx = content.find('              </div>\n            </div>\n\n            {/* TV Series Seasons & Episodes Selection */}')
if start_idx == -1:
    print("Not found start")
    exit(1)

replacement = """              </div>
              
              {/* Watchlist Action */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={handleToggleWatchlist}
                  disabled={isWatchlistLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    inWatchlist 
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                      : 'bg-[var(--color-primary-red)] hover:bg-red-700 text-white'
                  } disabled:opacity-50`}
                >
                  {isWatchlistLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : inWatchlist ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Film className="w-4 h-4" />
                  )}
                  {inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
                </button>
              </div>
            </div>

            {/* TV Series Seasons & Episodes Selection */}"""

new_content = content.replace('              </div>\n            </div>\n\n            {/* TV Series Seasons & Episodes Selection */}', replacement)

with open('src/components/VideoModal.tsx', 'w') as f:
    f.write(new_content)

print("Patched Watchlist Button")
