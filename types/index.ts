export interface LetterboxdProfile {
  username: string;
  displayName: string;
  avatarUrl: string;
  totalFilms: number;
}

export interface FilmEntry {
  title: string;
  year: number;
  slug: string;
  letterboxdId: string;
  userRating: number | null; // 0.5 to 5.0, null if not rated
  // Enriched by TMDB:
  tmdbId?: number;
  genres?: string[];
  director?: string;
  cast?: string[];
  country?: string;
  language?: string;
  posterUrl?: string;
}

export interface ProfileStats {
  totalFilms: number;
  ratedFilms: number;
  avgRating: number;
  genreBreakdown: Record<string, number>;
  decadeBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  languageBreakdown: Record<string, number>;
  ratingDistribution: Record<string, number>;
  topDirectors: string[];
  topActors: string[];
  personalityTag: string;
}

export interface Recommendation {
  title: string;
  year: number;
  type: "movie" | "book";
  reason: string;
  matchScore: number;
  posterUrl?: string;
  author?: string; // for books
}

export interface CachedProfile {
  id?: string;
  username: string;
  lastFetchedAt: string;
  profile: LetterboxdProfile;
  stats: ProfileStats;
  recommendations: Recommendation[];
  films?: FilmEntry[];
  directorPhotos?: Record<string, string | null>;
}

// UI helper types (used by scaffold components)
export type GenreStat = { name: string; value: number };
export type DecadeStat = { decade: string; value: number };
export type CountryCount = { countryCode: string; value: number };
export type RatingBucket = { rating: string; value: number };

