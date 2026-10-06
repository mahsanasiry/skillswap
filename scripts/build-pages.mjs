// Builds the site exactly as GitHub Pages will publish it (with the /skillswap base path).
// A script, so it works the same on Windows, macOS and Linux (no "VAR=value command" syntax).
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, GITHUB_PAGES: "true" },
});
process.exit(result.status ?? 1);
