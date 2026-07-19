import { Hero } from "@/components/landing/Hero";
import { SiteFooter } from "@/components/SiteFooter";
import { getTotalProfilesCount } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function Home() {
  const totalProfiles = await getTotalProfilesCount();

  return (
    <>
      <Hero totalProfiles={totalProfiles} />
      <SiteFooter />
    </>
  );
}
