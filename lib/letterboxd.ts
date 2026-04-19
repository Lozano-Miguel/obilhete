import axios from "axios";
import * as cheerio from "cheerio";

import type { FilmEntry, LetterboxdProfile } from "@/types";

function proxied(url: string): string {
  const key = process.env.SCRAPER_API_KEY;
  return `http://api.scraperapi.com?api_key=${key}&url=${encodeURIComponent(url)}&render=false`;
}

const client = axios.create({
  timeout: 30000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function asNumber(text: string) {
  const n = Number(String(text).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseTitleYear(raw: string): { title: string; year: number } {
  const m = raw.match(/^(.*)\s+\((\d{4})\)\s*$/);
  if (!m) return { title: raw.trim(), year: 0 };
  return { title: m[1].trim(), year: Number(m[2]) };
}

function slugifyTitle(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchText(url: string) {
  console.log(`[letterboxd] GET ${url}`);
  const res = await client.get<string>(proxied(url), {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
  });
  return res;
}

export async function scrapeProfile(username: string): Promise<LetterboxdProfile> {
  const url = `https://letterboxd.com/${encodeURIComponent(username)}/`;
  const res = await fetchText(url);
  if (res.status === 404) throw new Error("Profile not found");

  const $ = cheerio.load(res.data);

  // Exact selectors required by spec
  const displayName =
    $("h1.person-display-name .label").first().text().trim() || username;
  const avatarUrl =
    $(".avatar img").first().attr("src")?.trim() || "";
  const totalFilmsText =
    $("h4.profile-statistic .value").first().text().trim();
  const totalFilms = asNumber(totalFilmsText);

  return {
    username,
    displayName,
    avatarUrl,
    totalFilms,
  };
}

export async function scrapeFilms(username: string): Promise<FilmEntry[]> {
  const base = `https://letterboxd.com/${encodeURIComponent(username)}/films/`;

  const firstUrl = `${base}page/1/`;
  const firstRes = await fetchText(firstUrl);
  if (firstRes.status === 404) throw new Error("Profile not found");
  const $first = cheerio.load(firstRes.data);

  const totalPagesText = $first(".paginate-pages li:last-child")
    .first()
    .text()
    .trim();
  const totalPages = Math.max(1, asNumber(totalPagesText));
  console.log(`[letterboxd] total pages = ${totalPages}`);

  const all: FilmEntry[] = [];

  for (let page = 1; page <= totalPages; page++) {
    const url = `${base}page/${page}/`;
    const res = page === 1 ? firstRes : await fetchText(url);
    const $ = page === 1 ? $first : cheerio.load(res.data);

    const nodes = $("ul.grid li.griditem div.react-component");
    console.log(`[letterboxd] page ${page}/${totalPages} films=${nodes.length}`);

    nodes.each((_i, el) => {
      const itemName = $(el).attr("data-item-name")?.trim() || "";
      const slug = $(el).attr("data-item-slug")?.trim() || "";
      const letterboxdId = $(el).attr("data-film-id")?.trim() || "";

      if (!itemName || !slug || !letterboxdId) return;

      const { title, year } = parseTitleYear(itemName);

      all.push({
        title,
        year,
        slug,
        letterboxdId,
        userRating: null,
      });
    });

    // Follow spec: detect pagination next page (debug-only)
    const nextHref = $(".paginate-nextprev a.next").attr("href")?.trim();
    if (nextHref) console.log(`[letterboxd] next href: ${nextHref}`);

    if (page < totalPages) await sleep(800);
  }

  return all;
}

export async function scrapeRatings(username: string): Promise<Map<string, number>> {
  const url = `https://letterboxd.com/${encodeURIComponent(username)}/rss/`;
  const res = await fetchText(url);
  if (res.status === 404) throw new Error("Profile not found");

  const $ = cheerio.load(res.data, { xmlMode: true });

  const map = new Map<string, number>();
  const items = $("item");
  console.log(`[letterboxd] rss items=${items.length}`);

  items.each((_i, item) => {
    const filmTitle = $(item).find("letterboxd\\:filmTitle").first().text().trim();
    const ratingText = $(item)
      .find("letterboxd\\:memberRating")
      .first()
      .text()
      .trim();

    if (!filmTitle) return;
    if (!ratingText) return; // rating may not exist

    const rating = Number(ratingText);
    if (!Number.isFinite(rating)) return;

    const slug = slugifyTitle(filmTitle);
    if (!slug) return;

    map.set(slug, rating);
  });

  console.log(`[letterboxd] rss ratings matched=${map.size}`);
  return map;
}

export function mergeRatings(
  films: FilmEntry[],
  ratings: Map<string, number>,
): FilmEntry[] {
  return films.map((f) => {
    const r = ratings.get(f.slug);
    if (typeof r !== "number") return f;
    return { ...f, userRating: r };
  });
}

