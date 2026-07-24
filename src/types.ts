export interface Subtitle {
  lang: string;
  label: string;
  path?: string;
  url?: string;
}

export interface Review {
  id: string;
  user: string;
  comment: string;
  rating: number;
  avatarUrl: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  categories: string[];
  rating: number;
  year: number;
  duration: string;
  posterUrl: string;
  bannerUrl: string;
  subtitles: Subtitle[];
  reviews: Review[];
  match: number;
  type?: 'movie' | 'series' | 'tv_series';
  streamUrl?: string;
  embedUrl?: string;
  embedSources?: { name: string; url: string }[];
  server?: string;
  sources?: { label: string; url: string; type?: string }[];
  cast?: string[];
  director?: string;
  tagline?: string;
  releaseDate?: string;
  rank?: string | number;
  viewersCount?: number;
  viewersText?: string;
  boxOffice?: string;
  tmdbId?: string | number;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  unread: boolean;
  type: 'release' | 'system';
}

export interface Category {
  id: string;
  name: string;
}
