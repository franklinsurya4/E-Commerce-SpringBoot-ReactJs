import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProductsByCategory } from "../api/api";
import "../styles/CategoryPage.css";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductsByCategory(categorySlug);
        setProducts(data);
        console.log("Products fetched:", data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categorySlug]);

  if (loading) return <p>Loading products...</p>;
  if (!products.length) return <p>No products found in {categorySlug}</p>;

  return (
    <div className="category-products">

      {/* ── Back btn left, Title centered ── */}
      <div className="cp-header-row">
        <Link to="/categories" className="cp-back-btn">
          ← Back
        </Link>
        <h2 className="cp-title">{categorySlug.toUpperCase()}</h2>
        <div className="cp-header-spacer" />
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="product-card"
          >
            <img
              src={product.image || "https://via.placeholder.com/150"}
              alt={product.name}
            />
            <h4>{product.name}</h4>
            <p>₹{product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;