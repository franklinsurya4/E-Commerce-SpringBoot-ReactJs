// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { pushService } from '../services/pushService';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Load notifications from localStorage (fallback)
  useEffect(() => {
    const stored = localStorage.getItem(`notifications_${user?.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
  }, [user?.id]);

  // Save notifications to localStorage
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

  // Check push permission on mount
  useEffect(() => {
    if (user?.pushNotifications && pushService.isSupported()) {
      Notification.getPermission().then(permission => {
        setPushEnabled(permission === 'granted');
      });
    }
  }, [user?.pushNotifications]);

  // Add a new notification
  const addNotification = (notification) => {
    const newNotif = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if enabled
    if (pushEnabled && user?.pushNotifications) {
      pushService.showBrowserNotification(newNotif.title, {
        body: newNotif.message,
        tag: newNotif.type,
        clickAction: newNotif.clickUrl
      });
    }

    // Show toast for in-app feedback
    toast.custom((t) => (
      <div className={`toast-notification ${t.visible ? 'enter' : 'exit'}`}>
        <strong>{newNotif.title}</strong>
        <p>{newNotif.message}</p>
      </div>
    ), { duration: 5000 });
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Enable push notifications
  const enablePush = async () => {
    try {
      await pushService.subscribe(user.id);
      setPushEnabled(true);
      toast.success('Push notifications enabled!');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to enable push');
      return false;
    }
  };

  // Disable push notifications
  const disablePush = async () => {
    try {
      await pushService.unsubscribe();
      setPushEnabled(false);
      toast.success('Push notifications disabled');
      return true;
    } catch (err) {
      toast.error('Failed to disable push');
      return false;
    }
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem(`notifications_${user?.id}`);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      pushEnabled,
      addNotification,
      markAsRead,
      markAllAsRead,
      enablePush,
      disablePush,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};