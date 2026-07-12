import type { FilmEntry } from "@/types";

const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function hasKey() {
  if (!process.env.TMDB_API_KEY) {
    console.log("[tmdb] Missing TMDB_API_KEY");
    return false;
  }
  return true;
}

async function tmdbGet<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T | null> {
  if (!hasKey()) return null;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${TMDB_API_BASE}${normalizedPath}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    console.log("[tmdb] request failed", {
      path,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

type TmdbSearchResponse = {
  results?: Array<{ id: number }>;
};

export async function searchFilm(
  title: string,
  year: number,
): Promise<number | null> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return null;

  const withYear = await tmdbGet<TmdbSearchResponse>("/search/movie", {
    query: trimmedTitle,
    year,
  });
  const firstWithYear = withYear?.results?.[0]?.id ?? null;
  if (firstWithYear) return firstWithYear;

  const withoutYear = await tmdbGet<TmdbSearchResponse>("/search/movie", {
    query: trimmedTitle,
  });
  return withoutYear?.results?.[0]?.id ?? null;
}

type TmdbMovieDetails = {
  id: number;
  poster_path?: string | null;
  original_language?: string | null;
  genres?: Array<{ name: string }>;
  production_countries?: Array<{ name: string }>;
  spoken_languages?: Array<{ english_name?: string | null }>;
  credits?: {
    cast?: Array<{ name: string }>;
    crew?: Array<{ job: string; name: string }>;
  };
};

export async function getFilmDetails(
  tmdbId: number,
): Promise<Partial<FilmEntry>> {
  const data = await tmdbGet<TmdbMovieDetails>(`/movie/${tmdbId}`, {
    append_to_response: "credits",
  });
  if (!data) return { tmdbId };

  const genres = data.genres?.map((g) => g.name).filter(Boolean) ?? undefined;
  const country = data.production_countries?.[0]?.name ?? undefined;

  const language =
    data.spoken_languages?.[0]?.english_name ??
    data.original_language ??
    undefined;

  const director =
    data.credits?.crew?.find((p) => p.job === "Director")?.name ?? undefined;

  const cast =
    data.credits?.cast?.slice(0, 5).map((p) => p.name).filter(Boolean) ??
    undefined;

  const posterUrl = data.poster_path
    ? `${TMDB_IMAGE_BASE}${data.poster_path}`
    : undefined;

  return {
    tmdbId: data.id ?? tmdbId,
    genres,
    country,
    language,
    director,
    cast,
    posterUrl,
  };
}

export async function getDirectorPhoto(name: string): Promise<string | null> {
  const data = await tmdbGet<{ results?: Array<{ profile_path?: string | null }> }>(
    "/search/person",
    { query: name, limit: 1 },
  );
  const person = data?.results?.[0];
  if (!person || !person.profile_path) return null;
  return `https://image.tmdb.org/t/p/w185${person.profile_path}`;
}

export async function enrichFilms(films: FilmEntry[]): Promise<FilmEntry[]> {
  const out: FilmEntry[] = [];

  for (let i = 0; i < films.length; i++) {
    const film = films[i];

    try {
      const tmdbId = await searchFilm(film.title, film.year);
      if (!tmdbId) {
        out.push(film);
      } else {
        const details = await getFilmDetails(tmdbId);
        out.push({ ...film, ...details, tmdbId });
      }
    } catch (err) {
      console.log("[tmdb] enrich failed", {
        title: film.title,
        message: err instanceof Error ? err.message : String(err),
      });
      out.push(film);
    }

    const done = i + 1;
    if (done % 10 === 0) {
      console.log(`[tmdb] Enriched ${done}/${films.length} films...`);
    }

    if (done < films.length) await sleep(250);
  }

  return out;
}

