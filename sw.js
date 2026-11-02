const CACHE = "aori-calculate-v1";
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./universe.css",
  "./universe.js",
  "./events.js",
  "./events.css",
  "./action-games.js",
  "./app.js",
  "./math.js",
  "./catalog.js",
  "./icon.svg",
  "./manifest.webmanifest",
  "./fonts.css",
  "./icon-192.png",
  "./icon-512.png",
  "./fonts/golos-0.ttf",
  "./fonts/golos-1.ttf",
  "./fonts/golos-2.ttf",
  "./fonts/golos-3.ttf",
  "./fonts/golos-4.ttf",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) =>
        Promise.all(
          ks
            .filter((k) => k.startsWith("aori-calculate-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (
    e.request.method !== "GET" ||
    new URL(e.request.url).origin !== location.origin
  )
    return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() =>
        caches
          .match(e.request)
          .then(
            (r) =>
              r ||
              (e.request.mode === "navigate"
                ? caches.match("./index.html")
                : Response.error()),
          ),
      ),
  );
});
