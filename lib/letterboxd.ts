import type { FilmEntry, LetterboxdProfile } from "@/types";

const SCRAPER_URL = process.env.SCRAPER_SERVICE_URL ?? "http://localhost:8001";

export async function scrapeProfile(username: string): Promise<LetterboxdProfile> {
  const res = await fetch(`${SCRAPER_URL}/profile/${encodeURIComponent(username)}`, {
    signal: AbortSignal.timeout(30000),
  });
  if (res.status === 404) throw new Error("Profile not found");
  if (!res.ok) throw new Error(`Scraper error: ${res.status}`);
  const data = await res.json();
  return {
    username: data.username,
    displayName: data.displayName,
    avatarUrl: data.avatarUrl,
    totalFilms: data.totalFilms,
  };
}

export async function scrapeFilms(username: string): Promise<FilmEntry[]> {
  const res = await fetch(`${SCRAPER_URL}/films/${encodeURIComponent(username)}`, {
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) throw new Error(`Scraper error: ${res.status}`);
  const data = await res.json();
  return data.films.map((f: any) => ({
    title: f.title,
    year: f.year,
    slug: f.slug,
    letterboxdId: f.slug,
    userRating: f.userRating ?? null,
  }));
}
