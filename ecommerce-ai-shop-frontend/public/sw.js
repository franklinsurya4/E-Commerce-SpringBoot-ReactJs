// public/sw.js
const CACHE_NAME = 'aishop-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/logo192.png', '/badge-72.png']);
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/logo192.png',
      badge: data.badge || '/badge-72.png',
      tag: data.tag || 'order-update',
      renotify: true,
      data: {
        url: data.clickAction || '/orders'
      }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/orders';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientsList) => {
      // Focus existing tab if open
      for (const client of clientsList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});