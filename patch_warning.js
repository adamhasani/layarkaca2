import fs from 'fs';
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

if (!code.includes('showStuckWarning')) {
  // Add state
  code = code.replace(
    "const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);",
    "const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);\n  const [showStuckWarning, setShowStuckWarning] = useState<boolean>(false);"
  );

  // Add useEffect
  code = code.replace(
    "useEffect(() => {",
    `useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (detailedMovie?.embedUrl || detailedMovie?.streamUrl) {
      setShowStuckWarning(false);
      timeout = setTimeout(() => {
        setShowStuckWarning(true);
      }, 8000);
    }
    return () => clearTimeout(timeout);
  }, [detailedMovie?.embedUrl, detailedMovie?.streamUrl]);

  useEffect(() => {`
  );

  // Add the warning UI inside the Video Area
  const videoAreaStr = `{isVideoLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-[var(--color-primary-red)] animate-spin" />
                  </div>
                )}
              </>
            ) : isDetailLoading ? (`;

  const newVideoAreaStr = `{isVideoLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-[var(--color-primary-red)] animate-spin" />
                  </div>
                )}
                {showStuckWarning && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full py-1.5 px-4 flex items-center gap-3 shadow-2xl">
                      <span className="text-xs text-white font-medium">Masih loading? Coba ganti server di bawah 👇</span>
                      <button onClick={() => setShowStuckWarning(false)} className="text-zinc-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : isDetailLoading ? (`;
  
  code = code.replace(videoAreaStr, newVideoAreaStr);

  fs.writeFileSync('src/components/VideoModal.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Already patched");
}
