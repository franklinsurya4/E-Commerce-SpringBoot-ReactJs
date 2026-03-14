import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { CartProvider }     from "./context/CartContext";
import { AuthProvider }     from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";  // ✅ add

import "./styles/theme.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider> 
          <App />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);