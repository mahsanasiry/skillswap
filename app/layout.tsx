import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SkillSwap - Learn together. Share what you know.",
    template: "%s | SkillSwap",
  },
  description:
    "SkillSwap helps you find people to trade skills with: teach what you know, learn what you want.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
