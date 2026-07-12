import sql from "@/lib/db";
import type { CachedProfile } from "@/types";

const CACHE_TTL_HOURS = 24;

type CachedProfilesRow = {
  id: string;
  username: string;
  last_fetched_at: string;
  profile: CachedProfile["profile"] | string | null;
  films?: CachedProfile["films"] | string | null;
  stats: CachedProfile["stats"] | string | null;
  recommendations?: CachedProfile["recommendations"] | string | null;
  director_photos?: CachedProfile["directorPhotos"] | string | null;
  created_at: string;
};

function isStale(lastFetchedAtIso: string) {
  const last = new Date(lastFetchedAtIso).getTime();
  if (!Number.isFinite(last)) return true;
  const ageMs = Date.now() - last;
  return ageMs > CACHE_TTL_HOURS * 60 * 60 * 1000;
}

function safeParseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return (value as T) ?? fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
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
    const profile = safeParseJson<CachedProfile["profile"] | null>(
      row.profile,
      null,
    );
    const stats = safeParseJson<CachedProfile["stats"] | null>(row.stats, null);
    if (!profile || !stats) return null;

    return {
      id: row.id,
      username: row.username,
      lastFetchedAt: row.last_fetched_at,
      profile,
      films: safeParseJson(row.films, []),
      stats,
      recommendations: safeParseJson(row.recommendations, []),
      directorPhotos: safeParseJson(row.director_photos, {}),
    };
  } catch (err) {
    console.error("[cache] getCachedProfile failed", err);
    return null;
  }
}

export async function upsertCachedProfile(data: CachedProfile): Promise<void> {
  try {
    const profileId = data.id ?? null;
    const payload = {
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
        COALESCE(${profileId}::uuid, gen_random_uuid()),
        ${payload.username},
        ${payload.last_fetched_at},
        ${JSON.stringify(payload.profile)}::jsonb,
        ${JSON.stringify(payload.films)}::jsonb,
        ${JSON.stringify(payload.stats)}::jsonb,
        ${JSON.stringify(payload.recommendations)}::jsonb,
        ${JSON.stringify(payload.director_photos)}::jsonb
      )
      ON CONFLICT (username) DO UPDATE SET
        last_fetched_at = EXCLUDED.last_fetched_at,
        profile = EXCLUDED.profile,
        films = EXCLUDED.films,
        stats = EXCLUDED.stats,
        recommendations = EXCLUDED.recommendations,
        director_photos = EXCLUDED.director_photos
    `;
  } catch (err) {
    // Surface the failure instead of silently no-oping, so a DB outage is
    // visible rather than looking like a permanent cache miss.
    console.error("[cache] upsertCachedProfile failed", err);
    throw err;
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
    console.error("[cache] getTotalProfilesCount failed", err);
    return 0;
  }
}

