"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RecommendationsSection } from "@/components/recommendations/RecommendationsSection";
import { CountryMap } from "@/components/profile/CountryMap";
import { DecadeChart } from "@/components/profile/DecadeChart";
import { GenreChart } from "@/components/profile/GenreChart";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsGrid } from "@/components/profile/StatsGrid";
import { TopDirectors } from "@/components/profile/TopDirectors";
import type { CachedProfile } from "@/types";
import { toCountryCounts, toDecadeStats, toGenreStats } from "@/utils/transform";

const LOADING_MESSAGES = [
  "A analisar o teu perfil...",
  "A procurar os teus filmes...",
  "A calcular o teu gosto...",
  "A preparar as recomendações...",
] as const;

type LoadState =
  | { status: "loading" }
  | { status: "error"; kind: "notfound" | "other"; message?: string }
  | { status: "ready"; data: CachedProfile };

function isProfileResponse(x: unknown): x is CachedProfile & { cached: boolean } {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.cached !== "boolean") return false;
  if (typeof o.username !== "string") return false;
  if (!o.profile || typeof o.profile !== "object") return false;
  if (!o.stats || typeof o.stats !== "object") return false;
  if (!Array.isArray(o.recommendations)) return false;
  return true;
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function ProfileReadyView({ data }: { data: CachedProfile }) {
  const { stats, recommendations } = data;
  const [copied, setCopied] = useState(false);

  const genreData = useMemo(
    () =>
      toGenreStats(stats.genreBreakdown)
        .sort((a, b) => b.value - a.value)
        .slice(0, 14),
    [stats.genreBreakdown],
  );

  const decadeData = useMemo(() => {
    const rows = toDecadeStats(stats.decadeBreakdown);
    return rows.sort((a, b) => a.decade.localeCompare(b.decade));
  }, [stats.decadeBreakdown]);

  const countryData = useMemo(
    () => toCountryCounts(stats.countryBreakdown),
    [stats.countryBreakdown],
  );

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 md:px-10">
      <AnimatePresence>
        {copied ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#e8c547]/35 bg-[#111111] px-4 py-2 text-sm font-medium text-[#e8c547] shadow-lg"
          >
            Link copiado!
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.div
        className="mx-auto flex max-w-6xl flex-col gap-10"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={sectionVariants}>
          <ProfileHeader data={data} onShare={handleShare} />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <StatsGrid stats={stats} />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <GenreChart data={genreData} />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <DecadeChart data={decadeData} />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <CountryMap data={countryData} />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <TopDirectors
            stats={stats}
            films={data.films ?? []}
            directorPhotos={data.directorPhotos}
          />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <RecommendationsSection
            username={data.username}
            recommendations={recommendations}
          />
        </motion.div>
      </motion.div>
    </main>
  );
}

export function ProfilePageClient({ username }: { username: string }) {
  const normalized = username.trim().replace(/^@+/, "").toLowerCase();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (state.status !== "loading") return;
    const id = window.setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    if (state.status !== "loading") return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(90, (elapsed / 30_000) * 90);
      setProgress(pct);
      if (pct < 90) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.status]);

  useEffect(() => {
    if (!normalized) {
      setState({
        status: "error",
        kind: "other",
        message: "Username em falta.",
      });
      return;
    }

    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: normalized }),
          signal: ac.signal,
        });
        const json: unknown = await res.json().catch(() => null);
        if (ac.signal.aborted) return;

        if (res.status === 404) {
          setState({ status: "error", kind: "notfound" });
          return;
        }

        if (!res.ok) {
          const msg =
            json && typeof json === "object" && "error" in json
              ? String((json as { error?: unknown }).error ?? "")
              : "";
          setState({
            status: "error",
            kind: "other",
            message: msg || "Não foi possível carregar o perfil.",
          });
          return;
        }

        if (!isProfileResponse(json)) {
          setState({
            status: "error",
            kind: "other",
            message: "Resposta inválida do servidor.",
          });
          return;
        }

        const { cached, ...rest } = json;
        void cached;
        setState({ status: "ready", data: rest });
      } catch (e) {
        if (ac.signal.aborted) return;
        if (e instanceof DOMException && e.name === "AbortError") return;
        setState({
          status: "error",
          kind: "other",
          message: e instanceof Error ? e.message : "Falha de rede.",
        });
      }
    })();

    return () => ac.abort();
  }, [normalized]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0a] px-6">
        <div className="w-full max-w-md text-center">
          <div className="relative min-h-[4.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={LOADING_MESSAGES[msgIndex]}
                className="text-lg text-[#ffffff] md:text-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                {LOADING_MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mx-auto mt-8 h-1 w-full max-w-xs overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
            <div
              className="h-full rounded-full bg-[#e8c547] transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-6 text-xs leading-relaxed text-[#888888]">
            Este processo pode demorar 1-2 minutos para perfis novos.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    const is404 = state.kind === "notfound";
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0a] px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-[#ffffff]">
            {is404 ? "Perfil não encontrado" : "Algo correu mal"}
          </h1>
          <p className="mt-3 text-sm text-[#888888]">
            {is404
              ? "Verifica se o username está correto."
              : state.message || "Tenta novamente dentro de momentos."}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[#111111] px-6 py-3 text-sm font-medium text-[#ffffff] transition-colors hover:border-[#e8c547]/40"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return <ProfileReadyView data={state.data} />;
}
