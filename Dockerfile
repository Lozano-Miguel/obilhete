# syntax=docker/dockerfile:1

# Multi-stage build for self-hosting the Next.js app behind the homelab reverse proxy.
# Relies on `output: "standalone"` in next.config.js.

# 1. Install dependencies (cached unless the lockfile changes)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build the standalone server bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# lib/db.ts and lib/groq.ts read env at import time (page-data collection touches
# the API routes), so placeholders are needed to build. Passed inline on RUN so
# they stay out of the image's ENV/layers; real values are supplied to the runner
# container at runtime.
RUN DATABASE_URL=postgres://build:build@localhost:5432/build \
    GROQ_API_KEY=build-placeholder \
    TMDB_API_KEY=build-placeholder \
    npm run build

# 3. Minimal runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# The standalone output already contains a pruned node_modules and server.js.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Runtime env (DATABASE_URL, GROQ_API_KEY, TMDB_API_KEY, SCRAPER_SERVICE_URL,
# NEXT_PUBLIC_BASE_URL) must be provided by the container runtime — see .env.example.
CMD ["node", "server.js"]
