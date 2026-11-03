import { api } from "./api.js";
import { ASSETS } from "./generated-assets.js";
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return api(request, env);
    let path = url.pathname === "/" ? "/index.html" : url.pathname,
      asset = ASSETS[path];
    if (!asset) return new Response("Not found", { status: 404 });
    const bytes = Uint8Array.from(atob(asset.data), (c) => c.charCodeAt(0));
    return new Response(request.method === "HEAD" ? null : bytes, {
      headers: {
        "Content-Type": asset.type,
        "Cache-Control": path.startsWith("/fonts/")
          ? "public,max-age=86400"
          : "public,max-age=60",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  },
};
