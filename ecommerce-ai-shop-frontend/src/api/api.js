// src/api/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({ 
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        // Clear auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// ==================== PRODUCTS API ====================
export const productAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getById: (id) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return api.get(`/products/${numericId}`);
  },
  getByCategory: (category) => api.get(`/products/category/${encodeURIComponent(category)}`),
  search: (query) => api.get(`/products/search`, { params: { q: query } }),
  getCategories: () => api.get('/products/categories'),
  
  // 🔥 Price Drop Endpoints
  getPriceDrops: () => api.get('/products/price-drops'),
  getPriceDropsByCategory: (category) => api.get(`/products/price-drops/category/${encodeURIComponent(category)}`),
  getPriceDropsSorted: (sortBy = 'discount') => api.get('/products/price-drops/sorted', { params: { sortBy } }),
  getPriceDropInfo: (id) => api.get(`/products/${id}/price-drop-info`),
  
  // CRUD (Admin)
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  triggerPriceDrop: (id, data) => api.patch(`/products/${id}/price-drop`, data),
  endPriceDrop: (id) => api.delete(`/products/${id}/price-drop`),
  delete: (id) => api.delete(`/products/${id}`),
};

// ==================== CART API ====================
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  updateQty: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
  count: () => api.get('/cart/count').then(res => res.data.count),
};

// ==================== ORDERS API ====================
export const orderAPI = {
  place: (data) => api.post('/orders', data),
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getStats: () => api.get('/orders/stats'),
  track: (trackingNumber) => api.get(`/orders/track/${encodeURIComponent(trackingNumber)}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// ==================== USER API ====================
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  updateSettings: (data) => api.put('/user/settings', data),
  changePassword: (data) => api.put('/user/password', data),
  
  // Addresses
  getAddresses: () => api.get('/user/addresses'),
  addAddress: (data) => api.post('/user/addresses', data),
  updateAddress: (id, data) => api.put(`/user/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/user/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/user/addresses/${id}/default`),
};

// ==================== 🔔 PUSH NOTIFICATIONS API ====================
export const notificationAPI = {
  /**
   * Get VAPID public key for browser push subscription
   * @returns {Promise<string>} The base64url-encoded public key
   */
  getVapidPublicKey: async () => {
    const res = await api.get('/notifications/vapid-public-key');
    return res.data.publicKey;
  },
  
  /**
   * Save browser push subscription to backend
   * @param {PushSubscription} subscription - Browser PushSubscription object
   * @param {Object} metadata - Optional device info
   * @returns {Promise<void>}
   */
  saveSubscription: async (subscription, metadata = {}) => {
    const payload = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      userAgent: metadata.userAgent || navigator.userAgent,
      ipAddress: metadata.ipAddress || null,
    };
    await api.post('/notifications/subscribe', payload);
  },
  
  /**
   * Delete push subscription(s) for current user
   * @param {string|null} endpoint - Specific endpoint to remove, or null for all
   * @returns {Promise<void>}
   */
  deleteSubscription: async (endpoint = null) => {
    const params = endpoint ? { endpoint } : {};
    await api.delete('/notifications/unsubscribe', { params });
  },
  
  /**
   * Send test push notification to current user
   * @returns {Promise<{message: string}>}
   */
  sendTestPush: async () => {
    const res = await api.post('/notifications/test');
    return res.data;
  },
  
  /**
   * Get all active push subscriptions for current user (device management)
   * @returns {Promise<Array<{id: number, endpointMasked: string, deviceInfo: string, platform: string, createdAt: string, lastUsedAt: string, active: boolean}>>}
   */
  getSubscriptions: async () => {
    const res = await api.get('/notifications/subscriptions');
    return res.data;
  },
  
  /**
   * Update a specific subscription (e.g., mark as inactive)
   * @param {number} subscriptionId 
   * @param {Object} updates - Fields to update (e.g., { active: false })
   * @returns {Promise<{message: string, id: number}>}
   */
  updateSubscription: async (subscriptionId, updates) => {
    const res = await api.patch(`/notifications/subscriptions/${subscriptionId}`, updates);
    return res.data;
  },
};

// ==================== 🔔 PUSH UTILITIES ====================
export const pushUtils = {
  /**
   * Convert URL-safe base64 string to Uint8Array (for VAPID key)
   * @param {string} base64String 
   * @returns {Uint8Array}
   */
  urlBase64ToUint8Array: (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },
  
  /**
   * Check if browser supports push notifications
   * @returns {boolean}
   */
  isSupported: () => 
    'serviceWorker' in navigator && 
    'PushManager' in window && 
    'Notification' in window,
  
  /**
   * Get current notification permission status
   * @returns {'granted'|'denied'|'default'}
   */
  getPermission: () => 
    'Notification' in window ? Notification.permission : 'denied',
  
  /**
   * Request notification permission from user
   * @returns {Promise<'granted'|'denied'|'default'>}
   */
  requestPermission: async () => {
    if (!('Notification' in window)) return 'denied';
    return Notification.requestPermission();
  },
  
  /**
   * Register service worker for push notifications
   * @param {string} swPath - Path to service worker file
   * @returns {Promise<ServiceWorkerRegistration>}
   */
  registerServiceWorker: async (swPath = '/firebase-messaging-sw.js') => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }
    return navigator.serviceWorker.register(swPath, { 
      scope: '/',
      updateViaCache: 'none' // Always fetch latest SW
    });
  },
  
  /**
   * Subscribe to push notifications
   * @param {string} vapidPublicKey - VAPID public key from backend
   * @param {ServiceWorkerRegistration} registration - SW registration
   * @returns {Promise<PushSubscription>}
   */
  subscribeToPush: async (vapidPublicKey, registration) => {
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: pushUtils.urlBase64ToUint8Array(vapidPublicKey),
    });
  },
  
  /**
   * Complete flow: Enable push notifications end-to-end
   * @param {Object} options
   * @param {string} options.swPath - Service worker path
   * @param {Function} options.onPermissionChange - Callback when permission changes
   * @returns {Promise<{success: boolean, subscription?: PushSubscription, message?: string}>}
   */
  enablePush: async ({ swPath = '/firebase-messaging-sw.js', onPermissionChange } = {}) => {
    // 1. Check support
    if (!pushUtils.isSupported()) {
      return { success: false, message: 'Push notifications not supported in this browser' };
    }
    
    // 2. Request permission
    const permission = await pushUtils.requestPermission();
    if (onPermissionChange) onPermissionChange(permission);
    
    if (permission !== 'granted') {
      return { 
        success: false, 
        message: permission === 'denied' 
          ? 'Notifications blocked. Enable in browser settings.' 
          : 'Permission not granted' 
      };
    }
    
    // 3. Register service worker
    const registration = await pushUtils.registerServiceWorker(swPath);
    
    // 4. Get VAPID key from backend
    const vapidPublicKey = await notificationAPI.getVapidPublicKey();
    
    // 5. Subscribe to push
    const subscription = await pushUtils.subscribeToPush(vapidPublicKey, registration);
    
    // 6. Save to backend
    await notificationAPI.saveSubscription(subscription, {
      userAgent: navigator.userAgent,
    });
    
    return { success: true, subscription, message: 'Push notifications enabled!' };
  },
  
  /**
   * Disable push notifications for current user
   * @param {string|null} endpoint - Optional specific endpoint
   * @returns {Promise<{success: boolean, message: string}>}
   */
  disablePush: async (endpoint = null) => {
    try {
      // 1. Remove from backend
      await notificationAPI.deleteSubscription(endpoint);
      
      // 2. Unsubscribe from browser (if endpoint provided)
      if (endpoint && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
      
      return { success: true, message: 'Push notifications disabled' };
    } catch (error) {
      console.error('Failed to disable push:', error);
      return { success: false, message: 'Failed to disable notifications' };
    }
  },
  
  /**
   * Listen for push messages while app is open (foreground)
   * @param {Function} onMessage - Callback when push received: (data) => void
   * @returns {Function} cleanup - Call to remove listener
   */
  onForegroundMessage: (onMessage) => {
    if (!('serviceWorker' in navigator)) return () => {};
    
    const handleMessage = (event) => {
      try {
        const data = event.data?.json?.() || event.data;
        console.log('🔔 Foreground push received:', data);
        onMessage?.(data);
      } catch (err) {
        console.error('Error parsing push message:', err);
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  },
};

// ==================== REVIEWS API ====================
export const reviewAPI = {
  getForProduct: (productId, params = {}) => 
    api.get(`/reviews/product/${productId}`, { params }),
  add: (productId, data) => api.post(`/reviews/product/${productId}`, data),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
  getMyReviews: () => api.get('/reviews/mine'),
};

// ==================== CHAT API ====================
export const chatAPI = {
  send: (message) => api.post('/chat', { message }),
  getHistory: (params = {}) => api.get('/chat/history', { params }),
  markAsRead: (conversationId) => api.patch(`/chat/${conversationId}/read`),
};

// ==================== OFFERS & NOTIFICATIONS UI ====================
export const offersAPI = {
  getAll: () => api.get('/offers'),
  getById: (id) => api.get(`/offers/${id}`),
  claim: (id) => api.post(`/offers/${id}/claim`),
};

export const notificationsUI = {
  getAll: (params = {}) => api.get('/notifications/ui', { params }),
  markAsRead: (id) => api.patch(`/notifications/ui/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/ui/read-all'),
  delete: (id) => api.delete(`/notifications/ui/${id}`),
  getUnreadCount: () => api.get('/notifications/ui/unread-count').then(res => res.data.count),
};

// ==================== EXPORT DEFAULT ====================
export default api;