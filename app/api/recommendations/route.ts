import { NextResponse } from "next/server";
import { getRecommendationsAndTag } from "@/lib/groq";
import sql from "@/lib/db";
import { isValidLetterboxdUsername } from "@/lib/validation";
import type { FilmEntry, ProfileStats } from "@/types";

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
  if (!isValidLetterboxdUsername(username)) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  let data: { username: string; stats: ProfileStats; films: FilmEntry[] | null } | null =
    null;
  try {
    const rows = await sql<
      { username: string; stats: ProfileStats; films: FilmEntry[] | null }[]
    >`
      SELECT username, stats, films
      FROM cached_profiles
      WHERE username = ${username}
      LIMIT 1
    `;
    data = rows[0] ?? null;
  } catch (error) {
    console.error("[recommendations] read failed", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Profile not cached" }, { status: 404 });
  }

  const stats = (data as any).stats as ProfileStats;
  const films = ((data as any).films ?? []) as FilmEntry[];
  const { recommendations } = await getRecommendationsAndTag(
    // stats already has personalityTag, but the function expects Omit<...>
    // We'll pass it through and let TS accept via cast.
    stats as unknown as Omit<ProfileStats, "personalityTag">,
    films,
  );

  try {
    await sql`
      UPDATE cached_profiles
      SET recommendations = ${JSON.stringify(recommendations)}::jsonb
      WHERE username = ${username}
    `;
  } catch (error) {
    console.error("[recommendations] update failed", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }

  return NextResponse.json({ recommendations }, { status: 200 });
}

