// Service Worker for receiving browser Web Push Notifications

self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const payload = event.data.json();
      
      const options = {
        body: payload.body || 'A movie in your watchlist is releasing soon!',
        icon: payload.icon || '/icon.png',
        badge: payload.badge || '/badge.png',
        tag: payload.tag || 'movie-notification',
        requireInteraction: payload.requireInteraction || false,
        data: {
          url: payload.url || '/'
        }
      };

      event.waitUntil(
        self.registration.showNotification(payload.title || 'MoviePulse Alert', options)
      );
    } catch (e) {
      // Handle plain-text notification payload if not JSON
      const options = {
        body: event.data.text() || 'A watchlist item has updates!',
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'movie-notification'
      };

      event.waitUntil(
        self.registration.showNotification('MoviePulse', options)
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // Open the target movie details URL on click
  const targetUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
