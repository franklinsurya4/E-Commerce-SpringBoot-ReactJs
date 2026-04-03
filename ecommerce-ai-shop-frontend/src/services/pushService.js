// src/services/pushService.js
import { userAPI } from '../api/api';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

export const pushService = {
  // Check if browser supports push
  isSupported: () => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Request permission and subscribe
  subscribe: async (userId) => {
    if (!pushService.isSupported()) {
      throw new Error('Push notifications not supported');
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: pushService.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Send subscription to backend
    await userAPI.savePushSubscription({
      userId,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    return subscription;
  },

  // Unsubscribe from push
  unsubscribe: async () => {
    if (!pushService.isSupported()) return;
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      await userAPI.deletePushSubscription();
    }
  },

  // Helper: Convert VAPID key
  urlBase64ToUint8Array: (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  },

  // Show browser notification
  showBrowserNotification: (title, options = {}) => {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/logo192.png',
        badge: '/badge-72.png',
        ...options
      });
    }
  }
};