# O Bilhete

A web application that analyzes a user's Letterboxd profile to generate visual statistics, an AI-assigned personality tag, and tailored movie and book recommendations.

## Overview
Users input their Letterboxd username to retrieve a comprehensive breakdown of their viewing habits, including genres, release decades, countries of origin, and ratings. The app utilizes Groq AI to analyze these habits and output a personalized "vibe" tag along with 6 cross-referenced movie and 4 book recommendations.

## Tech Stack
- **Framework:** Next.js 14 (App Router), TypeScript
- **Styling & Animation:** Tailwind CSS, Framer Motion
- **Data Visualization:** Recharts, react-simple-maps
- **Database & Cache:** Supabase (PostgreSQL)
- **External APIs:** Groq (AI logic), TMDB API (Film metadata enrichment)
- **Scraping:** Axios, Cheerio, axios-cookiejar-support
- **Deployment:** Vercel

## Data Pipeline
Data fetching follows a strict caching strategy to optimize performance and prevent rate limiting:

1. **Cache Check:** Queries Supabase for an existing profile. Serves instantly if within the 24-hour TTL.
2. **Scrape Data:** Scrapes profile details, paginated watched films list, and extracts user ratings via Letterboxd RSS feed.
3. **Data Enrichment:** Calls the TMDB API to append missing metadata to scraped films (genres, directors, cast, poster URLs).
4. **Compute Statistics:** Generates the aggregated data necessary for frontend charts.
5. **AI Processing:** Submits the enriched user profile to Groq to generate the personality tag and recommendations (filtering out previously watched films).
6. **Cache Upsert:** Saves the complete generated profile to Supabase.
7. **Client Delivery:** Returns the compiled payload to the frontend.

## Architecture Decisions & Known Limitations
- **Letterboxd Scraping:** As Letterboxd lacks a public API, data extraction relies on a warm-up request and cookie jar session to establish state and bypass Cloudflare 403 errors. `ScraperAPI` is implemented as an architectural fallback. 
- **Film Identifiers:** Letterboxd recently removed `data-film-id` from its HTML structure; the application relies on the URL slug as the primary unique identifier for matching.
- **AI Constraints:** All Groq outputs (personality tags and recommendation reasoning) are forced into Portuguese via prompt engineering. The system enforces strict JSON outputs. The active model fallback chain is `llama-3.3-70b-versatile` -> `meta-llama/llama-4-scout-17b-16e-instruct` -> `llama-3.1-8b-instant`.
- **UI Edge Cases:** If a user logs films without rating them, the rating distribution components are conditionally hidden. Books lack reliable poster URLs and utilize a local placeholder asset.

## API Routes
- `POST /api/profile` - Executes the full data pipeline and returns `CachedProfile`.
- `POST /api/recommendations` - Refreshes only the Groq recommendations utilizing previously cached film data.
- `GET /api/og/[username]` - Generates dynamic Open Graph sharing cards using `satori` and `@vercel/og`.

## Design System
- **Theme:** Dark cinematic, editorial interface.
- **Colors:** Background (`#0a0a0a`), Cards (`#111111`), Borders (`rgba(255,255,255,0.08)`), Accent (`#e8c547`).
- **Typography:** Geist Sans.

## Local Setup

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TMDB_API_KEY=your_tmdb_api_key
GROQ_API_KEY=your_groq_api_key
SCRAPER_API_KEY=your_scraper_api_key # Optional fallback
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```
