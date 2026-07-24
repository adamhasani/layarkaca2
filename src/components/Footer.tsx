import { Sparkles, Film, ShieldCheck, Zap, Globe } from 'lucide-react';

interface FooterProps {
  onSelectCategory?: (category: string | null) => void;
}

export function Footer({ onSelectCategory }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-20 border-t border-zinc-200/80 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-950/80 backdrop-blur-2xl text-zinc-800 dark:text-zinc-200 overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-red-600/10 dark:bg-red-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-red)] flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform shrink-0">
                <span className="font-display font-bold text-white text-xl">L</span>
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-white">
                LayarZona
              </span>
            </button>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
              Platform streaming film dan serial TV terlengkap di Indonesia. Nikmati ribuan judul lokal dan internasional dengan pencarian cerdas berbasis AI.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Zap className="w-3.5 h-3.5" /> Streaming Cepat HD
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Globe className="w-3.5 h-3.5" /> Subtitle Indonesia
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Sparkles className="w-3.5 h-3.5" /> AI Search Enabled
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-primary-red)]">
              Kategori Populer
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <li>
                <button 
                  onClick={() => onSelectCategory?.('action')}
                  className="hover:text-[var(--color-primary-red)] transition-colors cursor-pointer"
                >
                  Film Action & Aksi
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory?.('horror')}
                  className="hover:text-[var(--color-primary-red)] transition-colors cursor-pointer"
                >
                  Film Horror & Misteri
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory?.('comedy')}
                  className="hover:text-[var(--color-primary-red)] transition-colors cursor-pointer"
                >
                  Film Komedi & Drama
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory?.('series')}
                  className="hover:text-[var(--color-primary-red)] transition-colors cursor-pointer"
                >
                  Serial TV & K-Drama
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Features & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-primary-red)]">
              Dukungan Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Tanpa Registrasi Wajib</span>
              </li>
              <li className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Update Rilis Setiap Hari</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-500 shrink-0" />
                <span>Multi-Server Failover</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-300 dark:via-white/10 to-transparent my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>© 2026 LayarZona Cinema. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer">Syarat & Ketentuan</span>
            <span className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer">DMCA Notice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
