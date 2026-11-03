import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
  copyFileSync,
} from "node:fs";
import { resolve, extname, relative } from "node:path";
const root = resolve(import.meta.dirname, ".."),
  destination = resolve(
    process.argv[2] || resolve(root, "../calculate-online-host"),
  );
const extensions = {
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".webmanifest": "application/manifest+json",
};
let assets = {};
const files = [
  "index.html",
  "app.js",
  "math.js",
  "catalog.js",
  "universe.js",
  "events.js",
  "action-games.js",
  "icons.js",
  "surface.js",
  "online.js",
  "enhancements.js",
  "auth.js",
  "media.js",
  "beer-games.js",
  "locale.js",
  "locale-en.json",
  "style.css",
  "universe.css",
  "events.css",
  "surface.css",
  "online.css",
  "enhancements.css",
  "fonts.css",
  "sw.js",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "manifest.webmanifest",
];
for (const dir of ["fonts", "vendor/aori"])
  for (const name of readdirSync(resolve(root, dir)))
    if (extensions[extname(name)]) files.push(dir + "/" + name);
for (const file of files) {
  const buffer = readFileSync(resolve(root, file));
  assets["/" + file] = {
    type: extensions[extname(file)] || "application/octet-stream",
    data: buffer.toString("base64"),
  };
}
const math = readFileSync(resolve(root, "math.js"), "utf8").replace(
  /^export /gm,
  "",
);
const router = readFileSync(resolve(root, "server/api.js"), "utf8")
  .replace(/^import[^\n]*\n/gm, "")
  .replace(/^export /gm, "");
const worker = readFileSync(resolve(root, "server/worker.js"), "utf8").replace(
  /^import[^\n]*\n/gm,
  "",
);
mkdirSync(resolve(destination, "worker"), { recursive: true });
const bcryptSource = readFileSync(
  resolve(root, "vendor/bcryptjs/index.js"),
  "utf8",
)
  .replace(/^export default /m, "return ")
  .replace(/^export /gm, "");
const output =
  "const bcrypt=(()=>{" +
  bcryptSource +
  "})();\n" +
  math +
  "\n" +
  router +
  "\nconst ASSETS=" +
  JSON.stringify(assets) +
  ";\n" +
  worker;
writeFileSync(resolve(destination, "worker/index.js"), output);
mkdirSync(resolve(destination, "drizzle/meta"), { recursive: true });
writeFileSync(
  resolve(destination, "drizzle/0000_online.sql"),
  readFileSync(resolve(root, "server/0000_online.sql"), "utf8").replace(
    /;\n/g,
    ";\n--> statement-breakpoint\n",
  ),
);
writeFileSync(
  resolve(destination, "drizzle/0001_media.sql"),
  readFileSync(resolve(root, "server/0001_media.sql"), "utf8").replace(
    /;\n/g,
    ";\n--> statement-breakpoint\n",
  ),
);
writeFileSync(
  resolve(destination, "drizzle/0002_accounts.sql"),
  readFileSync(resolve(root, "server/0002_accounts.sql"), "utf8").replace(
    /;\n/g,
    ";\n--> statement-breakpoint\n",
  ),
);
writeFileSync(
  resolve(destination, "drizzle/meta/_journal.json"),
  JSON.stringify(
    {
      version: "7",
      dialect: "sqlite",
      entries: [
        {
          idx: 0,
          version: "6",
          when: 1793653200000,
          tag: "0000_online",
          breakpoints: true,
        },
        {
          idx: 1,
          version: "6",
          when: 1793653200001,
          tag: "0001_media",
          breakpoints: true,
        },
        {
          idx: 2,
          version: "6",
          when: 1793653200002,
          tag: "0002_accounts",
          breakpoints: true,
        },
      ],
    },
    null,
    2,
  ),
);
mkdirSync(resolve(destination, "scripts"), { recursive: true });
writeFileSync(
  resolve(destination, "scripts/build.mjs"),
  `import {mkdirSync,copyFileSync} from 'node:fs';mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});copyFileSync('worker/index.js','dist/server/index.js');copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');console.log('Worker artifact built');\n`,
);
console.log(
  JSON.stringify({
    assets: Object.keys(assets).length,
    workerBytes: Buffer.byteLength(output),
    destination,
  }),
);
