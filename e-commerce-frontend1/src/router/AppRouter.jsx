import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Categories from "../pages/Categories";
import CategoryPage from "../pages/CategoryPage";
import ProductDetails from "../components/ProductDetails";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} /> {/* Home page, maybe a welcome message */}
    <Route path="/categories" element={<Categories />} /> {/* Categories page for navbar link */}
    <Route path="/category/:categorySlug" element={<CategoryPage />} />
    <Route path="/product/:productId" element={<ProductDetails />} />
  </Routes>
);

export default AppRouter;