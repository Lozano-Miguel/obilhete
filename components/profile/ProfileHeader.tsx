"use client";

import type { CachedProfile } from "@/types";
import Link from "next/link";

function normalizeAvatarUrl(url: string) {
  const u = url.trim();
  if (!u) return "";
  if (u.startsWith("//")) return `https:${u}`;
  return u;
}

export function ProfileHeader({ data }: { data: CachedProfile }) {
  const { profile, stats } = data;
  const avatarSrc = normalizeAvatarUrl(profile.avatarUrl);

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111111] p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-[rgba(255,255,255,0.08)] bg-[#0a0a0a]">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-[#888888]">
                —
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-[#ffffff] md:text-3xl">
              {profile.displayName}
            </h1>
            <p className="mt-1 text-sm text-[#888888]">@{profile.username}</p>
            <p className="mt-3 text-sm text-[#ffffff]">
              <span className="text-[#888888]">Filmes vistos:</span>{" "}
              <span className="font-medium tabular-nums">{profile.totalFilms}</span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[#e8c547]/35 bg-[#e8c547]/10 px-3 py-1 text-xs font-medium text-[#e8c547]">
                {stats.personalityTag}
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="shrink-0 text-sm text-[#888888] underline-offset-4 transition-colors hover:text-[#ffffff] hover:underline"
        >
          ← Início
        </Link>
      </div>
    </div>
  );
}
