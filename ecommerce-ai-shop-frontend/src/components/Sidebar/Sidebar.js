import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Package, MapPin, Settings, User, X, Sparkles } from 'lucide-react';
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
        letterSpacing="1"
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

  const navItems = [
    { path: '/',         icon: Home,        label: t('nav.home') },
    { path: '/products', icon: ShoppingBag, label: t('nav.products') },
    { path: '/orders',   icon: Package,     label: t('nav.orders') },
    { path: '/tracking', icon: MapPin,      label: t('nav.tracking') },
    { path: '/account',  icon: User,        label: t('nav.account') },
    { path: '/settings', icon: Settings,    label: t('nav.settings') },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
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

        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

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