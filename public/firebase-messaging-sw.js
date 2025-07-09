/* eslint-disable no-undef */
// Import the functions you need from the SDKs you need
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpdoGRmNpyOu2SLDwLkWTMZH8fmjxDRQE",
  authDomain: "thienbao122004-1be46.firebaseapp.com",
  projectId: "thienbao122004-1be46",
  storageBucket: "thienbao122004-1be46.appspot.com",
  messagingSenderId: "952842872836",
  appId: "1:952842872836:web:0a9b9505fe4cb39faced51",
  measurementId: "G-51JE6TRC1T"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'PhyGen - Thông báo mới';
  const notificationOptions = {
    body: payload.notification.body || 'Bạn có thông báo mới',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'notification-' + Date.now(),
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'Xem ngay',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Đóng'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Focus or open app window
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      const url = event.notification.data?.url || '/';
      
      // Check if there is already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
}); 