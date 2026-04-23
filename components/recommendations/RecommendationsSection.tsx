"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { BookCard } from "@/components/recommendations/BookCard";
import { MovieCard } from "@/components/recommendations/MovieCard";
import type { Recommendation } from "@/types";

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

function splitRecommendations(recs: Recommendation[]) {
  const movies = recs.filter((r) => r.type === "movie").slice(0, 6);
  const books = recs.filter((r) => r.type === "book").slice(0, 4);
  return { movies, books };
}

type RecommendationsSectionProps = {
  username: string;
  recommendations: Recommendation[];
};

export function RecommendationsSection({
  username,
  recommendations: initial,
}: RecommendationsSectionProps) {
  const [{ movies, books }, setSplit] = useState(() => splitRecommendations(initial));
  const [showAllMovies, setShowAllMovies] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const moviesToShow = showAllMovies ? movies : movies.slice(0, 3);

  const movieKeys = useMemo(
    () => movies.map((m) => `m-${m.title}-${m.year}`).join("|"),
    [movies],
  );
  const bookKeys = useMemo(
    () => books.map((b) => `b-${b.title}-${b.year}`).join("|"),
    [books],
  );

  async function refresh() {
    setError(null);
    setRefreshing(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          json && typeof json === "object" && "error" in json
            ? String((json as { error?: unknown }).error ?? "")
            : "";
        throw new Error(msg || "Não foi possível atualizar.");
      }
      if (!json || typeof json !== "object" || !Array.isArray((json as { recommendations?: unknown }).recommendations)) {
        throw new Error("Resposta inválida.");
      }
      const next = (json as { recommendations: Recommendation[] }).recommendations;
      setSplit(splitRecommendations(next));
      setShowAllMovies(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <section className="flex flex-col gap-14">
      <div>
        <h2 className="inline-block border-b border-[#e8c547] pb-2 text-2xl font-semibold tracking-tight text-[#ffffff]">
          O teu próximo filme
        </h2>
        <motion.div
          key={`${movieKeys}-${showAllMovies ? "all" : "top3"}`}
          className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          layout
        >
          {moviesToShow.map((item) => (
            <MovieCard key={`${item.title}-${item.year}`} item={item} />
          ))}
        </motion.div>
        {movies.length > 3 ? (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllMovies((prev) => !prev)}
              className="rounded-full px-2 py-1 text-sm font-medium text-[#e8c547] transition-opacity hover:opacity-80"
            >
              {showAllMovies ? "Ver menos ↑" : "Ver mais filmes →"}
            </button>
          </div>
        ) : null}
      </div>

      <div>
        <h2 className="inline-block border-b border-[#e8c547] pb-2 text-2xl font-semibold tracking-tight text-[#ffffff]">
          O teu próximo livro
        </h2>
        <motion.div
          key={bookKeys}
          className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {books.map((item) => (
            <BookCard key={`${item.title}-${item.year}`} item={item} />
          ))}
        </motion.div>
      </div>

      {error ? (
        <p className="text-center text-sm text-[#888888]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[#111111] px-6 py-3 text-sm font-medium text-[#ffffff] transition-colors hover:border-[#e8c547]/45 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "A atualizar…" : "Atualizar recomendações"}
        </button>
      </div>
    </section>
  );
}
