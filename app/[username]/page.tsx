import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);

  return <ProfilePageClient username={username} />;
}
