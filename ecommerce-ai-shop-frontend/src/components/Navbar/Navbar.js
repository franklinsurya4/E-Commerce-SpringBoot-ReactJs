import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, LogOut, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productAPI } from '../../api/api';

import './Navbar.css';

export default function Navbar({ onMenuToggle }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef();
  const userRef = useRef();
  const timer = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
      if (e.key === 'Escape') setShowResults(false);
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
      <div className="nav-left">
        <button className="nav-menu-btn" onClick={onMenuToggle}><Menu size={22} /></button>

        <form className="nav-search" onSubmit={handleSubmit} ref={searchRef}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => query.trim().length >= 2 && results.length > 0 && setShowResults(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
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
                          <ShoppingBag size={20} />
                        </div>
                      )}
                      <div className="search-result-info">
                        <span className="result-name">{highlightMatch(p.name, query)}</span>
                        <span className="result-meta">
                          {p.category && <span className="result-category">{p.category}</span>}
                          {p.brand && <span className="result-brand">{p.brand}</span>}
                          <span className="result-price">${p.price?.toFixed(2)}</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to={`/products?q=${encodeURIComponent(query)}`}
                    className="search-view-all"
                    onClick={clearSearch}
                  >
                    View all results for "{query}"
                  </Link>
                </>
              ) : !searching ? (
                <div className="search-no-results">
                  <Search size={20} />
                  <span>No products found for "{query}"</span>
                </div>
              ) : null}
            </div>
          )}
        </form>
      </div>

      <div className="nav-right">
        <Link to="/cart" className="nav-icon-link nav-cart">
          <ShoppingBag size={20} />
          <span className="nav-icon-label">Cart</span>
          {cart.itemCount > 0 && <span className="cart-badge">{cart.itemCount}</span>}
        </Link>

        {isAuthenticated ? (
          <div className="nav-user" ref={userRef}>
            <button className="nav-icon-link user-btn" onClick={() => setShowUser(!showUser)}>
              <div className="user-avatar">{user?.fullName?.[0] || 'U'}</div>
              <span className="nav-icon-label">{user?.fullName?.split(' ')[0] || 'Account'}</span>
            </button>
            {showUser && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar-lg">{user?.fullName?.[0]}</div>
                  <div>
                    <p className="user-name">{user?.fullName}</p>
                    <p className="user-email">{user?.email}</p>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <Link to="/account" className="dropdown-item" onClick={() => setShowUser(false)}>Account</Link>
                <Link to="/orders" className="dropdown-item" onClick={() => setShowUser(false)}>Orders</Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setShowUser(false)}>Settings</Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item logout" onClick={() => { logout(); setShowUser(false); navigate('/'); }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-icon-link">
            <User size={20} />
            <span className="nav-icon-label">Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}