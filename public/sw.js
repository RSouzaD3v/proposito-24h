self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch { data = { body: event.data ? event.data.text() : '' }; }

  const title = data.title || 'propósito24h';
  const body = data.body || '';
  const icon = data.icon || '/AppImages/ios/192.png';
  const tag  = data.tag;
  const url  = data.url || '/';

  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon, tag, renotify: !!tag, data: { url }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const c of clientList) { if ('focus' in c) { c.postMessage({ type: 'OPEN_URL', url: targetUrl }); return c.focus(); } }
      return self.clients.openWindow(targetUrl);
    })
  );
});
