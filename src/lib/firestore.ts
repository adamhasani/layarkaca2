import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, orderBy, serverTimestamp, limit } from 'firebase/firestore';
import { db } from './firebase.ts';

// Interfaces
export interface WatchlistItem {
  userId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  movieType: string;
  addedAt: any;
}

export interface HistoryItem {
  userId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  movieType: string;
  progress: number;
  season?: number;
  episode?: number;
  updatedAt: any;
}

export interface ReviewItem {
  id?: string;
  userId: string;
  movieId: string;
  userDisplayName: string;
  userAvatar: string;
  content: string;
  rating: number;
  createdAt: any;
}

// Watchlist Functions
export const addToWatchlist = async (userId: string, movie: any) => {
  const docRef = doc(db, 'watchlists', `${userId}_${movie.id}`);
  await setDoc(docRef, {
    userId,
    movieId: movie.id,
    movieTitle: movie.title,
    moviePoster: movie.posterUrl || movie.bannerUrl || '',
    movieType: movie.type || 'movie',
    addedAt: serverTimestamp()
  });
};

export const removeFromWatchlist = async (userId: string, movieId: string) => {
  const docRef = doc(db, 'watchlists', `${userId}_${movieId}`);
  await deleteDoc(docRef);
};

export const checkInWatchlist = async (userId: string, movieId: string) => {
  const docRef = doc(db, 'watchlists', `${userId}_${movieId}`);
  const snap = await getDoc(docRef);
  return snap.exists();
};

export const getWatchlist = async (userId: string) => {
  const q = query(collection(db, 'watchlists'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as WatchlistItem);
};

// History Functions
export const updateHistory = async (userId: string, movie: any, progress: number, season?: number, episode?: number) => {
  const docRef = doc(db, 'history', `${userId}_${movie.id}`);
  await setDoc(docRef, {
    userId,
    movieId: movie.id,
    movieTitle: movie.title,
    moviePoster: movie.posterUrl || movie.bannerUrl || '',
    movieType: movie.type || 'movie',
    progress,
    season: season || null,
    episode: episode || null,
    updatedAt: serverTimestamp()
  });
};

export const getHistory = async (userId: string) => {
  const q = query(collection(db, 'history'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as HistoryItem).sort((a, b) => {
    const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
    const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
    return timeB - timeA;
  });
};

// Reviews Functions
export const addReview = async (userId: string, movieId: string, userDisplayName: string, userAvatar: string, content: string, rating: number) => {
  const docRef = doc(collection(db, 'reviews'));
  await setDoc(docRef, {
    userId,
    movieId,
    userDisplayName,
    userAvatar,
    content,
    rating,
    createdAt: serverTimestamp()
  });
};

export const getReviews = async (movieId: string) => {
  const q = query(collection(db, 'reviews'), where('movieId', '==', movieId));
  // Note: Firestore requires an index if sorting with where. For simplicity, we fetch and sort on client.
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReviewItem)).sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
};
