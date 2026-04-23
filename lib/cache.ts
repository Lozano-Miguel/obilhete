import sql from "@/lib/db";
import type { CachedProfile } from "@/types";

const CACHE_TTL_HOURS = 24;

type CachedProfilesRow = {
  id: string;
  username: string;
  last_fetched_at: string;
  profile: CachedProfile["profile"];
  films?: CachedProfile["films"];
  stats: CachedProfile["stats"];
  recommendations: CachedProfile["recommendations"];
  director_photos?: CachedProfile["directorPhotos"];
  created_at: string;
};

function isStale(lastFetchedAtIso: string) {
  const last = new Date(lastFetchedAtIso).getTime();
  if (!Number.isFinite(last)) return true;
  const ageMs = Date.now() - last;
  return ageMs > CACHE_TTL_HOURS * 60 * 60 * 1000;
}

export async function getCachedProfile(
  username: string,
): Promise<CachedProfile | null> {
  try {
    const rows = await sql<CachedProfilesRow[]>`
      SELECT *
      FROM cached_profiles
      WHERE username = ${username}
      LIMIT 1
    `;
    const data = rows[0] ?? null;
    if (!data) return null;

    const row = data as unknown as CachedProfilesRow;
    if (isStale(row.last_fetched_at)) return null;

    return {
      id: row.id,
      username: row.username,
      lastFetchedAt: row.last_fetched_at,
      profile: row.profile,
      films: row.films ?? [],
      stats: row.stats,
      recommendations: row.recommendations ?? [],
      directorPhotos: row.director_photos ?? {},
    };
  } catch (err) {
    console.log("[cache] getCachedProfile exception", {
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function upsertCachedProfile(data: CachedProfile): Promise<void> {
  try {
    const payload = {
      id: data.id,
      username: data.username,
      last_fetched_at: new Date().toISOString(),
      profile: data.profile,
      films: data.films ?? [],
      stats: data.stats,
      recommendations: data.recommendations ?? [],
      director_photos: data.directorPhotos ?? {},
    };

    await sql`
      INSERT INTO cached_profiles (
        id,
        username,
        last_fetched_at,
        profile,
        films,
        stats,
        recommendations,
        director_photos
      ) VALUES (
        ${payload.id},
        ${payload.username},
        ${payload.last_fetched_at},
        ${sql.json(payload.profile)},
        ${sql.json(payload.films)},
        ${sql.json(payload.stats)},
        ${sql.json(payload.recommendations)},
        ${sql.json(payload.director_photos)}
      )
      ON CONFLICT (username) DO UPDATE SET
        id = EXCLUDED.id,
        last_fetched_at = EXCLUDED.last_fetched_at,
        profile = EXCLUDED.profile,
        films = EXCLUDED.films,
        stats = EXCLUDED.stats,
        recommendations = EXCLUDED.recommendations,
        director_photos = EXCLUDED.director_photos
    `;
  } catch (err) {
    console.log("[cache] upsertCachedProfile exception", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function getTotalProfilesCount(): Promise<number> {
  try {
    const rows = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM cached_profiles
    `;
    return rows[0]?.count ?? 0;
  } catch (err) {
    console.log("[cache] getTotalProfilesCount exception", {
      message: err instanceof Error ? err.message : String(err),
    });
    return 0;
  }
}

