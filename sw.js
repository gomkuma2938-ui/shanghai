const CACHE_NAME = 'shanghai-v2'; // 데이터 바뀔 때마다 버전 숫자 올리기
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data/location.js',
  './data/menu_data.js',
  './data/talk.js',
  './data/schedule.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, res.clone()));
        return res.clone();
      })
      .catch(() => caches.match(e.request))
  );
});
