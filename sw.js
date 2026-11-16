/* Service worker — ทำให้เบราว์เซอร์ถือว่าเป็นเว็บแอปที่ติดตั้งได้ และเปิดหน้าแอปได้แม้ออฟไลน์ (ข้อมูลจริงยังดึงจากเน็ตตามเดิม)
   ใช้ "เน็ตก่อน แคชทีหลัง" เฉพาะไฟล์ในโดเมนเดียวกัน จึงไม่ค้างเวอร์ชันเก่าเมื่ออัปเดต index.html */
const CACHE = 'oee-shell-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;  // Google Sheets / Apps Script / CDN ปล่อยผ่าน
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(m => m || caches.match('index.html')))
  );
});
