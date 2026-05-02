import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { getTotalProfilesCount } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function Home() {
  const totalProfiles = await getTotalProfilesCount();

  return (
    <>
      <Hero totalProfiles={totalProfiles} />
      <HowItWorks />
      <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] px-6 py-6 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 text-[11px] text-[#888888] sm:flex-row sm:items-center">
          <p>O Bilhete © 2025</p>
          <p className="sm:text-right">Feito com Letterboxd + TMDB + Groq</p>
        </div>
      </footer>
    </>
  );
}
