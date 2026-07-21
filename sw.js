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

// 이미지 파일인지 확인하는 함수
function isImageRequest(request) {
  return request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(new URL(request.url).pathname);
}

// 1. 설치: 기본 파일들을 강제로 새로 받아와 저장
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        ASSETS.map(url =>
          // no-store로 서버에서 깡통 최신 파일을 가져옴
          fetch(url, { cache: 'no-store' })
            .then(res => {
              if (res.ok) return cache.put(url, res);
            })
            .catch(err => console.warn('[SW] 캐싱 실패:', url))
        )
      )
    )
  );
});

// 2. 활성화: 옛날 버전 청소
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// 3. 데이터 요청: [네트워크 우선] 전략
self.addEventListener('fetch', (e) => {
  // 깃허브 페이지스 보안상 POST 요청 등은 캐싱하지 않음
  if (e.request.method !== 'GET') return;

  e.respondWith(
    // 일단 네트워크에 물어봄 (no-store로 최신 유지)
    fetch(e.request, { cache: 'no-store' })
      .then(res => {
        // 성공하면 캐시에 최신본을 업데이트하고 반환
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => {
        // [비상시] 네트워크가 안 되면 내 폰에 저장된 걸 보여줌
        return caches.match(e.request);
      })
  );
});
