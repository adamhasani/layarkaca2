import { X, Settings, Plus, Bookmark, Subtitles, Activity, Star, Loader2, AlertCircle, Clock, Film, MessageSquare, Check, Users, Clapperboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addToWatchlist, removeFromWatchlist, checkInWatchlist, addReview, getReviews, updateHistory, ReviewItem } from '../lib/firestore';
import Hls from 'hls.js';
import { Movie } from '../types';

interface VideoModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export function VideoModal({ movie, onClose }: VideoModalProps) {
  const [quality, setQuality] = useState('Auto');
  const [subtitle, setSubtitle] = useState('en');
  const [showSettings, setShowSettings] = useState(false);
  const [connSpeed, setConnSpeed] = useState('Excellent');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [detailedMovie, setDetailedMovie] = useState<Movie | null>(movie);
  const [selectedServer, setSelectedServer] = useState<'auto' | 'idlix' | 'moviebox' | 'strigil' | 'videasy' | 'lk21'>('auto');
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(!movie?.streamUrl && !movie?.embedUrl);

  const [selectedSubLang, setSelectedSubLang] = useState<string>('id');
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [subFontSize, setSubFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'server' | 'quality' | 'subtitle'>('quality');

  // Series Season & Episode states
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const { user } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewInput, setReviewInput] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [seasonsList, setSeasonsList] = useState<any[]>([]);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  
  const handleToggleWatchlist = async () => {
    if (!user || !movie) {
      alert("Silakan login terlebih dahulu untuk menyimpan ke daftar tontonan.");
      return;
    }
    setIsWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlist(user.uid, movie.id);
        setInWatchlist(false);
      } else {
        await addToWatchlist(user.uid, detailedMovie || movie);
        setInWatchlist(true);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal mengupdate daftar tontonan.");
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !movie || !reviewInput.trim()) {
      if (!user) alert("Silakan login terlebih dahulu untuk menambahkan ulasan.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'User')}`;
      await addReview(user.uid, movie.id, user.displayName || 'Member LayarZona', avatar, reviewInput, reviewRating);
      setReviewInput('');
      setReviewRating(5);
      
      // Reload reviews
      const updatedReviews = await getReviews(movie.id);
      setReviews(updatedReviews);
    } catch (e) {
      console.error(e);
      alert("Gagal menambahkan ulasan.");
    } finally {
      setIsSubmittingReview(false);
    }
  };


  const fetchDetailForServer = (srv: 'auto' | 'idlix' | 'moviebox' | 'strigil' | 'videasy' | 'lk21', seasonNum?: number, episodeNum?: number) => {
    if (!movie) return;
    setIsDetailLoading(true);
    setIsVideoLoading(true);

    const activeSeason = seasonNum !== undefined ? seasonNum : selectedSeason;
    const activeEpisode = episodeNum !== undefined ? episodeNum : selectedEpisode;

    let url = `/api/detail?query=${encodeURIComponent(movie.title)}&slug=${encodeURIComponent(movie.id)}&year=${movie.year || ''}${movie.type ? `&type=${movie.type}` : ''}&server=${srv}${movie.tmdbId ? `&tmdbId=${movie.tmdbId}` : ''}`;
    
    const isTvSeries = movie.type === 'series' || movie.type === 'tv_series' || movie.id?.includes('series') || movie.id?.includes('-s1') || movie.id?.includes('-season');
    if (isTvSeries) {
      url += `&season=${activeSeason}&episode=${activeEpisode}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.status && data.result) {
          const detail = data.result.detail || {};
          const fetchedSubs = data.result.subtitles || movie.subtitles || [];
          
          if (data.result.seasons) {
            setSeasonsList(data.result.seasons);
          }

          setDetailedMovie(prev => ({
            ...(prev || movie),
            description: detail.synopsis || movie.description,
            categories: detail.genres || movie.categories,
            rating: detail.rating || movie.rating,
            duration: detail.duration || detail.resolution || movie.duration,
            posterUrl: data.result.poster || movie.posterUrl,
            bannerUrl: data.result.poster || movie.bannerUrl,
            streamUrl: data.result.streamUrl,
            embedUrl: data.result.embedUrl,
            embedSources: data.result.embedSources,
            server: data.server || (srv === 'moviebox' ? 'Moviebox' : 'IDLIX'),
            subtitles: fetchedSubs,
            sources: data.result.sources || [],
            cast: detail.cast || (prev || movie).cast,
            director: detail.director || (prev || movie).director,
            tagline: detail.tagline || (prev || movie).tagline,
            releaseDate: detail.releaseDate || (prev || movie).releaseDate
          }));

          // Auto select Indonesian or first available subtitle
          if (fetchedSubs.length > 0) {
            const idSub = fetchedSubs.find((s: any) => s.lang?.includes('id') || s.label?.toLowerCase().includes('indonesia'));
            if (idSub) setSelectedSubLang(idSub.lang);
            else setSelectedSubLang(fetchedSubs[0].lang);
          }
        } else {
          setDetailedMovie(prev => ({
            ...(prev || movie),
            streamUrl: undefined,
            embedUrl: undefined,
            server: srv === 'moviebox' ? 'Moviebox' : 'IDLIX'
          }));
        }
      })
      .catch(err => {
        console.error("Failed to fetch detail", err);
      })
      .finally(() => {
        setIsDetailLoading(false);
      });
  };

  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(1);
    fetchDetailForServer(selectedServer, seasonNum, 1);
  };

  const handleEpisodeChange = (episodeNum: number) => {
    setSelectedEpisode(episodeNum);
    fetchDetailForServer(selectedServer, selectedSeason, episodeNum);
  };

  const hasTrackedHistory = useRef(false);

  // User-dependent side effects
  useEffect(() => {
    if (!movie) return;
    if (user && movie.id) {
      checkInWatchlist(user.uid, movie.id).then(setInWatchlist).catch(console.error);
      
      if (!hasTrackedHistory.current) {
        hasTrackedHistory.current = true;
        updateHistory(user.uid, movie, 0, selectedSeason, selectedEpisode).catch(console.error);
      }
    }
  }, [movie, user]);

  useEffect(() => {
    if (!movie) return;
    hasTrackedHistory.current = false; // reset when movie changes
    
    // Load reviews
    if (movie.id) {
      getReviews(movie.id).then(setReviews).catch(console.error);
    }
    
    document.body.style.overflow = 'hidden';

    setDetailedMovie(movie);
    setSeasonsList([]);
    setSelectedSeason(1);
    setSelectedEpisode(1);
    
    if (!movie.streamUrl && !movie.embedUrl) {
      fetchDetailForServer(selectedServer, 1, 1);
    } else {
      setIsDetailLoading(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [movie]);

  useEffect(() => {
    if (detailedMovie?.streamUrl && videoRef.current) {
      setIsVideoLoading(true);
      const video = videoRef.current;
      if (Hls.isSupported() && detailedMovie.streamUrl.includes('.m3u8')) {
        const hls = new Hls({
          autoStartLoad: true,
          capLevelToPlayerSize: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1024 * 1024,
          lowLatencyMode: true,
          xhrSetup: function(xhr, url) {
            xhr.open('GET', `/api/proxy?url=${encodeURIComponent(url)}`, true);
          }
        });
        hls.loadSource(detailedMovie.streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isPlaying) video.play().catch(e => console.log('Auto-play blocked:', e));
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        return () => hls.destroy();
      } else {
        video.src = detailedMovie.streamUrl;
      }
    }
  }, [detailedMovie?.streamUrl, isPlaying]);

  // Switch video text track mode whenever selectedSubLang changes
  useEffect(() => {
    if (videoRef.current && videoRef.current.textTracks) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (selectedSubLang === 'off') {
          track.mode = 'disabled';
        } else if (
          track.language === selectedSubLang ||
          track.label?.toLowerCase().includes(selectedSubLang.toLowerCase()) ||
          (selectedSubLang.includes('id') && (track.language?.includes('id') || track.label?.toLowerCase().includes('indonesia')))
        ) {
          track.mode = 'showing';
        } else {
          track.mode = 'disabled';
        }
      }
    }
  }, [selectedSubLang, detailedMovie?.subtitles, isVideoLoading]);

  // Simulate network speed detection
  useEffect(() => {
    if (detailedMovie) {
      const speeds = ['Excellent', 'Good', 'Fair'];
      setConnSpeed(speeds[Math.floor(Math.random() * speeds.length)]);
      
      // Auto adjust quality based on random simulated speed
      setTimeout(() => {
        if (connSpeed === 'Excellent') setQuality('4K UHD');
        else if (connSpeed === 'Good') setQuality('1080p HD');
        else setQuality('720p');
      }, 1500);
    }
  }, [detailedMovie, connSpeed]);

  if (!detailedMovie) return null;

  const isTvSeries = movie?.type === 'series' || movie?.type === 'tv_series' || movie?.id?.includes('series') || movie?.id?.includes('-s1') || movie?.id?.includes('-season');

  const seasonsToRender = seasonsList.length > 0 
    ? seasonsList.filter(s => s.season_number > 0 || seasonsList.length === 1)
    : [{ name: 'Season 1', season_number: 1, episode_count: 12 }];

  const currentSeasonObj = seasonsToRender.find(s => s.season_number === selectedSeason) || seasonsToRender[0];
  const episodeCount = currentSeasonObj?.episode_count || 12;

  const hasRealVideo = detailedMovie.streamUrl || detailedMovie.embedUrl;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/95 backdrop-blur-xl overflow-y-auto"
      >
        <div className="absolute inset-0" onClick={onClose} />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col my-auto z-10"
        >
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 p-3 sm:p-5 flex justify-between items-center z-30 bg-gradient-to-b from-black/95 via-black/60 to-transparent pointer-events-none">
            <div className="flex items-center gap-2.5 pr-4 pointer-events-auto overflow-hidden">
              <h2 className="text-white font-display font-semibold text-sm sm:text-lg md:text-xl drop-shadow-md truncate">{detailedMovie.title}</h2>
              {detailedMovie.server && (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {detailedMovie.server}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pointer-events-auto shrink-0">
              {/* Single Unified Pengaturan Button */}
              {/* Watchlist Quick Action */}
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
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}    className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 text-xs font-semibold transition-all border ${
                  showSettingsMenu
                    ? 'bg-[var(--color-primary-red)] text-white border-red-500 shadow-[0_0_15px_rgba(217,4,41,0.5)]'
                    : 'bg-black/80 text-zinc-200 border-white/20 hover:bg-white/15'
                }`}
                title="Pengaturan Video (Quality, Subtitle)"
              >
                <Settings className={`w-4 h-4 text-zinc-300 ${showSettingsMenu ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Pengaturan</span>
              </button>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/80 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors border border-white/20"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Unified Pengaturan Popover Menu */}
          <AnimatePresence>
            {showSettingsMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-14 right-3 sm:right-6 z-50 w-80 sm:w-96 bg-zinc-950/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-4 text-white font-sans pointer-events-auto overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[var(--color-primary-red)]" />
                    <span className="font-semibold text-sm">Pengaturan Putar Video</span>
                  </div>
                  <button onClick={() => setShowSettingsMenu(false)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs Navigation */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-xl mb-3 text-xs font-semibold">
                  
                  <button
                    onClick={() => setActiveSettingsTab('quality')}
                    className={`py-1.5 rounded-lg transition-all ${
                      activeSettingsTab === 'quality'
                        ? 'bg-[var(--color-primary-red)] text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Kualitas
                  </button>
                  <button
                    onClick={() => setActiveSettingsTab('subtitle')}
                    className={`py-1.5 rounded-lg transition-all ${
                      activeSettingsTab === 'subtitle'
                        ? 'bg-[var(--color-primary-red)] text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Subtitle
                  </button>
                </div>

                {/* Tab 1: Server Choice */}
                {activeSettingsTab === 'server' && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                      Pilih Server Streaming
                    </span>

                    {[
                      { id: 'auto', label: 'Auto (Otomatis Pilih Terbaik)', desc: 'Mencoba IDLIX, Strigil, Moviebox & Videasy' },
                      { id: 'strigil', label: 'Server Strigil (VIP 💎)', desc: 'Server premium multi-source, full speed HD' },
                      { id: 'idlix', label: 'Server IDLIX', desc: 'Server utama film & serial Barat/Indo' },
                      { id: 'moviebox', label: 'Server Moviebox ⚡', desc: 'Lancar & hemat kuota, rilis cepat' },
                      { id: 'videasy', label: 'Server Videasy 🚀', desc: 'Server alternatif, cepat, andal & jernih' }
                    ].map(srv => (
                      <button
                        key={srv.id}
                        onClick={() => {
                          const srvId = srv.id as 'auto' | 'idlix' | 'moviebox' | 'strigil' | 'videasy' | 'lk21';
                          setSelectedServer(srvId);
                          fetchDetailForServer(srvId);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left border transition-all ${
                          selectedServer === srv.id
                            ? 'bg-red-500/15 border-red-500/50 text-white'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{srv.label}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{srv.desc}</div>
                        </div>
                        {selectedServer === srv.id && <Check className="w-4 h-4 text-red-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab 2: Quality Choice */}
                {activeSettingsTab === 'quality' && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                      Pilih Resolusi / Kualitas Video
                    </span>

                    {detailedMovie.sources && detailedMovie.sources.length > 0 ? (
                      detailedMovie.sources.map((src, idx) => {
                        const isSelected = detailedMovie.streamUrl === src.url;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setIsVideoLoading(true);
                              setDetailedMovie(prev => prev ? { ...prev, streamUrl: src.url } : null);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{src.label}</span>
                              {(src.label === '480p' || src.label === '360p') && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Lancar / Smooth⚡</span>
                              )}
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 bg-white/5 rounded-xl text-xs text-zinc-400 leading-relaxed">
                        Kualitas video dikontrol otomatis dalam mode HD oleh server {detailedMovie.server || 'IDLIX'}.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Subtitle Choice */}
                {activeSettingsTab === 'subtitle' && (
                  <div className="space-y-3">
                    <div className="space-y-1 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                      <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                        Pilih Bahasa Subtitle
                      </span>

                      <button
                        onClick={() => setSelectedSubLang('off')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          selectedSubLang === 'off' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'hover:bg-white/5 text-zinc-300'
                        }`}
                      >
                        <span>Matikan Subtitle (Off)</span>
                        {selectedSubLang === 'off' && <Check className="w-4 h-4 text-red-400" />}
                      </button>

                      {detailedMovie.subtitles && detailedMovie.subtitles.length > 0 ? (
                        detailedMovie.subtitles.map((sub, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSubLang(sub.lang)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                              selectedSubLang === sub.lang ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'hover:bg-white/5 text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-zinc-300">{sub.lang}</span>
                              <span>{sub.label || sub.lang}</span>
                            </div>
                            {selectedSubLang === sub.lang && <Check className="w-4 h-4 text-amber-400" />}
                          </button>
                        ))
                      ) : (
                        <div className="text-xs text-zinc-400 italic px-3 py-2 bg-white/5 rounded-xl">
                          Subtitle Bahasa Indonesia sudah aktif langsung di video.
                        </div>
                      )}
                    </div>

                    {/* Subtitle Font Size */}
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1.5">
                        Ukuran Teks Subtitle
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['normal', 'large', 'xlarge'] as const).map(sz => (
                          <button
                            key={sz}
                            onClick={() => setSubFontSize(sz)}
                            className={`py-1.5 text-[11px] rounded-lg font-medium border transition-colors ${
                              subFontSize === sz 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            {sz === 'normal' ? 'Sedang' : sz === 'large' ? 'Besar' : 'Sangat Besar'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Area */}
          <div className="w-full aspect-video relative bg-black group flex items-center justify-center overflow-hidden">
            {detailedMovie.streamUrl ? (
              <>
                <video 
                  ref={videoRef}
                  controls={true}
                  className="absolute top-0 left-0 w-full h-full z-10"
                  autoPlay={isPlaying}
                  preload="auto"
                  playsInline
                  crossOrigin="anonymous"
                  onWaiting={() => setIsVideoLoading(true)}
                  onPlaying={() => setIsVideoLoading(false)}
                  onCanPlay={() => setIsVideoLoading(false)}
                >
                  {detailedMovie.subtitles?.map((sub, idx) => (
                    <track 
                      key={idx}
                      kind="subtitles"
                      src={sub.path || sub.url}
                      srcLang={sub.lang || 'id'}
                      label={sub.label || sub.lang || 'Subtitle'}
                      default={sub.lang?.includes('id') || idx === 0}
                    />
                  ))}
                </video>
                {isVideoLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-[var(--color-primary-red)] animate-spin" />
                  </div>
                )}
              </>
            ) : detailedMovie.embedUrl ? (
              <>
                <iframe 
                  src={detailedMovie.embedUrl} 
                  className="w-full h-full border-0 absolute top-0 left-0 z-10"
                  allowFullScreen
                  onLoad={() => setIsVideoLoading(false)}
                />
                {isVideoLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-[var(--color-primary-red)] animate-spin" />
                  </div>
                )}
              </>
            ) : isDetailLoading ? (
              <>
                <img 
                  src={typeof detailedMovie.bannerUrl === 'string' ? detailedMovie.bannerUrl.replace('/w500/', '/original/') : (detailedMovie.posterUrl || 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2TGbiU05v.jpg')} 
                  alt={detailedMovie.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-30 blur-sm scale-105"
                />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-md p-6 text-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-primary-red)]/20 border border-[var(--color-primary-red)]/50 flex items-center justify-center animate-ping absolute inset-0" />
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-primary-red)] text-white flex items-center justify-center shadow-[0_0_50px_rgba(217,4,41,0.6)] relative z-10">
                      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 max-w-md">
                    <span className="text-white font-semibold text-base sm:text-lg tracking-wide">
                      Menyiapkan Pemutar Film...
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-400">
                      Menghubungkan ke server {selectedServer === 'moviebox' ? 'Moviebox' : selectedServer === 'idlix' ? 'IDLIX' : selectedServer === 'strigil' ? 'Strigil' : selectedServer === 'videasy' ? 'Videasy' : selectedServer === 'lk21' ? 'LK21' : 'IDLIX, Strigil, Moviebox, Videasy & LK21'}...
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <img 
                  src={typeof detailedMovie.bannerUrl === 'string' ? detailedMovie.bannerUrl.replace('/w500/', '/original/') : (detailedMovie.bannerUrl || detailedMovie.posterUrl || 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2TGbiU05v.jpg')} 
                  alt="Video Poster" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-40 blur-xs scale-105"
                />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/75 backdrop-blur-md">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-amber-500 mb-4 shadow-xl">
                     <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Film Belum Tersedia
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-300 max-w-md mb-5 leading-relaxed">
                    Maaf, video streaming untuk <span className="text-white font-semibold">{detailedMovie.title}</span> {detailedMovie.year ? `(${detailedMovie.year})` : ''} belum tersedia di {selectedServer === 'auto' ? 'Server IDLIX, Strigil, Moviebox, maupun Videasy' : `Server ${selectedServer.toUpperCase()}`}.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                    <span className="text-xs text-zinc-400 w-full sm:w-auto">Coba ganti server:</span>
                    <button
                      onClick={() => { setSelectedServer('videasy'); fetchDetailForServer('videasy'); }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold border border-red-500/30 transition-all shadow-md shadow-red-600/10"
                    >
                      Coba Server Videasy 🚀
                    </button>
                    <button
                      onClick={() => { setSelectedServer('strigil'); fetchDetailForServer('strigil'); }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold border border-white/10 transition-all"
                    >
                      Coba Server Strigil VIP
                    </button>
                    <button
                      onClick={() => { setSelectedServer('moviebox'); fetchDetailForServer('moviebox'); }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold border border-white/10 transition-all"
                    >
                      Coba Server Moviebox
                    </button>
                    <button
                      onClick={() => { setSelectedServer('idlix'); fetchDetailForServer('idlix'); }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold border border-white/10 transition-all"
                    >
                      Coba Server IDLIX
                    </button>
                  </div>

                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[var(--color-primary-red)] hover:bg-red-700 text-white rounded-full font-semibold text-sm transition-all shadow-lg active:scale-95 mt-2"
                  >
                    Tutup & Pilih Film Lain
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sandboxing Warning Banner & Portable Player Option */}
          {detailedMovie.embedUrl && (
            <div className={`px-6 py-4 border-t border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left transition-all ${
              isInIframe 
                ? 'bg-amber-500/10 border-amber-500/20' 
                : 'bg-zinc-950/40 border-white/5'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isInIframe ? 'bg-amber-400' : 'bg-red-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isInIframe ? 'bg-amber-500' : 'bg-[var(--color-primary-red)]'}`}></span>
                  </span>
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${isInIframe ? 'text-amber-300' : 'text-red-400'}`}>
                    {isInIframe 
                      ? '⚠️ TERKENA SANDBOX PREVIEW? (Sandboxing is not allowed)' 
                      : '🍿 LUXURY PLAYER PORTABLE (Nonton Lebih Lega)'
                    }
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-300 max-w-2xl leading-relaxed">
                  {isInIframe 
                    ? 'Pemutar VIP memblokir pemutaran karena panel preview Google AI Studio menggunakan mode aman (sandbox). Agar film dapat dimainkan dengan lancar, silakan buka player ini di tab baru atau buka aplikasi di tab baru!'
                    : 'Ingin menonton dengan pemutar penuh tanpa gangguan? Anda dapat membuka player VIP ini langsung di tab baru browser Anda untuk menikmati resolusi 1080p dengan lebih leluasa!'
                  }
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0 self-start md:self-center">
                <a
                  href={detailedMovie.embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3.5 py-2 text-black font-extrabold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-md active:scale-95 ${
                    isInIframe 
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                      : 'bg-[var(--color-primary-red)] hover:bg-red-700 text-white shadow-red-500/20'
                  }`}
                >
                  Buka Player Baru ↗
                </a>
                <button
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-[11px] rounded-lg transition-all border border-white/10 active:scale-95"
                >
                  Buka Aplikasi Baru ↗
                </button>
              </div>
            </div>
          )}

          
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
                { id: 'moviebox', label: 'Moviebox' },
                { id: 'videasy', label: 'Videasy' },
                { id: 'lk21', label: 'LK21' }
              ].map(srv => {
                const isActive = selectedServer === srv.id;
                return (
                  <button
                    key={srv.id}
                    onClick={() => {
                      const srvId = srv.id as 'auto' | 'idlix' | 'moviebox' | 'strigil' | 'videasy' | 'lk21';
                      setSelectedServer(srvId);
                      fetchDetailForServer(srvId);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 ${
                      isActive
                        ? 'bg-[var(--color-primary-red)] text-white shadow-red-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {srv.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Multi-Source VIP Embed Switcher */}
          {detailedMovie.embedUrl && detailedMovie.embedSources && detailedMovie.embedSources.length > 0 && (
            <div className="px-6 py-3 bg-red-950/20 border-t border-b border-red-500/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-zinc-300">
                  Pilih Player VIP (Jika lambat / salah film):
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {detailedMovie.embedSources.map((src, idx) => {
                  const isActive = detailedMovie.embedUrl === src.url;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsVideoLoading(true);
                        setDetailedMovie(prev => prev ? { ...prev, embedUrl: src.url } : null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 ${
                        isActive
                          ? 'bg-[var(--color-primary-red)] text-white shadow-red-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {src.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Notice for Moviebox */}
          {detailedMovie.server === 'Moviebox' && (
            <div className="px-6 py-2.5 bg-emerald-950/60 border-t border-b border-emerald-500/20 text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] tracking-wider uppercase border border-emerald-500/30">
                  ⚡ Lancar & Cepat
                </span>
                <span>
                  Secara otomatis menggunakan kualitas {detailedMovie.sources?.find(s => s.url === detailedMovie.streamUrl)?.label || '480p'} agar video langsung lancar tanpa buffering.
                </span>
              </div>
            </div>
          )}

          {/* Movie Details, Synopsis & Reviews Section */}
          <div className="p-6 md:p-8 bg-zinc-950/90 border-t border-white/10 space-y-6">
            {/* Header: Title, Rating, Badges */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="space-y-1">
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-wide">
                    {detailedMovie.title}
                  </h3>
                  {detailedMovie.tagline && (
                    <p className="text-zinc-400 italic text-sm md:text-base font-light">
                      "{detailedMovie.tagline}"
                    </p>
                  )}
                </div>
                {detailedMovie.rating ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{detailedMovie.rating} / 10</span>
                  </div>
                ) : null}
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-zinc-400">
                {detailedMovie.year ? (
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-white font-medium">
                    {detailedMovie.year}
                  </span>
                ) : null}
                {detailedMovie.type ? (
                  <span className="px-2.5 py-0.5 rounded bg-red-600/20 border border-red-500/30 text-red-400 font-medium capitalize">
                    {detailedMovie.type}
                  </span>
                ) : null}
                {detailedMovie.duration ? (
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {detailedMovie.duration}
                  </span>
                ) : null}
                {detailedMovie.categories && detailedMovie.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                    {detailedMovie.categories.map((cat, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 text-xs border border-zinc-700/50">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
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
                    <Bookmark className="w-4 h-4" />
                  )}
                  {inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
                </button>
              </div>
            </div>

            {/* TV Series Seasons & Episodes Selection */}
            {isTvSeries && (
              <div className="space-y-4 p-5 rounded-2xl bg-zinc-950/50 border border-white/5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center text-[var(--color-primary-red)] shrink-0 animate-pulse">
                      <Clapperboard className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm sm:text-base">Daftar Season & Episode</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Sedang diputar: <span className="text-white font-bold">Season {selectedSeason} - Episode {selectedEpisode}</span></p>
                    </div>
                  </div>
                </div>

                {/* Season Tabs Selector (only visible if we have multiple seasons resolved) */}
                {seasonsToRender.length > 1 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Pilih Season</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {seasonsToRender.map(s => (
                        <button
                          key={s.season_number}
                          onClick={() => handleSeasonChange(s.season_number)}
                          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                            selectedSeason === s.season_number
                              ? 'bg-[var(--color-primary-red)] text-white border-red-500 shadow-md shadow-red-500/20'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300 hover:text-white'
                          }`}
                        >
                          {s.name || `Season ${s.season_number}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Episodes Grid Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Pilih Episode</span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                    {Array.from({ length: episodeCount }, (_, i) => i + 1).map(epNum => {
                      const isPlayingEp = selectedEpisode === epNum;
                      return (
                        <button
                          key={epNum}
                          onClick={() => handleEpisodeChange(epNum)}
                          className={`py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 ${
                            isPlayingEp
                              ? 'bg-red-500/15 border-red-500 text-white shadow-[0_0_15px_rgba(217,4,41,0.25)]'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span className="text-[9px] uppercase text-zinc-500 font-bold">EPS</span>
                          <span className="text-sm font-black">{epNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Synopsis Section */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <h4 className="text-white font-semibold text-base md:text-lg flex items-center gap-2 mb-4">
                <MessageSquare className="w-4.5 h-4.5 text-[var(--color-primary-red)]" />
                Ulasan Pengguna
              </h4>
              
              {/* Form Tambah Ulasan */}
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                {user ? (
                  <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white text-sm font-medium">Rating Anda:</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            onClick={() => setReviewRating(star)}
                            className={`w-5 h-5 cursor-pointer transition-colors ${star <= reviewRating ? 'fill-[var(--color-primary-yellow)] text-[var(--color-primary-yellow)]' : 'text-zinc-600 hover:text-zinc-400'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <textarea 
                      value={reviewInput}
                      onChange={(e) => setReviewInput(e.target.value)}
                      placeholder="Bagaimana pendapat Anda tentang film ini?"
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-primary-red)] min-h-[80px] resize-y"
                      required
                    />
                    <div className="flex justify-end">
                      <button 
                        type="submit" 
                        disabled={isSubmittingReview || !reviewInput.trim()}
                        className="px-4 py-2 bg-[var(--color-primary-red)] hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Kirim Ulasan
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-zinc-400 text-sm mb-3">Silakan login terlebih dahulu untuk menambahkan ulasan.</p>
                  </div>
                )}
              </div>

              {/* Daftar Ulasan */}
              {(() => {
                const apiReviews = detailedMovie.reviews || [];
                const fsReviews = reviews.map(r => ({
                  id: r.id || Math.random().toString(),
                  user: r.userDisplayName,
                  comment: r.content,
                  rating: r.rating,
                  avatarUrl: r.userAvatar
                }));
                const allReviews = [...fsReviews, ...apiReviews];
                
                return allReviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allReviews.map(review => (
                      <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={review.avatarUrl} alt={review.user} className="w-10 h-10 rounded-full bg-zinc-800" />
                          <div>
                            <p className="text-white font-medium text-sm">{review.user}</p>
                            <div className="flex text-[var(--color-primary-yellow)] mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-white/20'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-white/70 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm italic">Belum ada ulasan untuk film ini.</p>
                );
              })()}
</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
