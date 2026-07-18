const CACHE_NAME = 'shanghai-v3'; // 이미지 대응을 위해 버전 업
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
  // 이미지 파일(.jpg, .png)인 경우 캐시 우선 전략 사용 가능하나, 
  // 기존 로직 유지하며 네트워크 우선 후 캐시 업데이트 방식으로 처리
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 유효한 응답인 경우에만 캐시에 저장
        if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});