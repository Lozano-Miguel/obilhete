# O Bilhete

A web app that turns a **Letterboxd** profile into visual statistics, an AI-assigned
personality tag, and tailored movie & book recommendations. Enter a username and get a
breakdown of genres, decades, countries and ratings, a one-line "vibe" tag, and
6 movie + 4 book suggestions that exclude films you've already logged.

## Stack

- **Framework:** Next.js 15.5 (App Router) + TypeScript
- **Styling / animation:** Tailwind CSS, Framer Motion
- **Data viz:** Recharts (charts) + react-simple-maps (country map)
- **Database / cache:** PostgreSQL via [`postgres`](https://github.com/porsager/postgres) (postgres.js)
- **AI:** Groq (`groq-sdk`) — recommendations + personality tag
- **Film metadata:** TMDB API (native `fetch`)
- **Scraping:** a **separate, private** Python (FastAPI) service — see below
- **Deployment:** self-hosted behind a reverse proxy (see [docs/DEPLOY.md](./docs/DEPLOY.md))

> There is no ScraperAPI, no Supabase, no axios/cheerio and no Vercel `@vercel/og` here —
> earlier iterations used those; this README reflects the current code.

## Architecture

```
Browser ──POST /api/profile──▶ Next.js API route
                                   │
        ┌──────────────────────────┼───────────────────────────┐
        ▼                          ▼                           ▼
  Postgres cache          Python scraper service          TMDB + Groq
  (cached_profiles)       (private, localhost only)        (external APIs)
```

The Next.js app is the only public surface. The **scraper is a separate private
service** (it contains Cloudflare-evasion logic) that must never be exposed publicly —
the app reaches it over localhost / an internal Docker network via `SCRAPER_SERVICE_URL`.
Its source lives in a separate private repo (`../scraper` in local dev).

## Data pipeline

`POST /api/profile` runs synchronously (the project handles a low request volume, so a
job queue isn't warranted):

1. **Cache check** — look up `cached_profiles` in Postgres; serve instantly if the entry
   is within the 24h TTL.
2. **Scrape** — call the scraper for profile details, the paginated films list, and RSS
   ratings; merge ratings into the films.
3. **Enrich** — hit TMDB per film for genres, country, language, director, cast and
   poster URL.
4. **Compute stats** — aggregate genres, decades, countries, languages, rating
   distribution and top directors/actors.
5. **AI** — send the stats + films to Groq for a personality tag and recommendations,
   filtering out already-watched titles.
6. **Cache upsert** — save the full profile to Postgres and return it.

Groq output is forced to Portuguese and strict JSON, with a model fallback chain:
`llama-3.3-70b-versatile` → `meta-llama/llama-4-scout-17b-16e-instruct` →
`llama-3.1-8b-instant`.

## API routes

- `POST /api/profile` — `{ username }` → runs the full pipeline, returns the cached
  profile. Usernames are validated (`^[a-z0-9_]{2,15}$`) before any work.
- `POST /api/recommendations` — `{ username }` → refreshes only the Groq recommendations
  from already-cached film data.
- `GET /api/og/[username]` — dynamic Open Graph card (1200×630) via `next/og`.

## Local setup

Requires Node 18+, a reachable Postgres, and the scraper service running locally.

1. Copy the env template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Purpose |
   |---|---|
   | `NEXT_PUBLIC_BASE_URL` | Public base URL (OG/metadata links) |
   | `DATABASE_URL` | Postgres connection string |
   | `TMDB_API_KEY` | TMDB v4 read access token (bearer) |
   | `GROQ_API_KEY` | Groq API key |
   | `SCRAPER_SERVICE_URL` | Scraper URL (default `http://localhost:8001`) |

2. Create the database table (see [`schema.sql`](./schema.sql)):

   ```bash
   psql "$DATABASE_URL" -f schema.sql
   ```

3. Start the private scraper service (separate repo) bound to localhost — see its own
   README. The app expects it at `SCRAPER_SERVICE_URL`.

4. Run the app:

   ```bash
   npm install
   npm run dev
   ```

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm start       # serve the production build
npm test        # vitest unit tests
npm run lint    # eslint
```

## Design system

- **Theme:** dark, cinematic, editorial.
- **Colors:** background `#0a0a0a`, cards `#111111`, borders `rgba(255,255,255,0.08)`,
  accent `#e8c547`.
- **Typography:** Geist Sans.
