// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  Package,
  MapPin,
  Settings,
  User,
  X,
  Sparkles,
  Wallet
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

function QualityProductsLogo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="brand-logo"
    >
      <rect width="64" height="64" rx="14" fill="url(#logoGradient)" />
      <text
        x="32"
        y="43"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="28"
        fill="#ffffff"
      >
        QP
      </text>
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/',         icon: Home,        labelKey: 'nav.home' },
    { path: '/products', icon: ShoppingBag, labelKey: 'nav.products' },
    { path: '/orders',   icon: Package,     labelKey: 'nav.orders' },
    { path: '/tracking', icon: MapPin,      labelKey: 'nav.tracking' },
    { path: '/account',  icon: User,        labelKey: 'nav.account' },
    { path: '/wallet',   icon: Wallet,      labelKey: 'nav.wallet' },
    { path: '/settings', icon: Settings,    labelKey: 'nav.settings' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

        {/* Header */}
        <div className="sidebar-header">
          <NavLink to="/" className="brand-name" onClick={onClose}>
            <QualityProductsLogo size={32} />
            <span className="brand-text">
              Quality<span className="brand-accent">Products</span>
            </span>
          </NavLink>

          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, labelKey }) => {
            
            // 🔥 Smart active logic (handles nested routes like /wallet/add)
            const isActive =
              location.pathname === path ||
              location.pathname.startsWith(path + '/');

            return (
              <NavLink
                key={path}
                to={path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={20} />
                <span>{t(labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="ai-badge">
            <Sparkles size={14} />
            <span>Powered by QualityProducts</span>
          </div>
        </div>

      </aside>
    </>
  );
}