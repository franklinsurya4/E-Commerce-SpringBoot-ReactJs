import { toast } from 'react-hot-toast';

// Call this ONCE at app startup (see index.js)
export const configureToasts = () => {
  toast.configure({
    position: 'bottom-right',
    duration: 3000,
    style: {
      background: '#151825',
      color: '#f0f2f8',
      border: '1px solid #1e2235',
      borderRadius: '12px',
      fontSize: '0.9rem',
      fontFamily: 'Outfit, sans-serif',
    },
  });

  // 🔒 INTERCEPTOR: Silently block "Failed to update" toasts from leaking
  const originalError = toast.error;
  toast.error = (message, options) => {
    if (typeof message === 'string' && (
      message.toLowerCase().includes('failed to update') ||
      message.toLowerCase().includes('language') ||
      message.toLowerCase().includes('i18n')
    )) {
      console.warn('[Toast Silently Blocked]:', message);
      return null; // Prevents the toast from showing
    }
    return originalError(message, options);
  };
};