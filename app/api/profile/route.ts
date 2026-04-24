import { NextResponse } from "next/server";
import {
  mergeRatings,
  scrapeFilms,
  scrapeProfile,
  scrapeRatings,
} from "@/lib/letterboxd";
import { enrichFilms, getDirectorPhoto } from "@/lib/tmdb";
import { buildProfileStats } from "@/utils/transform";
import {
  enrichRecommendationsWithPosters,
  getRecommendationsAndTag,
} from "@/lib/gemini";
import { getCachedProfile, upsertCachedProfile } from "@/lib/cache";
import type { CachedProfile, ProfileStats } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim();
  if (!username) {
    return NextResponse.json(
      { error: "Missing username" },
      { status: 400 },
    );
  }

  let profile: Awaited<ReturnType<typeof scrapeProfile>> | null = null;
  try {
    profile = await scrapeProfile(username);
  } catch {
    // ignore: letterboxd might rate-limit or block
  }

  return NextResponse.json({
    username,
    profile,
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawUsername = (body as any)?.username;
  if (typeof rawUsername !== "string" || !rawUsername.trim()) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }
  const username = rawUsername.toLowerCase().trim();

  const cached = await getCachedProfile(username);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true }, { status: 200 });
  }

  try {
    console.log(`[profile] building profile for @${username}`);

    const profile = await scrapeProfile(username);

    console.log(`[profile] scraping films for @${username}`);
    const films = await scrapeFilms(username);
    console.log("[pipeline] scraped films count:", films.length);

    console.log(`[profile] scraping rss ratings for @${username}`);
    const ratings = await scrapeRatings(username);
    const mergedFilms = mergeRatings(films, ratings);
    console.log("[pipeline] after merge ratings count:", mergedFilms.length);

    console.log(`[profile] enriching with tmdb for @${username}`);
    const enrichedFilms = await enrichFilms(mergedFilms);
    console.log("[pipeline] after enrichment count:", enrichedFilms.length);
    console.log(
      "[pipeline] first enriched film sample:",
      JSON.stringify(enrichedFilms[0]),
    );

    console.log(`[profile] building stats for @${username}`);
    const statsBase = buildProfileStats(enrichedFilms);
    const stats = { ...statsBase };
    console.log("[pipeline] stats totalFilms:", stats.totalFilms);

    console.log(`[profile] getting recommendations/tag for @${username}`);
    const { recommendations: rawRecommendations, personalityTag } =
      await getRecommendationsAndTag(statsBase, enrichedFilms);
    console.log("[pipeline] gemini done, enriching posters...");
    const fullStats: ProfileStats = {
      ...stats,
      personalityTag,
    };
    try {
      const recommendations = await enrichRecommendationsWithPosters(rawRecommendations);
      console.log("[pipeline] posters done, fetching director photos...");

      const directorPhotos: Record<string, string | null> = {};
      const topFiveDirectors = fullStats.topDirectors.slice(0, 5);
      for (let i = 0; i < topFiveDirectors.length; i++) {
        const director = topFiveDirectors[i];
        directorPhotos[director] = await getDirectorPhoto(director);
        if (i < topFiveDirectors.length - 1) await sleep(200);
      }
      console.log("[pipeline] director photos done, upserting...");

      const data: CachedProfile = {
        username,
        lastFetchedAt: new Date().toISOString(),
        profile,
        films: enrichedFilms,
        stats: fullStats,
        recommendations,
        directorPhotos,
      };

      const shouldUpsert =
        enrichedFilms.length > 0 &&
        fullStats.totalFilms > 0 &&
        recommendations.length > 0;

      if (shouldUpsert) {
        await upsertCachedProfile(data);
        console.log("[pipeline] upsert done, returning response...");
      } else {
        console.log("[cache] skipping upsert — incomplete data");
        console.log("[pipeline] upsert done, returning response...");
      }

      return NextResponse.json({ ...data, cached: false }, { status: 200 });
    } catch (err) {
      console.error("[pipeline] post-gemini crash:", err);
      return NextResponse.json(
        {
          profile,
          stats: fullStats,
          recommendations: rawRecommendations,
          directorPhotos: {},
          cached: false,
        },
        { status: 200 },
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "Profile not found") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    console.log("[profile] pipeline failed", { message });
    return NextResponse.json(
      { error: "Failed to build profile" },
      { status: 500 },
    );
  }
}

