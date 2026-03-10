import { useEffect, useState } from "react";
import { getAllProducts } from "../services/productService";
import { getCart, saveCart } from "../utils/cartUtils";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    getAllProducts()
      .then(res => setProducts(res.data))
      .catch(() => alert("Product service unavailable"));
  }, []);

  const addToCart = (product) => {
    const cart = getCart();
    cart.push({ ...product, quantity: 1 });
    saveCart(cart);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 800);
  };

  return (
    <div className="container">
      <h2>Products</h2>

      <div className="grid">
        {products.map(p => (
          <div className="card" key={p.id}>
            <h4>{p.name}</h4>
            <p>{p.description}</p>
            <p className="price">₹{p.price}</p>

            <button onClick={() => addToCart(p)}>
              {addedId === p.id ? "✔ Added" : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
