import type { Metadata } from "next";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);

  return {
    title: `${username} — O Bilhete`,
    description: `Descobre o perfil cinéfilo de ${username}`,
    openGraph: {
      title: `${username} — O Bilhete`,
      description: `Descobre o perfil cinéfilo de ${username}`,
      images: [`/api/og/${encodeURIComponent(username)}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og/${encodeURIComponent(username)}`],
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
