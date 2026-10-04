import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";
import { users } from "@/data/users";

export const metadata: Metadata = { title: "Profile" };

// Static export needs every profile page listed ahead of time.
export const dynamicParams = false;

export function generateStaticParams() {
  return users.map((user) => ({ id: user.id }));
}

export default function ProfilePage() {
  return <ComingSoon title="Profile" />;
}
