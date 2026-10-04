import type { Metadata } from "next";
import { ProfileView } from "@/components/profile/profile-view";
import { users } from "@/data/users";

type Props = { params: Promise<{ id: string }> };

// Static export needs every profile page listed ahead of time.
export const dynamicParams = false;

export function generateStaticParams() {
  return users.map((user) => ({ id: user.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = users.find((u) => u.id === id);
  return { title: user ? user.name : "Profile" };
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  return (
    <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <ProfileView id={id} />
    </main>
  );
}
