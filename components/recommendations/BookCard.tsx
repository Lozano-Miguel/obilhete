"use client";

import { motion, type Variants } from "framer-motion";
import type { Recommendation } from "@/types";

import { recommendationCardVariants } from "./MovieCard";

const MotionA = motion("a");

function matchPercent(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score > 0 && score <= 1) return Math.round(score * 100);
  return Math.round(Math.min(100, Math.max(0, score)));
}

type BookCardProps = {
  item: Recommendation;
  variants?: Variants;
};

export function BookCard({ item, variants = recommendationCardVariants }: BookCardProps) {
  const pct = matchPercent(item.matchScore);
  const author =
    item.author && item.author.trim() ? item.author.trim() : null;
  const searchHref = `https://www.google.com/search?q=${encodeURIComponent(
    `${item.title} ${item.author ?? ""} livro`.trim(),
  )}`;

  return (
    <MotionA
      href={searchHref}
      target="_blank"
      rel="noopener noreferrer"
      variants={variants}
      className="block rounded-2xl outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[#e8c547]/50"
    >
      <div className="flex gap-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111111] p-4">
      <div className="relative flex h-28 w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e8c547]/45 bg-[#0a0a0a] px-1.5">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <p className="line-clamp-6 text-center text-[10px] font-medium leading-tight text-[#ffffff]">
            {item.title}
          </p>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold leading-snug text-[#ffffff]">{item.title}</h3>
        {author ? (
          <p className="mt-0.5 text-sm italic text-[#888888]">{author}</p>
        ) : null}
        <p className="mt-1 text-sm text-[#888888]">{item.year}</p>
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
