import { getFilmDetails, searchFilm } from "@/lib/tmdb";
import type { FilmEntry, ProfileStats, Recommendation } from "@/types";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function safeJsonParse(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    // Try to salvage first JSON object in the text
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function topEntries(
  rec: Record<string, number>,
  n: number,
): Array<{ key: string; value: number }> {
  return Object.entries(rec)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, value]) => ({ key, value }));
}

function pickRandom<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return [...arr];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export async function getRecommendationsAndTag(
  stats: Omit<ProfileStats, "personalityTag">,
  films: FilmEntry[],
): Promise<{ recommendations: Recommendation[]; personalityTag: string }> {
  const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
  const fallback = {
    personalityTag: "Cinephile em descoberta",
    recommendations: [] as Recommendation[],
  };

  try {
    const topGenres = topEntries(stats.genreBreakdown, 5);
    const favouriteDecade = topEntries(stats.decadeBreakdown, 1)[0]?.key ?? "";

    const generous =
      stats.avgRating > 3.5 ? "generoso" : stats.avgRating < 3.0 ? "exigente" : "equilibrado";

    const ratio =
      stats.totalFilms > 0 ? stats.ratedFilms / stats.totalFilms : 0;

    const ratingHabit =
      ratio > 0.85
        ? "avalia quase tudo"
        : ratio < 0.35
          ? "avalia raramente"
          : "avalia com alguma frequência";

    const mostWatchedGenre = topGenres[0]?.key;
    const genreExamplesPool = mostWatchedGenre
      ? films.filter((f) => (f.genres ?? []).includes(mostWatchedGenre))
      : [];
    const examples = pickRandom(
      (genreExamplesPool.length ? genreExamplesPool : films).map((f) => f.title),
      5,
    );
    const watchedTitles = films.map((f) => f.title).join(", ");

    const prompt = [
      "You are an expert recommender for film + book taste.",
      "",
      "User profile signals:",
      `- totalFilms: ${stats.totalFilms}`,
      `- ratedFilms: ${stats.ratedFilms} (${Math.round(ratio * 100)}%); habit: ${ratingHabit}`,
      `- avgRating: ${stats.avgRating} (${generous})`,
      `- topGenres: ${topGenres.map((g) => `${g.key}:${g.value}`).join(", ")}`,
      `- favouriteDecade: ${favouriteDecade}`,
      `- topDirectors: ${stats.topDirectors.join(", ") || "none"}`,
      "",
      "IMPORTANT: The user has already watched these films — do NOT recommend any of them:",
      watchedTitles,
      "Only recommend films and books the user has NOT seen.",
      "For books this restriction does not apply — recommend any relevant books.",
      "CRITICAL: You MUST check every single movie recommendation against this watched list before including it. If the title appears anywhere in the list below, DO NOT recommend it. Check carefully including alternate titles.",
      "IMPORTANT: Always use the original English title for movies (e.g. 'Parasite' not 'Parasita', 'Arrival' not 'A Chegada'). This is required for poster lookup.",
      "",
      "---",
      "",
      "You MUST respond with ONLY a valid JSON object. No markdown, no backticks,",
      "no explanation, no text before or after the JSON.",
      "",
      "The JSON must have EXACTLY this structure:",
      "{",
      '  "personalityTag": "4-6 word evocative description in Portuguese",',
      '  "recommendations": [',
      "    {",
      '      "title": "Film Title",',
      '      "year": 1999,',
      '      "type": "movie",',
      '      "reason": "2 sentence reason in Portuguese explaining why it fits this specific user",',
      '      "matchScore": 85,',
      '      "posterUrl": null,',
      '      "author": null',
      "    },",
      "    {",
      '      "title": "Book Title",',
      '      "year": 2001,',
      '      "type": "book",',
      '      "reason": "2 sentence reason in Portuguese explaining why it fits this specific user",',
      '      "matchScore": 80,',
      '      "posterUrl": null,',
      '      "author": "Author Name"',
      "    }",
      "  ]",
      "}",
      "",
      "STRICT REQUIREMENTS — follow these exactly or the response will fail:",
      "1. recommendations array MUST contain EXACTLY 10 items total",
      '2. EXACTLY 6 items must have "type": "movie"',
      '3. EXACTLY 4 items must have "type": "book"',
      "4. Every movie must NOT be in the watched list provided above",
      "5. Every item must have all fields present (use null for posterUrl and author on movies)",
      "6. matchScore must be a number between 70 and 99",
      "7. personalityTag must be in Portuguese",
      "8. All reason fields must be in Portuguese",
      "9. Do not wrap the JSON in markdown code blocks",
      "",
      "---",
      "",
      "Example film titles from their most-watched genre (random sample):",
      ...examples.map((t) => `- ${t}`),
    ].join("\n");

    const geminiApiKey = process.env.GEMINI_API_KEY!;
    let result: unknown = null;
    let requestSucceeded = false;

    for (const model of GEMINI_MODELS) {
      let shouldTryNextModel = false;

      for (let attempt = 1; attempt <= 2; attempt++) {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        );

        const attemptResult = await geminiRes.json();
        if (geminiRes.ok) {
          result = attemptResult;
          requestSucceeded = true;
          console.log(`[gemini] success with model: ${model}`);
          break;
        }

        const errorMessage =
          (attemptResult as { error?: { message?: string } })?.error?.message ??
          "Gemini request failed";
        const normalizedErrorMessage = errorMessage.toLowerCase();
        const isOverloaded =
          geminiRes.status === 429 ||
          geminiRes.status === 503 ||
          normalizedErrorMessage.includes("demand") ||
          normalizedErrorMessage.includes("overload") ||
          normalizedErrorMessage.includes("quota");

        if (isOverloaded) {
          if (attempt < 2) {
            await sleep(3000);
            continue;
          }
          console.log(`[gemini] ${model} overloaded, trying next...`);
          shouldTryNextModel = true;
          break;
        }

        throw new Error(errorMessage);
      }

      if (requestSucceeded) break;
      if (shouldTryNextModel) continue;
    }

    if (!requestSucceeded || !result) {
      throw new Error("All Gemini models failed");
    }

    const text =
      (result as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      }).candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    console.log("[gemini] raw text response:", text);

    const parsed = safeJsonParse(text);
    if (!parsed || typeof parsed !== "object") return fallback;

    const obj = parsed as {
      personalityTag?: unknown;
      recommendations?: unknown;
    };

    const personalityTag =
      typeof obj.personalityTag === "string" && obj.personalityTag.trim()
        ? obj.personalityTag.trim()
        : fallback.personalityTag;

    const recsRaw = Array.isArray(obj.recommendations) ? obj.recommendations : [];

    const moviesCount = recsRaw.filter((r) => {
      if (!r || typeof r !== "object") return false;
      return (r as { type?: unknown }).type === "movie";
    }).length;
    const booksCount = recsRaw.filter((r) => {
      if (!r || typeof r !== "object") return false;
      return (r as { type?: unknown }).type === "book";
    }).length;

    if (recsRaw.length !== 10) {
      console.log(
        `[gemini] warning: expected 10 recommendations, got ${recsRaw.length}`,
      );
    }
    if (moviesCount !== 6) {
      console.log(`[gemini] warning: expected 6 movies, got ${moviesCount}`);
    }
    if (booksCount !== 4) {
      console.log(`[gemini] warning: expected 4 books, got ${booksCount}`);
    }
    console.log(`[gemini] parsed: ${moviesCount} movies, ${booksCount} books`);

    const recommendations: Recommendation[] = recsRaw
      .map((r) => r as any)
      .filter((r) => r && typeof r === "object")
      .map((r) => ({
        title: String(r.title ?? "").trim(),
        year: Number(r.year ?? 0),
        type: (r.type === "book" ? "book" : "movie") as "movie" | "book",
        reason: String(r.reason ?? "").trim(),
        matchScore: Number(r.matchScore ?? 0),
        posterUrl: undefined,
        author:
          r.author === null || typeof r.author === "undefined"
            ? undefined
            : String(r.author),
      }))
      .filter((r) => r.title && Number.isFinite(r.year) && r.year > 0 && r.reason);

    const watchedSlugsSet = new Set(
      films.map((f) => f.title.toLowerCase().trim()),
    );
    const filteredRecommendations = recommendations.filter(
      (rec) =>
        rec.type === "book" || !watchedSlugsSet.has(rec.title.toLowerCase().trim()),
    );
    const filteredOutCount = recommendations.length - filteredRecommendations.length;
    console.log(
      `[gemini] filtered out ${filteredOutCount} already-watched recommendations`,
    );

    return { personalityTag, recommendations: filteredRecommendations };
  } catch (err) {
    console.log("[gemini] getRecommendationsAndTag failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function enrichRecommendationsWithPosters(
  recommendations: Recommendation[],
): Promise<Recommendation[]> {
  const out = recommendations.map((rec) => ({ ...rec }));

  const needsPosterIdx = out
    .map((r, i) =>
      r.type === "movie" && (r.posterUrl == null || r.posterUrl === "") ? i : -1,
    )
    .filter((i) => i >= 0);

  for (let k = 0; k < needsPosterIdx.length; k++) {
    const i = needsPosterIdx[k];
    const rec = out[i];
    const tmdbId = await searchFilm(rec.title, rec.year);
    let posterUrl = rec.posterUrl;
    if (tmdbId) {
      const details = await getFilmDetails(tmdbId);
      if (details.posterUrl) posterUrl = details.posterUrl;
    }
    out[i] = { ...rec, posterUrl };
    if (k < needsPosterIdx.length - 1) await sleep(200);
  }

  const needsBookCoverIdx = out
    .map((r, i) =>
      r.type === "book" && (r.posterUrl == null || r.posterUrl === "") ? i : -1,
    )
    .filter((i) => i >= 0);

  for (let k = 0; k < needsBookCoverIdx.length; k++) {
    const i = needsBookCoverIdx[k];
    const rec = out[i];
    const title = rec.title.trim();
    const author = rec.author?.trim() ?? "";
    let posterUrl = rec.posterUrl;

    try {
      const params = new URLSearchParams({
        title,
        author,
        limit: "1",
      });
      const response = await fetch(
        `https://openlibrary.org/search.json?${params.toString()}`,
      );

      if (response.ok) {
        const payload = (await response.json()) as {
          docs?: Array<{ cover_i?: number }>;
        };
        const coverId = payload.docs?.[0]?.cover_i;
        if (typeof coverId === "number" && Number.isFinite(coverId)) {
          posterUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
        }
      }
    } catch {
      // Keep posterUrl as-is (null/undefined) when Open Library fetch fails.
    }

    out[i] = { ...rec, posterUrl };
    if (k < needsBookCoverIdx.length - 1) await sleep(200);
  }

  return out;
}

