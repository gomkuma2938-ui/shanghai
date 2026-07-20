const CACHE_NAME = 'shanghai-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data/hotel.js',
  './data/tour.js',
  './data/restaurant.js',
  './data/menu_data.js',
  './data/talk.js',
  './data/schedule.js',
  './data/others.js'
];

function isImageRequest(request) {
  return request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(new URL(request.url).pathname);
}

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // addAll 대신 개별 캐싱 → 하나 실패해도 install 전체가 죽지 않음
      Promise.all(
        ASSETS.map(url =>
          fetch(url, { cache: 'no-store' })
            .then(res => {
              if (res.ok) return cache.put(url, res);
              console.warn('[SW] 캐싱 실패(무시):', url, res.status);
            })
            .catch(err => console.warn('[SW] 요청 실패(무시):', url, err))
        )
      )
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (isImageRequest(e.request)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
          }
          return res;
        });
      })
    );
    return;
  }

  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(res => {
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
