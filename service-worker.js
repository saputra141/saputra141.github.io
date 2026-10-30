const CACHE_NAME = "fbt-downloader-v1";
const APP_URL = "/video-downloader/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(APP_URL);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Jangan mengganggu proses download atau permintaan selain GET.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Halaman utama: utamakan jaringan agar selalu mendapat versi terbaru.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        return (
          await caches.match(APP_URL)
        ) || Response.error();
      })
    );
  }
});
