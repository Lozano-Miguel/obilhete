"use client";

import type { FilmEntry, ProfileStats } from "@/types";

function directorMatches(filmDirector: string | undefined, target: string): boolean {
  const a = filmDirector?.trim().toLowerCase() ?? "";
  const b = target.trim().toLowerCase();
  return Boolean(a && b && a === b);
}

export function TopDirectors({
  stats,
  films,
  directorPhotos = {},
}: {
  stats: ProfileStats;
  films: FilmEntry[];
  directorPhotos?: Record<string, string | null>;
}) {
  function getInitials(name: string): string {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111111] p-4">
      <div className="mb-3 text-sm font-medium text-[#ffffff]">Realizadores</div>
      <ol className="space-y-4">
        {stats.topDirectors.map((name, index) => {
          const rank = String(index + 1).padStart(2, "0");
          const watched = films.filter((f) => directorMatches(f.director, name));
          const filmsCount = watched.length;
          const filmsLine = `${filmsCount} filme${filmsCount === 1 ? "" : "s"} vistos`;
          const photoUrl = directorPhotos[name];
          const initials = getInitials(name);

          return (
            <li key={name} className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#e8c547]/45 ring-1 ring-[#e8c547]/20">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a] text-xs font-semibold text-[#e8c547]">
                    {initials || "?"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[#ffffff]">
                  <span className="mr-2 tabular-nums text-[#e8c547]/65">{rank}</span>
                  {name}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#888888]">{filmsLine}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
