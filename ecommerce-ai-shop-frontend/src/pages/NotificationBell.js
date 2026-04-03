// src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/notifications.css';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_confirmed': return '📦';
      case 'order_shipped': return '🚚';
      case 'order_delivered': return '✅';
      case 'order_cancelled': return '❌';
      case 'price_drop': return '💰';
      default: return '🔔';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now - then) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button 
        className="bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FontAwesomeIcon icon={faBell} size="lg" />
        {unreadCount > 0 && (
          <span className="badge">
            {unreadCount > 9 ? '9+' : unreadCount}
            <FontAwesomeIcon icon={faCircle} className="pulse-dot" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-all" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <p>No notifications yet</p>
                <small>Order updates will appear here</small>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => {
                    markAsRead(notif.id);
                    if (notif.clickUrl) window.location.href = notif.clickUrl;
                  }}
                >
                  <span className="notif-icon">{getNotificationIcon(notif.type)}</span>
                  <div className="notif-content">
                    <div className="notif-header">
                      <strong>{notif.title}</strong>
                      <span className="notif-time">{getTimeAgo(notif.timestamp)}</span>
                    </div>
                    <p className="notif-message">{notif.message}</p>
                    {notif.orderNumber && (
                      <span className="order-tag">Order #{notif.orderNumber}</span>
                    )}
                  </div>
                  {!notif.read && <span className="unread-dot" />}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="dropdown-footer">
              <button onClick={() => window.location.href = '/orders'}>
                View all orders
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}