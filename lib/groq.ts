import { getFilmDetails, searchFilm } from '@/lib/tmdb'
import Groq from 'groq-sdk'
import { FilmEntry, ProfileStats, Recommendation } from '@/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama-3.1-8b-instant',
]

// Normalize a title for watched-list matching: strip a leading article as a
// whole word (before squashing), then remove all non-alphanumerics. Stripping
// the article after squashing would eat real letters ("Avatar" -> "vatar").
export function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/[^a-z0-9]/g, '')
}

export async function getRecommendationsAndTag(
  stats: Omit<ProfileStats, 'personalityTag'>,
  films: FilmEntry[]
): Promise<{ recommendations: Recommendation[]; personalityTag: string }> {

  const topGenres = Object.entries(stats.genreBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([g, c]) => `${g}: ${c}`)
    .join(', ')

  const favDecade = Object.entries(stats.decadeBreakdown)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown'

  const watchedTitles = films.map(f => f.title).join(', ')

  const prompt = `You are a film and literature expert. Analyze this user's taste profile and provide personalized recommendations.

USER PROFILE:
- Total films watched: ${stats.totalFilms}
- Top genres: ${topGenres}
- Favourite decade: ${favDecade}
- Top directors: ${stats.topDirectors.join(', ')}
- Top actors: ${stats.topActors.join(', ')}

ALREADY WATCHED (DO NOT recommend any of these):
${watchedTitles}

CRITICAL RULES:
1. Respond ONLY with valid JSON, no markdown, no backticks, no explanation
2. recommendations array MUST have EXACTLY 10 items: 6 movies + 4 books
3. Every movie MUST NOT appear in the watched list above
4. Use ORIGINAL ENGLISH titles for movies
5. All "reason" and "personalityTag" fields MUST be in Portuguese (PT-PT)
6. matchScore must be between 70-99

Return exactly this JSON structure:
{
  "personalityTag": "4-6 word evocative description in Portuguese",
  "recommendations": [
    {
      "title": "string",
      "year": 1999,
      "type": "movie",
      "reason": "2 sentences in Portuguese explaining why it fits this user",
      "matchScore": 85,
      "posterUrl": null,
      "author": null
    },
    {
      "title": "string", 
      "year": 2001,
      "type": "book",
      "reason": "2 sentences in Portuguese",
      "matchScore": 80,
      "posterUrl": null,
      "author": "Author Name"
    }
  ]
}`

  let lastError = ''

  for (const model of GROQ_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[groq] trying model: ${model} attempt ${attempt}`)
        
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: model,
          temperature: 0.7,
          max_tokens: 2000,
        })

        const text = completion.choices[0]?.message?.content ?? ''
        console.log('[groq] raw response:', text.slice(0, 200))

        // Strip markdown if present
        const clean = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()

        const parsed = JSON.parse(clean)
        
        // Force null posterUrl
        parsed.recommendations.forEach((r: any) => { r.posterUrl = null })

        // Normalize counts
        const movies = parsed.recommendations
          .filter((r: any) => r.type === 'movie').slice(0, 6)
        const books = parsed.recommendations
          .filter((r: any) => r.type === 'book').slice(0, 4)
        const normalized = [...movies, ...books]

        console.log(`[groq] success: ${movies.length} movies, ${books.length} books`)

        // Filter already watched
        const watchedSet = new Set(films.map(f => normalizeTitle(f.title)))
        const filtered = normalized.filter(r =>
          r.type === 'book' || !watchedSet.has(normalizeTitle(r.title))
        )
        console.log(`[groq] filtered out ${normalized.length - filtered.length} watched`)

        return {
          personalityTag: parsed.personalityTag ?? 'Cinéfilo em descoberta',
          recommendations: filtered,
        }

      } catch (err: any) {
        lastError = err.message ?? 'Unknown error'
        console.log(`[groq] ${model} attempt ${attempt} failed: ${lastError}`)
        
        const isRateLimit = err.status === 429 || 
          lastError.toLowerCase().includes('rate') ||
          lastError.toLowerCase().includes('limit')
        
        if (!isRateLimit) break
        if (attempt < 2) await new Promise(r => setTimeout(r, 3000))
      }
    }
  }

  console.error('[groq] all models failed:', lastError)
  return {
    personalityTag: 'Cinéfilo em descoberta',
    recommendations: [],
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

