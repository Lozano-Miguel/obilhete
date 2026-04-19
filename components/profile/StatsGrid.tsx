"use client";

import type { ProfileStats } from "@/types";

function topKey(record: Record<string, number>): string {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

export function StatsGrid({ stats }: { stats: ProfileStats }) {
  const items = [
    {
      label: "Filmes assistidos",
      value: String(stats.totalFilms),
    },
    {
      label: "País favorito",
      value: topKey(stats.countryBreakdown),
    },
    {
      label: "Década favorita",
      value: topKey(stats.decadeBreakdown),
    },
    {
      label: "Idioma favorito",
      value: topKey(stats.languageBreakdown),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((x) => (
        <div
          key={x.label}
          className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111111] p-5"
        >
          <div className="text-2xl font-semibold tabular-nums leading-tight text-[#e8c547] md:text-3xl">
            {x.value}
          </div>
          <div className="mt-2 text-xs font-medium uppercase tracking-wide text-[#888888]">
            {x.label}
          </div>
        </div>
      ))}
    </div>
  );
}
