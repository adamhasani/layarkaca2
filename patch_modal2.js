import fs from 'fs';
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

const str = `<button
                      onClick={() => { setSelectedServer('idlix'); fetchDetailForServer('idlix'); }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold border border-white/10 transition-all"
                    >
                      Coba Server IDLIX
                    </button>`;
const repl = `<button
                      onClick={() => { setSelectedServer('idlix'); fetchDetailForServer('idlix'); }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold border border-white/10 transition-all"
                    >
                      Coba Server IDLIX
                    </button>
                    <button
                      onClick={() => { setSelectedServer('lk21'); fetchDetailForServer('lk21'); }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold border border-white/10 transition-all"
                    >
                      Coba Server LK21
                    </button>`;
code = code.replace(str, repl);
fs.writeFileSync('src/components/VideoModal.tsx', code);
console.log("Patched successfully");
