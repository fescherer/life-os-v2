const APP_CACHE = "life-os-app-v1";
const IMAGE_CACHE = "life-os-images-v1";
const MAX_IMAGE_CACHE_ENTRIES = 160;

const APP_SHELL_URLS = ["/", "/icons/life-os-192.png", "/icons/life-os-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => ![APP_CACHE, IMAGE_CACHE].includes(cacheName))
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirstImage(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirstImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok || response.type === "opaque") {
    await cache.put(request, response.clone());
    await trimCache(cache, MAX_IMAGE_CACHE_ENTRIES);
  }

  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (await cache.match(request)) ?? (await cache.match("/"));
  }
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();

  if (keys.length <= maxEntries) {
    return;
  }

  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}
