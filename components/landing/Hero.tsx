"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function parseUsername(input: string): string {
  const cleaned = input.trim();
  const match = cleaned.match(/letterboxd\.com\/([^\/\?]+)/i);
  if (match) return match[1].toLowerCase();
  return cleaned.replace(/\//g, "").toLowerCase();
}

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

function staggerDelay(index: number) {
  return { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: index * 0.1 };
}

type HeroProps = {
  totalProfiles: number;
};

export function Hero({ totalProfiles }: HeroProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const u = parseUsername(username).replace(/^@+/, "");
    if (!u) return;
    router.push(`/${encodeURIComponent(u)}`);
  }

  const countLabel = new Intl.NumberFormat("pt-PT").format(totalProfiles);

  return (
    <section className="hero-film-grain relative flex min-h-[100dvh] flex-col bg-[#0a0a0a] text-[#ffffff]">
      <motion.div
        className="absolute left-6 top-8 z-10 md:left-10 md:top-10"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={staggerDelay(0)}
      >
        <span
          className="inline-block text-sm font-medium tracking-[0.2em] text-[#e8c547]"
          style={{ fontVariant: "small-caps" }}
        >
          O Bilhete
        </span>
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-28 pt-20 md:px-10 md:pb-32">
        <motion.div
          className="flex w-full max-w-5xl flex-col items-center text-center"
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={staggerDelay(1)}
        >
          <h1 className="text-balance font-semibold leading-[0.95] tracking-tight">
            <span className="block text-[clamp(3rem,12vw,6rem)]">Conhece</span>
            <span className="mt-1 block text-[clamp(2.25rem,9vw,4.5rem)] font-medium">
              o teu gosto.
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="mx-auto mt-8 max-w-xl text-pretty text-center text-base leading-relaxed text-[#888888] md:text-lg"
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={staggerDelay(2)}
        >
          Introduz o teu username do Letterboxd. Vemos o que os teus filmes dizem sobre
          ti — e recomendamos o que veres a seguir.
        </motion.p>

        <motion.form
          className="mt-10 w-full max-w-xl"
          onSubmit={handleSubmit}
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={staggerDelay(3)}
        >
          <div className="flex w-full flex-col gap-3 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#111111] p-1.5 pl-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:flex-row sm:items-center sm:gap-0 sm:pl-6">
            <label htmlFor="letterboxd-username" className="sr-only">
              Username ou link do Letterboxd
            </label>
            <input
              id="letterboxd-username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="username ou link do Letterboxd"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="min-h-[48px] w-full flex-1 bg-transparent py-3 text-[15px] text-[#ffffff] outline-none placeholder:text-[#888888] sm:py-0"
            />
            <button
              type="submit"
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-full bg-[#e8c547] px-7 text-sm font-semibold text-[#0a0a0a] transition-[filter] hover:brightness-105 active:brightness-95"
            >
              Analisar →
            </button>
          </div>
        </motion.form>
      </div>

      <motion.p
        className="relative z-10 px-6 pb-10 text-center text-xs text-[#888888] md:px-10"
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={staggerDelay(4)}
      >
        {countLabel} perfis analisados
      </motion.p>
    </section>
  );
}
