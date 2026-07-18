const CACHE_NAME = 'shanghai-v1'; // 이미지 대응을 위해 버전 업
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

// 이미지 파일 여부 판별 (확장자 기준)
function isImageRequest(request) {
  return request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(new URL(request.url).pathname);
}

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
  // 이미지: 안 바뀌는 파일이므로 캐시 우선, 캐시에 없을 때만 네트워크 요청 후 저장
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

  // 그 외(HTML/CSS/JS/데이터 파일): 자주 바뀔 수 있으므로 네트워크 우선, 실패 시 캐시로 대체
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
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
