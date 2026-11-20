// Mana AP Reborn map: offline-ish cache so the 2nd visit on mobile data is fast.
// Versioned files (?v=BUILD) never change -> cache first. Page itself -> network first.
// Map style/fonts + zoomed-out tiles (z<=11) -> show cached, refresh in background.
const C = 'apmap-v1';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
const put = (req, res) => { if (res && res.ok) { const cl = res.clone(); caches.open(C).then(c => c.put(req, cl)); } return res; };
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    if (u.searchParams.has('v')) { e.respondWith(caches.match(r).then(m => m || fetch(r).then(x => put(r, x)))); return; }
    e.respondWith(fetch(r).then(x => put(r, x)).catch(() => caches.match(r))); return;
  }
  if (u.hostname === 'tiles.openfreemap.org') {
    const t = u.pathname.match(/\/(\d+)\/\d+\/\d+\.pbf$/);
    if (t && +t[1] > 11) return;
    e.respondWith(caches.match(r).then(m => { const f = fetch(r).then(x => put(r, x)).catch(() => m); return m || f; }));
  }
});
