import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Package, MapPin, Settings, User, X, Sparkles } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons';

import './Sidebar.css';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/products', icon: ShoppingBag, label: 'Products' },
  { path: '/orders', icon: Package, label: 'Orders' },
  { path: '/tracking', icon: MapPin, label: 'Track Order' },
  { path: '/account', icon: User, label: 'Account' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="brand-name">
            <FontAwesomeIcon icon={faShoppingBag} className="brand-icon" />
            QualityProducts
          </span>
          <button className="sidebar-close" onClick={onClose}><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="ai-badge">
            <Sparkles size={16} />
            <span>Powered by QualityProducts</span>
          </div>
        </div>
      </aside>
    </>
  );
}