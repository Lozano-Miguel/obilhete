import type {
  CountryCount,
  DecadeStat,
  GenreStat,
  FilmEntry,
  ProfileStats,
} from "@/types";

export function toGenreStats(input: Record<string, number>): GenreStat[] {
  return Object.entries(input).map(([name, value]) => ({ name, value }));
}

export function toDecadeStats(input: Record<string, number>): DecadeStat[] {
  return Object.entries(input).map(([decade, value]) => ({ decade, value }));
}

export function toCountryCounts(input: Record<string, number>): CountryCount[] {
  return Object.entries(input).map(([countryCode, value]) => ({
    countryCode,
    value,
  }));
}

function sortRecordDesc(input: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(input).sort((a, b) => b[1] - a[1]),
  );
}

function decadeLabel(year: number): string {
  if (!Number.isFinite(year) || year <= 0) return "Desconhecido";
  const d = Math.floor(year / 10) * 10;
  return `${d}s`;
}

function inc(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

export function buildProfileStats(
  films: FilmEntry[],
): Omit<ProfileStats, "personalityTag"> {
  const totalFilms = films.length;

  const ratedFilms = films.filter((f) => f.userRating !== null).length;

  const rated = films
    .map((f) => f.userRating)
    .filter((r): r is number => typeof r === "number");
  const avgRatingRaw =
    rated.length > 0 ? rated.reduce((s, r) => s + r, 0) / rated.length : 0;
  const avgRating = Math.round(avgRatingRaw * 100) / 100;

  const genreCounts: Record<string, number> = {};
  const decadeCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  const languageCounts: Record<string, number> = {};
  const ratingDist: Record<string, number> = {};
  const directorCounts: Record<string, number> = {};
  const actorCounts: Record<string, number> = {};

  for (const film of films) {
    // Genres
    if (film.genres) {
      for (const g of film.genres) {
        const key = String(g).trim();
        if (key) inc(genreCounts, key);
      }
    }

    // Decade
    inc(decadeCounts, decadeLabel(film.year));

    // Country / language
    if (film.country) {
      const key = String(film.country).trim();
      if (key) inc(countryCounts, key);
    }
    if (film.language) {
      const key = String(film.language).trim();
      if (key) inc(languageCounts, key);
    }

    // Rating distribution
    if (typeof film.userRating === "number") {
      const key = film.userRating.toFixed(1);
      inc(ratingDist, key);
    }

    // Directors
    if (film.director) {
      const key = String(film.director).trim();
      if (key) inc(directorCounts, key);
    }

    // Actors
    if (film.cast) {
      for (const a of film.cast) {
        const key = String(a).trim();
        if (key) inc(actorCounts, key);
      }
    }
  }

  // Ensure all possible rating keys exist (0.5..5.0 step 0.5)
  for (let r = 0.5; r <= 5.0 + 1e-9; r += 0.5) {
    const key = r.toFixed(1);
    ratingDist[key] = ratingDist[key] ?? 0;
  }

  const genreBreakdown = sortRecordDesc(genreCounts);
  const decadeBreakdown = sortRecordDesc(decadeCounts);
  const countryBreakdown = sortRecordDesc(countryCounts);
  const languageBreakdown = sortRecordDesc(languageCounts);
  const ratingDistribution = sortRecordDesc(ratingDist);

  const topDirectors = Object.entries(directorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const topActors = Object.entries(actorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  return {
    totalFilms,
    ratedFilms,
    avgRating,
    genreBreakdown,
    decadeBreakdown,
    countryBreakdown,
    languageBreakdown,
    ratingDistribution,
    topDirectors,
    topActors,
  };
}

