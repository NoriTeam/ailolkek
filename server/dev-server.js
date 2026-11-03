import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { api } from "./api.js";
import { createDatabase } from "./sqlite-test-db.js";
const root = resolve(import.meta.dirname, "..");
mkdirSync(resolve(root, "qa"), { recursive: true });
const DB = createDatabase(resolve(root, "qa/online-dev.sqlite"));
const types = {
  ".json": "application/json",
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".webmanifest": "application/manifest+json",
};
createServer(async (req, res) => {
  try {
    let url = new URL(req.url, "http://127.0.0.1:4173");
    if (url.pathname === "/__dev/login") {
      let user = /^[a-z]{1,20}$/.test(url.searchParams.get("user") || "")
        ? url.searchParams.get("user")
        : "alpha";
      res.writeHead(302, {
        "Set-Cookie":
          "aori-dev-user=" + user + "; HttpOnly; SameSite=Lax; Path=/",
        Location: "/#online",
      });
      res.end();
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      let data = [];
      for await (const part of req) data.push(part);
      let headers = new Headers(req.headers);
      headers.delete("oai-authenticated-user-id");
      let user = req.headers.cookie?.match(/aori-dev-user=([a-z]+)/)?.[1];
      if (user) headers.set("oai-authenticated-user-id", "dev:" + user);
      let request = new Request(url, {
          method: req.method,
          headers,
          body: ["GET", "HEAD"].includes(req.method)
            ? undefined
            : Buffer.concat(data),
        }),
        response = await api(request, { DB, DEV: true });
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    let target = resolve(root, "." + decodeURIComponent(url.pathname));
    if (target !== root && !target.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (target === root) target = resolve(root, "index.html");
    let data = await readFile(target);
    res.writeHead(200, {
      "Content-Type": types[extname(target)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch (e) {
    res.writeHead(500);
    res.end(e.message);
  }
}).listen(4173, "127.0.0.1", () =>
  console.log("Aori online preview: http://127.0.0.1:4173"),
);
