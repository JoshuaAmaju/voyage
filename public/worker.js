const CACHE_NAME = "pwa-task-manager";

const urlsToCache = ["/", "/player"];

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (ev) => {
  ev.respondWith(
    caches.match(ev.request).then((response) => {
      return response ? response : fetch(ev.request);
    })
  );
});

self.addEventListener("activate", (ev) => {
  const cacheWhitelist = ["pwa-task-manager"];

  ev.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (!cacheWhitelist.includes(name)) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});
