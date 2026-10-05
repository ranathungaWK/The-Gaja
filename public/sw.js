/* GAJA service worker: offline-capable PWA shell.
 *
 * - Pages: network first, fall back to the last cached copy, then /offline.
 * - Build assets (/_next/static): cache first; their URLs are content-hashed.
 * - Images and fonts: stale-while-revalidate.
 * - Never cached: non-GET requests (Server Actions, orders), /admin, /api.
 */
const VERSION = "gaja-v1";
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;
const MEDIA = `${VERSION}-media`;
const PRECACHE = ["/offline", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone());
      trim(PAGES, 40);
    }
    return response;
  } catch {
    return (await cache.match(request, { ignoreVary: true })) || (await cache.match("/offline")) || Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok || response.type === "opaque") {
        cache.put(request, response.clone());
        trim(cacheName, 120);
      }
      return response;
    })
    .catch(() => hit);
  return hit || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin && (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api"))) return;

  // RSC payloads for client-side navigation: let Next.js handle them (it retries itself).
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (sameOrigin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  const isImage =
    request.destination === "image" ||
    (sameOrigin && url.pathname.startsWith("/_next/image")) ||
    url.pathname.includes("/storage/v1/object/public/");
  const isFont = request.destination === "font" || url.hostname === "fonts.gstatic.com";

  if (isImage || isFont || (sameOrigin && url.pathname.startsWith("/icons/"))) {
    event.respondWith(staleWhileRevalidate(request, MEDIA));
  }
});
