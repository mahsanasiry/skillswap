import type { NextConfig } from "next";

// On GitHub Pages the site lives under /<repo-name>, so we need a base path.
// Locally (npm run dev) the base path stays empty.
const repoName = "skillswap";
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export", // static site: required for GitHub Pages
  basePath,
  trailingSlash: true,
  images: { unoptimized: true }, // image optimizer needs a server
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
