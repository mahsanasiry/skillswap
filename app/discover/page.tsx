import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Discover" };

export default function DiscoverPage() {
  return <ComingSoon title="Discover" />;
}
