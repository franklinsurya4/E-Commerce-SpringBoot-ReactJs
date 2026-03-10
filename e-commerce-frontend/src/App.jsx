import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import "./styles/app.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      {/* 🔥 Content wrapper to avoid navbar overlap */}
      <div className="container">
        <Routes>
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="*" element={<Navigate to="/products" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
