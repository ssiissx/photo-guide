/* Offline copy of the photo guide. build.py fills in the version and the file list. */
const CACHE = 'photo-guide-__VERSION__';
const ASSETS = __ASSETS__;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('photo-guide-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* page: try the network briefly so updates show up, otherwise the saved copy.
   everything else (fonts, icons): saved copy first. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    const fromCache = () => caches.match('index.html').then(r => r || caches.match('./'));
    const fromNet = fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); }
      return res;
    });
    fromNet.catch(() => {});
    const timeout = new Promise(resolve => setTimeout(resolve, 3000));
    e.respondWith(Promise.race([fromNet, timeout]).then(r => r || fromCache()).catch(fromCache));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
