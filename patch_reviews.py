import re

with open('src/components/VideoModal.tsx', 'r') as f:
    content = f.read()

# We want to replace the part from "Ulasan Pengguna" to the end of the div
# Let's find it.
start_idx = content.find('<h4 className="text-white font-semibold text-base md:text-lg flex items-center gap-2">')
if start_idx == -1:
    print("Not found start")
    exit(1)

end_idx = content.find('</div>\n          </div>\n        </motion.div>\n      </motion.div>\n    </AnimatePresence>')
if end_idx == -1:
    print("Not found end")
    exit(1)

replacement = """<h4 className="text-white font-semibold text-base md:text-lg flex items-center gap-2 mb-4">
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
"""

new_content = content[:start_idx] + replacement + content[end_idx:]

with open('src/components/VideoModal.tsx', 'w') as f:
    f.write(new_content)

print("Patched VideoModal.tsx")
