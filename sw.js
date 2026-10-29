/* Offline copy of the photo guide. build.py fills in the version and the file list. */
const CACHE = 'photo-guide-6716dc5d41';
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "fonts/IBMPlexSansKR-0-20ed2f.woff2",
  "fonts/IBMPlexSansKR-0-2d4fc4.woff2",
  "fonts/IBMPlexSansKR-0-585927.woff2",
  "fonts/IBMPlexSansKR-0-bf5400.woff2",
  "fonts/IBMPlexSansKR-1-411411.woff2",
  "fonts/IBMPlexSansKR-1-48e05d.woff2",
  "fonts/IBMPlexSansKR-1-5938c7.woff2",
  "fonts/IBMPlexSansKR-1-8f2e3a.woff2",
  "fonts/IBMPlexSansKR-2-292b68.woff2",
  "fonts/IBMPlexSansKR-2-3eb66c.woff2",
  "fonts/IBMPlexSansKR-2-59aa1d.woff2",
  "fonts/IBMPlexSansKR-2-8af520.woff2"
];

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
