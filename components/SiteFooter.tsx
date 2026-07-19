import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] px-6 py-6 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 text-[11px] text-[#888888] sm:flex-row sm:items-center">
        <p>O Bilhete © 2026</p>
        <div className="flex items-center gap-4 sm:text-right">
          <Link href="/sobre" className="transition-colors hover:text-[#ffffff]">
            Sobre
          </Link>
          <p>Feito com Letterboxd + TMDB + Groq</p>
        </div>
      </div>
    </footer>
  );
}
