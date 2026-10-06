// Serves the built site from ./out, the way a static host would.
// It detects the base path from the build, so both kinds of build work:
//   npm run build        -> http://localhost:3000/
//   npm run build:pages  -> http://localhost:3000/skillswap/
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve("out");
const port = Number(process.env.PORT) || 3000;

if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error('There is no build yet. Run "npm run build" (or "npm run build:pages") first.');
  process.exit(1);
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const base = index.match(/(?:src|href)="((?:\/[^/"]+)*?)\/_next\//)?.[1] ?? "";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

function send(res, status, file) {
  res.writeHead(status, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}

function resolveFile(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  const target = path.join(root, clean);
  if (!target.startsWith(root)) return null; // never leave the out folder
  for (const candidate of [target, path.join(target, "index.html"), `${target}.html`]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

http
  .createServer((req, res) => {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    const notFound = path.join(root, "404.html");

    if (base && pathname !== base && !pathname.startsWith(`${base}/`)) {
      return send(res, 404, notFound); // like GitHub Pages: nothing lives outside the base path
    }
    const file = resolveFile(pathname.slice(base.length) || "/");
    if (file) return send(res, 200, file);
    return send(res, 404, notFound);
  })
  .listen(port, () => {
    console.log(`SkillSwap is running at http://localhost:${port}${base}/`);
  });
