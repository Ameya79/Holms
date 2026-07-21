// Holms — Minimal service worker
// Required for PWA install prompt to fire. Caches the app shell.

const CACHE_NAME = "holms-v1";
const SHELL_FILES = [
    "/",
    "/index.html",
    "/style.css",
    "/app.js",
    "/manifest.json",
    "/favicon.svg",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    // Network-first for API calls, cache-first for static assets
    if (event.request.url.includes("/upload") ||
        event.request.url.includes("/chat") ||
        event.request.url.includes("/documents") ||
        event.request.url.includes("/settings")) {
        return; // Let API calls go straight to network
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request);
        })
    );
});
