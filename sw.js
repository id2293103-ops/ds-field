/* DS 현장야장 — 오프라인 실행 + 자동 업데이트.
   앱 화면(html)은 인터넷 되면 항상 최신 판으로 (3초 안에 안 오면 저장해 둔 판), 아이콘 등은 저장해 둔 걸로 바로 */
const C = 'ds-field-v2';
const FILES = ['./DS현장야장.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const page = e.request.mode === 'navigate' || /\.html$/.test(new URL(e.request.url).pathname);
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request, page ? { cache: 'no-store' } : {}).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
    e.waitUntil(net.catch(() => {}));
    if (!page) return hit || net.catch(() => Response.error());
    const late = new Promise(res => setTimeout(res, 3000, null));
    const r = await Promise.race([net.catch(() => null), late]);
    return (r && r.ok) ? r : (hit || (await c.match('./DS현장야장.html')) || net);
  }));
});
