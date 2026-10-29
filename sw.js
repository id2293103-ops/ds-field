/* DS 현장야장 — 오프라인 실행용. 저장해 둔 판으로 바로 열고, 인터넷 되면 뒤에서 새 판을 받아 둠 (다음 실행 때 반영) */
const C = 'ds-field-v1';
const FILES = ['./DS현장야장.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    e.waitUntil(net.catch(() => {}));
    return hit || net;
  }));
});
