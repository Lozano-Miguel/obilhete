"use client";

import { motion, type Variants } from "framer-motion";
import type { Recommendation } from "@/types";

const MotionA = motion("a");

const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w185";

export const recommendationCardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

function resolvePosterUrl(url?: string | null): string | null {
  if (!url) return null;
  const u = url.trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${TMDB_POSTER_BASE}${path}`;
}

function matchPercent(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score > 0 && score <= 1) return Math.round(score * 100);
  return Math.round(Math.min(100, Math.max(0, score)));
}

function letterboxdFilmSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9 10h6M9 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

type MovieCardProps = {
  item: Recommendation;
  variants?: Variants;
};

export function MovieCard({ item, variants = recommendationCardVariants }: MovieCardProps) {
  const poster = resolvePosterUrl(item.posterUrl);
  const pct = matchPercent(item.matchScore);
  const lbHref = `https://letterboxd.com/film/${letterboxdFilmSlug(item.title)}/`;

  return (
    <MotionA
      href={lbHref}
      target="_blank"
      rel="noopener noreferrer"
      variants={variants}
      className="block rounded-2xl outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[#e8c547]/50"
    >
      <div className="flex gap-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111111] p-4">
      <div className="relative h-28 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-[#0a0a0a]">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#888888]">
            <FilmIcon className="h-10 w-10 opacity-60" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="text-base font-bold leading-snug text-[#ffffff]">{item.title}</h3>
          <span className="text-sm text-[#888888]">({item.year})</span>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-[#888888]">
            <span>% match</span>
            <span className="tabular-nums text-[#e8c547]">{pct}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
            <div
              className="h-full rounded-full bg-[#e8c547]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[#888888]">{item.reason}</p>
      </div>
      </div>
    </MotionA>
  );
}
