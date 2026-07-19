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
          <h2 className="text-lg font-semibold text-[#ffffff]">
            E os meus dados?
          </h2>
          <p>
            Usamos apenas informação pública do teu perfil. Guardamos o
            resultado da análise em cache para a página carregar mais depressa
            da próxima vez — nada mais. Não há contas, não há tracking, não há
            venda de dados.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-[15px] leading-relaxed text-[#bbbbbb]">
          <h2 className="text-lg font-semibold text-[#ffffff]">Quem fez isto?</h2>
          <p>
            O Bilhete é um projeto pessoal de Miguel Lozano, feito em Portugal.
            Não tem qualquer afiliação com o Letterboxd, o TMDB ou o Groq.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
