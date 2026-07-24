const fs = require('fs');

let content = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

// Remove Server tab from settings
content = content.replace(
  /<button\s+onClick=\{\(\) => setActiveSettingsTab\('server'\)\}[\s\S]*?Server\s+<\/button>/,
  ''
);

// Remove activeSettingsTab === 'server' check and its content
const serverTabContentRegex = /\{\/\* Tab 1: Server Choice \*\/\}\s*\{activeSettingsTab === 'server' && \([\s\S]*?\}\)\}\s*<\/div>\s*\)\}\s*/;
content = content.replace(serverTabContentRegex, '');

// Since server is removed, default activeSettingsTab should be 'quality'
content = content.replace(
  /const \[activeSettingsTab, setActiveSettingsTab\] = useState<'server' \| 'quality' \| 'subtitle'>\('server'\);/,
  "const [activeSettingsTab, setActiveSettingsTab] = useState<'server' | 'quality' | 'subtitle'>('quality');"
);

// Add the Server Selector UI right before {/* Multi-Source VIP Embed Switcher */}
const serverSelectorUI = `
          {/* Main Server Selector */}
          <div className="px-6 py-3 bg-zinc-950/90 border-t border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs font-semibold text-zinc-300">
                Pilih Server Streaming:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'auto', label: 'Auto' },
                { id: 'strigil', label: 'Strigil (VIP)' },
                { id: 'idlix', label: 'IDLIX' },
                { id: 'moviebox', label: 'Moviebox (Anti-Lag)' },
                { id: 'videasy', label: 'Videasy' }
              ].map(srv => {
                const isActive = selectedServer === srv.id;
                return (
                  <button
                    key={srv.id}
                    onClick={() => {
                      const srvId = srv.id as 'auto' | 'idlix' | 'moviebox' | 'strigil' | 'videasy';
                      setSelectedServer(srvId);
                      fetchDetailForServer(srvId);
                    }}
                    className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 \${
                      isActive
                        ? 'bg-[var(--color-primary-red)] text-white shadow-red-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
                    }\`}
                  >
                    {srv.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Multi-Source VIP Embed Switcher */}`;

content = content.replace(/{ \/\* Multi-Source VIP Embed Switcher \*\/ }/, serverSelectorUI);

fs.writeFileSync('src/components/VideoModal.tsx', content);
console.log("Server selector moved successfully.");
