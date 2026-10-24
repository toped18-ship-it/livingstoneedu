// Firebase Cloud Messaging Background Service Worker
// Handles real-time push alerts even when the browser tab is closed
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDFWBa-XQ5Ppz8aAcChO8U5uWQ5gMRrBRM",
  authDomain: "livingstoneedu-1ef57.firebaseapp.com",
  projectId: "livingstoneedu-1ef57",
  storageBucket: "livingstoneedu-1ef57.firebasestorage.app",
  messagingSenderId: "862725103424",
  appId: "1:862725103424:web:dd47f90a610e60d93424a5"
});

const messaging = firebase.messaging();

// Handle FCM Push Notification when App is closed or backgrounded
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Received background notification:', payload);

  const title = payload.notification?.title || payload.data?.title || '📢 LivingstoneEDU Real-Time Alert';
  const body = payload.notification?.body || payload.data?.body || 'New lesson note, exam schedule, or announcement available.';
  const category = payload.data?.category || 'announcement';

  const options = {
    body: body,
    icon: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=128&q=80',
    badge: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=64&q=80',
    vibrate: [200, 100, 200, 100, 200],
    tag: `fcm-alert-${category}-${Date.now()}`,
    renotify: true,
    data: {
      url: payload.data?.url || '/',
      category: category,
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_portal', title: '👁️ Open Portal' },
      { action: 'close_alert', title: '✕ Dismiss' }
    ]
  };

  self.registration.showNotification(title, options);
});

// Handle click on background push notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close_alert') return;

  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
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
