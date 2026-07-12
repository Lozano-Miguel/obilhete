import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

const SCRAPER_URL = process.env.SCRAPER_SERVICE_URL ?? "http://localhost:8001";

// Lightweight liveness/readiness probe for the reverse proxy and uptime checks.
// The DB ping is authoritative for the status code; the scraper check is
// informational (its unreachability should not fail the whole app's health).
export async function GET() {
  let dbOk = false;
  try {
    await sql`select 1`;
    dbOk = true;
  } catch (error) {
    console.error("[health] DB ping failed:", error);
  }

  let scraperOk = false;
  try {
    const res = await fetch(`${SCRAPER_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    scraperOk = res.ok;
  } catch (error) {
    console.error("[health] scraper check failed:", error);
  }

  return NextResponse.json(
    {
      status: dbOk ? "ok" : "error",
      db: dbOk ? "up" : "down",
      scraper: scraperOk ? "up" : "down",
    },
    { status: dbOk ? 200 : 503 },
  );
}
