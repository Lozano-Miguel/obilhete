import type { Metadata } from "next";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { getCachedProfile } from "@/lib/cache";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);
  const normalizedUsername = username.replace(/^@+/, "").toLowerCase();
  const cached = await getCachedProfile(normalizedUsername);
  const displayName = cached?.profile?.displayName ?? username;
  const personalityTag = cached?.stats?.personalityTag ?? "Cinefilo";
  const totalFilms = cached?.stats?.totalFilms ?? 0;

  return {
    title: `${displayName} no O Bilhete — ${personalityTag}`,
    description: `${displayName} já viu ${totalFilms} filmes. Descobre a sua personalidade cinéfila, géneros favoritos e recomendações personalizadas em obilhete.pt`,
    openGraph: {
      title: `${displayName} — ${personalityTag}`,
      description: `${displayName} já viu ${totalFilms} filmes. Vê as suas estatísticas e recomendações em obilhete.pt`,
      images: [`${BASE_URL}/api/og/${encodeURIComponent(normalizedUsername)}`],
      url: `${BASE_URL}/${encodeURIComponent(normalizedUsername)}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} — ${personalityTag}`,
      description: `${displayName} já viu ${totalFilms} filmes.`,
      images: [`${BASE_URL}/api/og/${encodeURIComponent(normalizedUsername)}`],
    },
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);

  return <ProfilePageClient username={username} />;
}
