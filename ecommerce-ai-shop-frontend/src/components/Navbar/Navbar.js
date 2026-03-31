import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingBag, User, Menu, X, LogOut, Loader,
  Heart, Bell, Settings, Package, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/Wishlistcontext';
import { productAPI } from '../../api/api';
import { useTranslation } from 'react-i18next';

import './Navbar.css';

export default function Navbar({ onMenuToggle, notificationCount = 0 }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchFocused, setSearchFocused] = useState(false);

  const searchRef = useRef();
  const userRef = useRef();
  const timer = useRef();

  /* ── Click-away ── */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
        setSearchFocused(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Search logic ── */
  const handleSearch = (val) => {
    setQuery(val);
    setActiveIndex(-1);
    clearTimeout(timer.current);

    if (val.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await productAPI.search(val.trim());
        const data = res.data?.data || [];
        setResults(Array.isArray(data) ? data.slice(0, 6) : []);
        setShowResults(true);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
        setShowResults(true);
      }
      setSearching(false);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) {
      if (e.key === 'Escape') { setShowResults(false); setSearchFocused(false); }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          navigate(`/products/${results[activeIndex].id}`);
          clearSearch();
        } else if (query.trim()) {
          navigate(`/products?q=${encodeURIComponent(query)}`);
          clearSearch();
        }
        break;
      case 'Escape':
        setShowResults(false);
        setActiveIndex(-1);
        setSearchFocused(false);
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query)}`);
      clearSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setActiveIndex(-1);
    setSearchFocused(false);
  };

  const highlightMatch = (text, q) => {
    if (!text || !q.trim()) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
    );
  };

  return (
    <nav className="navbar">
      {/* ── Left: Menu + Search ── */}
      <div className="nav-left">
        <button className="nav-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={22} />
        </button>

        <form
          className={`nav-search ${searchFocused ? 'nav-search--focused' : ''}`}
          onSubmit={handleSubmit}
          ref={searchRef}
        >
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={t('nav.search')}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              setSearchFocused(true);
              if (query.trim().length >= 2 && results.length > 0) setShowResults(true);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />

          {/* Keyboard hint */}
          {!searchFocused && !query && (
            <span className="search-kbd">
              <kbd>/</kbd>
            </span>
          )}

          {searching && (
            <span className="search-spinner">
              <Loader size={16} className="spin" />
            </span>
          )}
          {query && !searching && (
            <button type="button" className="search-clear" onClick={clearSearch}>
              <X size={16} />
            </button>
          )}

          {showResults && (
            <div className="search-dropdown">
              {results.length > 0 ? (
                <>
                  <div className="search-dropdown-header">
                    <span>{t('nav.searchResults', 'Results')}</span>
                    <span className="search-count">{results.length} {t('nav.found', 'found')}</span>
                  </div>
                  {results.map((p, i) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.id}`}
                      className={`search-result ${i === activeIndex ? 'search-result--active' : ''}`}
                      onClick={clearSearch}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} />
                      ) : (
                        <div className="search-result-placeholder">
                          <ShoppingBag size={18} />
                        </div>
                      )}
                      <div className="search-result-info">
                        <span className="result-name">{highlightMatch(p.name, query)}</span>
                        <span className="result-meta">
                          {p.category && <span className="result-category">{p.category}</span>}
                          {p.brand && <span className="result-brand">{p.brand}</span>}
                        </span>
                      </div>
                      <span className="result-price">${p.price?.toFixed(2)}</span>
                    </Link>
                  ))}
                  <Link
                    to={`/products?q=${encodeURIComponent(query)}`}
                    className="search-view-all"
                    onClick={clearSearch}
                  >
                    <span>{t('nav.viewAllResults', { query })}</span>
                    <ChevronRight size={14} />
                  </Link>
                </>
              ) : !searching ? (
                <div className="search-no-results">
                  <Search size={22} />
                  <span className="search-no-title">{t('nav.noResults', { query })}</span>
                  <span className="search-no-hint">{t('nav.tryDifferent', 'Try a different keyword')}</span>
                </div>
              ) : null}
            </div>
          )}
        </form>
      </div>

      {/* ── Right: Actions ── */}
      <div className="nav-right">
        {/* Notifications */}
        <Link to="/notifications" className="nav-action-btn nav-notif-btn" title={t('nav.notifications', 'Notifications')}>
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="nav-badge nav-badge--notif">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
          <span className="nav-action-label">{t('nav.notifications', 'Notifications')}</span>
        </Link>

        {/* Wishlist */}
        <Link to="/wishlist" className="nav-action-btn nav-wish-btn" title={t('nav.wishlist')}>
          <Heart size={20} />
          {wishlist.length > 0 && (
            <span className="nav-badge nav-badge--wish">{wishlist.length}</span>
          )}
          <span className="nav-action-label">{t('nav.wishlist')}</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="nav-action-btn nav-cart-btn" title={t('nav.cart')}>
          <ShoppingBag size={20} />
          {cart.itemCount > 0 && (
            <span className="nav-badge nav-badge--cart">{cart.itemCount}</span>
          )}
          <span className="nav-action-label">{t('nav.cart')}</span>
        </Link>

        {/* Divider */}
        <div className="nav-divider" />

        {/* User */}
        {isAuthenticated ? (
          <div className="nav-user" ref={userRef}>
            <button
              className="nav-user-trigger"
              onClick={() => setShowUser(!showUser)}
              aria-expanded={showUser}
            >
              <div className="nav-user-avatar">
                {user?.fullName?.[0] || 'U'}
              </div>
              <div className="nav-user-text">
                <span className="nav-user-name">{user?.fullName?.split(' ')[0] || t('nav.account')}</span>
              </div>
            </button>

            {showUser && (
              <div className="user-dropdown">
                {/* Profile header */}
                <div className="user-dropdown-header">
                  <div className="user-dropdown-avatar">
                    {user?.fullName?.[0] || 'U'}
                  </div>
                  <div className="user-dropdown-info">
                    <p className="user-dropdown-name">{user?.fullName}</p>
                    <p className="user-dropdown-email">{user?.email}</p>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-section">
                  <Link to="/account" className="dropdown-item" onClick={() => setShowUser(false)}>
                    <User size={16} />
                    <span>{t('nav.account')}</span>
                    <ChevronRight size={14} className="dropdown-item-arrow" />
                  </Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setShowUser(false)}>
                    <Package size={16} />
                    <span>{t('nav.orders')}</span>
                    <ChevronRight size={14} className="dropdown-item-arrow" />
                  </Link>
                  <Link to="/wishlist" className="dropdown-item" onClick={() => setShowUser(false)}>
                    <Heart size={16} />
                    <span>{t('nav.wishlist')}</span>
                    <ChevronRight size={14} className="dropdown-item-arrow" />
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setShowUser(false)}>
                    <Settings size={16} />
                    <span>{t('nav.settings')}</span>
                    <ChevronRight size={14} className="dropdown-item-arrow" />
                  </Link>
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-section">
                  <button
                    className="dropdown-item dropdown-item--danger"
                    onClick={() => { logout(); setShowUser(false); navigate('/'); }}
                  >
                    <LogOut size={16} />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-login-btn">
            <User size={18} />
            <span>{t('nav.login')}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}