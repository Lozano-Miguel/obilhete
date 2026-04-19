"use client";

import type { CountryCount } from "@/types";
import type { MouseEvent as ReactMouseEvent } from "react";
import { memo, useCallback, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DEFAULT_FILL = "#1a1a1a";
const STROKE = "#333333";

/** TMDB / dataset country names → Natural Earth-style names (partial map). */
const COUNTRY_ALIASES: Record<string, string> = {
  "united states of america": "United States",
  usa: "United States",
  uk: "United Kingdom",
  "great britain": "United Kingdom",
  "russian federation": "Russia",
  "south korea": "South Korea",
  "korea, republic of": "South Korea",
  "czech republic": "Czechia",
  "türkiye": "Turkey",
  turkey: "Turkey",
};

function normalizeKey(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolveAlias(name: string): string {
  const n = normalizeKey(name);
  return COUNTRY_ALIASES[n] ?? name;
}

function geoDisplayName(props: Record<string, unknown>): string {
  const raw =
    props.name ??
    props.NAME ??
    props.ADMIN ??
    props.admin ??
    props.formal_en ??
    "";
  return String(raw).trim() || "—";
}

function geoIso(props: Record<string, unknown>): string {
  const raw =
    props.iso_a2 ??
    props.ISO_A2 ??
    props.iso_a2_eh ??
    props["ISO_A2_EH"] ??
    "";
  const s = String(raw).trim().toUpperCase();
  if (s.length === 2 && s !== "-99") return s;
  return "";
}

type Lookup = {
  byIso: Map<string, number>;
  byName: Map<string, number>;
  max: number;
};

function buildLookup(data: CountryCount[]): Lookup {
  const byIso = new Map<string, number>();
  const byName = new Map<string, number>();

  for (const row of data) {
    const key = row.countryCode.trim();
    if (!key) continue;
    const isIso = /^[a-z]{2}$/i.test(key);
    if (isIso) {
      byIso.set(key.toUpperCase(), row.value);
    } else {
      const resolved = resolveAlias(key);
      byName.set(normalizeKey(key), row.value);
      byName.set(normalizeKey(resolved), row.value);
    }
  }

  let max = 0;
  for (const v of byIso.values()) max = Math.max(max, v);
  for (const v of byName.values()) max = Math.max(max, v);

  return { byIso, byName, max };
}

function countForGeography(props: Record<string, unknown>, lookup: Lookup): number {
  const iso = geoIso(props);
  if (iso && lookup.byIso.has(iso)) return lookup.byIso.get(iso)!;

  const display = geoDisplayName(props);
  const n = normalizeKey(display);
  if (lookup.byName.has(n)) return lookup.byName.get(n)!;

  const resolved = normalizeKey(resolveAlias(display));
  if (lookup.byName.has(resolved)) return lookup.byName.get(resolved)!;

  return 0;
}

function goldOpacity(count: number, max: number): string {
  if (count <= 0 || max <= 0) return "0";
  const t = count / max;
  const a = 0.2 + t * 0.8;
  return Math.min(1, Math.max(0.2, a)).toFixed(3);
}

type TooltipState = {
  x: number;
  y: number;
  name: string;
  count: number;
} | null;

export const CountryMap = memo(function CountryMap({
  data,
}: {
  data: CountryCount[];
}) {
  const lookup = useMemo(() => buildLookup(data), [data]);
  const [tip, setTip] = useState<TooltipState>(null);

  const hideTip = useCallback(() => setTip(null), []);

  return (
    <div className="relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] p-4">
      <h2 className="mb-4 text-base font-semibold tracking-tight text-[#ffffff]">
        De onde vêm os teus filmes
      </h2>
      <div className="h-72 w-full bg-[#0d0d0d] md:min-h-[500px] md:h-[500px]">
        <ComposableMap
          projectionConfig={{ scale: 180 }}
          className="h-full w-full [&_svg]:block"
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: Array<{ rsmKey: string; properties: Record<string, unknown> }> }) =>
              geographies.map((geo) => {
                const props = geo.properties ?? {};
                const count = countForGeography(props, lookup);
                const label = geoDisplayName(props);
                const fill =
                  count > 0
                    ? `rgba(232, 197, 71, ${goldOpacity(count, lookup.max)})`
                    : DEFAULT_FILL;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={STROKE}
                    strokeWidth={0.35}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        stroke: STROKE,
                        strokeWidth: 0.45,
                        filter: count > 0 ? "brightness(1.08)" : undefined,
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(e: ReactMouseEvent<SVGPathElement>) => {
                      setTip({
                        x: e.clientX,
                        y: e.clientY,
                        name: label,
                        count,
                      });
                    }}
                    onMouseMove={(e: ReactMouseEvent<SVGPathElement>) => {
                      setTip({
                        x: e.clientX,
                        y: e.clientY,
                        name: label,
                        count,
                      });
                    }}
                    onMouseLeave={hideTip}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {tip ? (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#111111] px-3 py-2 text-left shadow-lg"
          style={{
            left: tip.x + 12,
            top: tip.y + 12,
          }}
        >
          <p className="m-0 text-[13px] text-[#ffffff]">
            {tip.name} · {tip.count} {tip.count === 1 ? "filme" : "filmes"}
          </p>
        </div>
      ) : null}
    </div>
  );
});
