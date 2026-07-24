const fs = require('fs');
let content = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

// Add imports
if (!content.includes('useAuth')) {
  content = content.replace(
    /import \{ useState, useEffect, useRef \} from 'react';/,
    "import { useState, useEffect, useRef } from 'react';\nimport { useAuth } from '../hooks/useAuth';\nimport { addToWatchlist, removeFromWatchlist, checkInWatchlist, addReview, getReviews, updateHistory, ReviewItem } from '../lib/firestore';"
  );
}

// Add state variables and hooks inside the component
content = content.replace(
  /const \[selectedEpisode, setSelectedEpisode\] = useState<number>\(1\);/,
  `const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const { user } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewInput, setReviewInput] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);`
);

// Add useEffect to load watchlist and reviews
content = content.replace(
  /useEffect\(\(\) => \{\n    if \(!movie\) return;/,
  `useEffect(() => {
    if (!movie) return;
    
    // Load watchlist status
    if (user && movie.id) {
      checkInWatchlist(user.uid, movie.id).then(setInWatchlist).catch(console.error);
    }
    
    // Load reviews
    if (movie.id) {
      getReviews(movie.id).then(setReviews).catch(console.error);
    }
    
    // Track history when video opens
    if (user && movie.id) {
      updateHistory(user.uid, movie, 0, selectedSeason, selectedEpisode).catch(console.error);
    }
    
`
);

// Replace the mock reviews array mapping with real reviews mapping
content = content.replace(
  /\{\[1, 2, 3\]\.map\(\(i\) => \(\n\s+<div key=\{i\} className="bg-white\/5 border border-white\/5 p-4 rounded-xl">[\s\S]*?<\/p>\n\s+<\/div>\n\s+<\/div>\n\s+\)\)\}/,
  `{reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id || Math.random().toString()} className="bg-white/5 border border-white/5 p-4 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <img src={review.userAvatar || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(review.userDisplayName)}\`} alt={review.userDisplayName} className="w-10 h-10 rounded-full" />
                            <div>
                              <p className="text-white font-medium text-sm">{review.userDisplayName}</p>
                              <div className="flex items-center text-[var(--color-primary-yellow)] text-xs mt-0.5">
                                {[...Array(5)].map((_, idx) => (
                                  <Star key={idx} className={\`w-3 h-3 \${idx < review.rating ? 'fill-current' : 'text-zinc-600'}\`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {review.createdAt?.toMillis ? new Date(review.createdAt.toMillis()).toLocaleDateString() : 'Baru saja'}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 mt-3 leading-relaxed">
                          {review.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-zinc-400 text-sm">Belum ada ulasan untuk film ini. Jadilah yang pertama!</p>
                    </div>
                  )}`
);

// We need to inject functions for Watchlist and Reviews
const functionsToInject = `
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
      const avatar = \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(user.displayName || user.email || 'User')}\`;
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
`;

content = content.replace(
  /const fetchDetailForServer = /g,
  functionsToInject + "\n\n  const fetchDetailForServer = "
);


// And update the review form
const reviewFormRegex = /<div className="bg-white\/5 border border-white\/5 p-4 rounded-xl mb-6">[\s\S]*?<\/div>\n\s+<\/div>/;
const newReviewForm = `
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="bg-white/5 border border-white/5 p-4 rounded-xl mb-6">
                      <h4 className="text-white font-semibold text-sm mb-3">Tambahkan Ulasan</h4>
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={\`focus:outline-none transition-colors \${star <= reviewRating ? 'text-[var(--color-primary-yellow)]' : 'text-zinc-600 hover:text-zinc-400'}\`}
                          >
                            <Star className={\`w-5 h-5 \${star <= reviewRating ? 'fill-current' : ''}\`} />
                          </button>
                        ))}
                      </div>
                      <textarea 
                        value={reviewInput}
                        onChange={(e) => setReviewInput(e.target.value)}
                        placeholder="Bagaimana pendapat Anda tentang film ini?" 
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--color-primary-red)] transition-colors min-h-[100px]"
                        required
                      ></textarea>
                      <div className="flex justify-end mt-3">
                        <button type="submit" disabled={isSubmittingReview} className="px-5 py-2 bg-[var(--color-primary-red)] hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
                          {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Kirim Ulasan"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl mb-6 text-center">
                      <p className="text-zinc-400 text-sm mb-3">Anda harus login untuk menulis ulasan.</p>
                    </div>
                  )}`;
content = content.replace(reviewFormRegex, newReviewForm);


// Update Watchlist button UI
content = content.replace(
  /<button className="flex items-center gap-2 px-4 py-2 bg-white\/5 hover:bg-white\/10 text-white rounded-xl text-xs font-semibold border border-white\/10 transition-all">/,
  `<button onClick={handleToggleWatchlist} disabled={isWatchlistLoading} className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all \${inWatchlist ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'} disabled:opacity-50\`}>`
);
content = content.replace(
  /<Check className="w-4 h-4" \/>\n\s+<span>Simpan ke Daftar Tontonan<\/span>/,
  `{isWatchlistLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}\n                    <span>{inWatchlist ? 'Tersimpan di Daftar' : 'Simpan ke Daftar Tontonan'}</span>`
);


fs.writeFileSync('src/components/VideoModal.tsx', content);
console.log("Updated VideoModal.tsx with Firestore");
