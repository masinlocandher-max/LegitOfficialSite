import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("../studio/", import.meta.url));
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};
export function createStudioServer(root = ROOT) {
  return createServer(async (req, res) => {
    const headers = {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; frame-src 'self' about:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
    };
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { ...headers, Allow: "GET, HEAD" });
      return res.end("Method not allowed");
    }
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400, headers);
      return res.end("Invalid path");
    }
    if (pathname === "/favicon.ico") {
      res.writeHead(204, headers);
      return res.end();
    }
    if (pathname === "/") pathname = "/index.html";
    const path = resolve(root, "." + pathname);
    if (
      !path.startsWith(resolve(root) + sep) ||
      !TYPES[extname(path)] ||
      pathname.includes("\\")
    ) {
      res.writeHead(404, headers);
      return res.end("Not found");
    }
    try {
      if (!(await stat(path)).isFile()) throw new Error();
      const body = await readFile(path);
      res.writeHead(200, { ...headers, "Content-Type": TYPES[extname(path)] });
      return res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      res.writeHead(404, headers);
      return res.end("Not found");
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const port = Number(process.env.PORT || 4173),
    host = process.env.HOST || "127.0.0.1";
  const server = createStudioServer();
  server.listen(port, host, () =>
    console.log(`Template studio: http://${host}:${port}`),
  );
}
