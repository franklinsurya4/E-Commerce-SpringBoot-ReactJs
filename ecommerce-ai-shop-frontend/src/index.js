import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App';

// i18n must be imported before App so translations are ready
import './i18n/i18n';

import './styles/global.css';
import './styles/CheckOut.css';
import './styles/theme.css';
import './styles/components.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#151825',
              color: '#f0f2f8',
              border: '1px solid #1e2235',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontFamily: 'Outfit, sans-serif',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);