/** @type {import('next').NextConfig} */
// Note: Route Handlers can export `maxDuration` (we do this in `app/api/profile/route.ts`).
const nextConfig = {
  // Emit a self-contained server bundle (.next/standalone) for the Docker image.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "a.ltrbxd.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
    ],
  },
};

module.exports = nextConfig;

