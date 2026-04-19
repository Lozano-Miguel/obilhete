import { supabase } from "./supabase";
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
    const { data, error } = await supabase
      .from("cached_profiles")
      .select("*")
      .eq("username", username)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.log("[cache] getCachedProfile error", error.message);
      return null;
    }
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

    const { error } = await supabase
      .from("cached_profiles")
      .upsert(payload, { onConflict: "username", ignoreDuplicates: false });

    if (error) {
      console.log("[cache] upsertCachedProfile error", error.message);
    }
  } catch (err) {
    console.log("[cache] upsertCachedProfile exception", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function getTotalProfilesCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("cached_profiles")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log("[cache] getTotalProfilesCount error", error.message);
      return 0;
    }
    return typeof count === "number" ? count : 0;
  } catch (err) {
    console.log("[cache] getTotalProfilesCount exception", {
      message: err instanceof Error ? err.message : String(err),
    });
    return 0;
  }
}

