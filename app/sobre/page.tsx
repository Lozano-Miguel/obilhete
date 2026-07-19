import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Sobre — O Bilhete",
  description:
    "O que é O Bilhete, como analisamos o teu perfil do Letterboxd e o que fazemos com os dados.",
};

export default function SobrePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0a0a0a] text-[#ffffff]">
      <header className="flex items-center justify-between px-6 py-8 md:px-10">
        <Logo />
        <Link
          href="/"
          className="text-sm text-[#888888] transition-colors hover:text-[#ffffff]"
        >
          ← Início
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-20 pt-8 md:px-10">
        <h1 className="text-4xl font-semibold tracking-tight">Sobre</h1>

        <section className="mt-10 space-y-4 text-[15px] leading-relaxed text-[#bbbbbb]">
          <h2 className="text-lg font-semibold text-[#ffffff]">
            O que é O Bilhete?
          </h2>
          <p>
            O Bilhete lê o teu perfil público do Letterboxd e transforma-o num
            retrato do teu gosto: os realizadores que mais vês, os géneros e
            décadas que dominam o teu diário, os países de onde vem o teu
            cinema. No fim, sugere-te filmes que fazem sentido para ti.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-[15px] leading-relaxed text-[#bbbbbb]">
          <h2 className="text-lg font-semibold text-[#ffffff]">
            Como funciona?
          </h2>
          <p>
            Só precisas do teu nome de utilizador do Letterboxd — não pedimos
            password nem acesso à tua conta. Os dados dos filmes (cartazes,
            realizadores, géneros) vêm do TMDB, e as recomendações são geradas
            com a ajuda de um modelo de linguagem através do Groq.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-[15px] leading-relaxed text-[#bbbbbb]">
          <h2 className="text-lg font-semibold text-[#ffffff]">Open source</h2>
          <p>
            O Bilhete é um projeto de código-aberto (open source). O
            código-fonte está disponível no GitHub, aberto a contribuições,
            feedback e sugestões da comunidade.
          </p>
          <a
            href="https://github.com/Lozano-Miguel/obilhete"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] px-5 py-2.5 text-sm font-medium text-[#ffffff] transition-colors hover:border-[#e8c547] hover:text-[#e8c547]"
          >
            Ver repositório no GitHub →
          </a>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
