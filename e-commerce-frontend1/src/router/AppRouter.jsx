import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Categories from "../pages/Categories";
import CategoryPage from "../pages/CategoryPage";
import ProductDetails from "../components/ProductDetails";

/* ADD THESE */
import Cart from "../pages/Cart";
import Orders from "../pages/Orders";

const AppRouter = () => (
  <Routes>

    <Route path="/" element={<Home />} />

    <Route path="/categories" element={<Categories />} />

    <Route path="/category/:categorySlug" element={<CategoryPage />} />

    <Route path="/product/:productId" element={<ProductDetails />} />

    {/* ADD THESE ROUTES */}
    <Route path="/cart" element={<Cart />} />

    <Route path="/orders" element={<Orders />} />

  </Routes>
);

export default AppRouter;