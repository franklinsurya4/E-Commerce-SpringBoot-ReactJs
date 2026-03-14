import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";   // ✅ new
import "../styles/ProductDetails.css";
import "../styles/ProductDetailsExtra.css";

/* ── Icons ── */
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const BoltIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const HeartIcon = ({ on }) => (
  <svg width="18" height="18" viewBox="0 0 24 24"
    fill={on ? "#f43f5e" : "none"}
    stroke={on ? "#f43f5e" : "#777"} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
             a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
             1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

/* ── Quick Order Modal ── */
const OrderModal = ({ product, onClose, onSuccess }) => {
  const { addOrder } = useCart();
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [err,     setErr]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !address.trim()) {
      setErr("Please fill in all fields.");
      return;
    }
    setErr("");
    setPlacing(true);
    const singleItem = [{
      id: product.id, name: product.name,
      image: product.image || product.imageUrl || "",
      price: product.price, quantity: 1,
      category: product.category || "",
    }];
    try {
      await addOrder({ name, email, address }, singleItem);
      onSuccess(email);
    } catch (error) {
      setErr(error?.response?.data?.message || error?.message || "Order failed.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="pd-modal-overlay" onClick={onClose}>
      <div className="pd-modal-box" onClick={e => e.stopPropagation()}>
        <button className="pd-modal-close" onClick={onClose}>✕</button>
        <h3 className="pd-modal-title">Quick Order</h3>
        <div className="pd-modal-product">
          <img src={product.image || product.imageUrl || "https://via.placeholder.com/60"} alt={product.name} />
          <div>
            <p className="pd-modal-pname">{product.name}</p>
            <p className="pd-modal-pprice">₹{product.price?.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <form className="pd-modal-form" onSubmit={handleSubmit}>
          <input required placeholder="Full Name"  value={name}    onChange={e => setName(e.target.value)} />
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <textarea required placeholder="Delivery Address" value={address} onChange={e => setAddress(e.target.value)} rows={2} />
          {err && <p className="pd-modal-err">{err}</p>}
          <button type="submit" className="pd-modal-submit" disabled={placing}>
            {placing ? "Placing…" : "Confirm Order →"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ── Main Component ── */
const ProductDetails = () => {
  const { productId }  = useParams();
  const navigate       = useNavigate();
  const { addToCart }  = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();  // ✅ new

  const [product,        setProduct]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [cartAdded,      setCartAdded]      = useState(false);
  const [wishToast,      setWishToast]      = useState("");   // ✅ new toast
  const [showModal,      setShowModal]      = useState(false);
  const [orderSuccess,   setOrderSuccess]   = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");

  useEffect(() => {
    setProduct(null); setLoading(true); setError(null);
    setCartAdded(false); setShowModal(false); setOrderSuccess(false);

    axios.get(`http://localhost:8080/api/products/${productId}`)
      .then(r  => setProduct(r.data))
      .catch(e => setError(e.response?.data?.message || "Product not found."))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleCart = () => {
    addToCart(product);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2400);
  };

  // ✅ Toggle wishlist and show toast
  const handleWishlist = () => {
    toggleWishlist(product);
    const msg = isWishlisted(product.id) ? "Removed from Wishlist" : "Added to Wishlist ❤️";
    setWishToast(msg);
    setTimeout(() => setWishToast(""), 2000);
  };

  const handleOrderSuccess = (email) => {
    setShowModal(false);
    setConfirmedEmail(email);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 4000);
  };

  if (loading) return (
    <div className="pd-state-box">
      <div className="pd-spinner" />
      <p>Fetching product…</p>
    </div>
  );

  if (error) return (
    <div className="pd-state-box">
      <span className="pd-state-icon">🔍</span>
      <h3>Product Not Found</h3>
      <p>{error}</p>
      <button className="pd-ghost-btn" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );

  const inStock  = product.stock > 0;
  const catLabel = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : "—";

  const attrs = [
    product.material && { k: "Material", v: product.material },
    product.purity   && { k: "Purity",   v: product.purity },
    product.offers   && { k: "Offers",   v: product.offers, green: true },
  ].filter(Boolean);

  const wished = isWishlisted(product.id);  // ✅ live state from context

  return (
    <div className="pd-page">

      {showModal && (
        <OrderModal product={product} onClose={() => setShowModal(false)} onSuccess={handleOrderSuccess} />
      )}

      {/* ✅ Wishlist toast */}
      {wishToast && (
        <div className="pd-toast pd-toast-wish">{wishToast}</div>
      )}

      {orderSuccess && (
        <div className="pd-toast pd-toast-success">
          🎉 Order placed! Confirmation sent to <strong>{confirmedEmail}</strong>
        </div>
      )}

      <div className="pd-topbar">
        <button className="pd-back-btn" onClick={() => navigate(-1)}><BackIcon /> Back</button>
        <span className="pd-crumb-sep">/</span>
        <Link to="/categories" className="pd-crumb-link">Categories</Link>
        <span className="pd-crumb-sep">/</span>
        <Link to={`/category/${product.category}`} className="pd-crumb-link">{catLabel}</Link>
        <span className="pd-crumb-sep">/</span>
        <span className="pd-crumb-current">{product.name}</span>
      </div>

      <div className="pd-wrap">
        <div className="pd-grid">

          <div className="pd-left-col">
            <span className="pd-cat-pill">{catLabel}</span>
            <h1 className="pd-title">{product.name}</h1>

            <div className="pd-stock-row">
              <div className={`pd-stock-dot ${inStock ? "in-stock" : "out-stock"}`} />
              <span className={`pd-stock-text ${inStock ? "in-stock" : "out-stock"}`}>
                {inStock ? `In Stock — ${product.stock} units` : "Out of Stock"}
              </span>
            </div>

            <div className="pd-price-row">
              <span className="pd-price-tag">₹{product.price?.toLocaleString("en-IN")}</span>
              <span className="pd-price-note">incl. all taxes</span>
            </div>

            <hr className="pd-divider" />

            {(attrs.length > 0 || product.variants?.length > 0 || product.sizes?.length > 0) && (
              <div className="pd-attr-box">
                {attrs.map((a) => (
                  <div key={a.k} className="pd-attr-row">
                    <span className="pd-attr-key">{a.k}</span>
                    <span className={`pd-attr-val ${a.green ? "green" : ""}`}>{a.v}</span>
                  </div>
                ))}
                {product.variants?.length > 0 && (
                  <div className="pd-attr-row">
                    <span className="pd-attr-key">Variants</span>
                    <div className="pd-chips">
                      {product.variants.map(v => <span key={v} className="pd-chip">{v}</span>)}
                    </div>
                  </div>
                )}
                {product.sizes?.length > 0 && (
                  <div className="pd-attr-row">
                    <span className="pd-attr-key">Sizes</span>
                    <div className="pd-chips">
                      {product.sizes.map(s => <span key={s} className="pd-chip">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <hr className="pd-divider" />

            <div className="pd-btn-stack">
              <div className="pd-btn-row">
                <button className={`pd-cart-btn ${cartAdded ? "added" : ""}`}
                  onClick={handleCart} disabled={!inStock}>
                  <CartIcon />
                  {cartAdded ? "Added to Cart ✓" : "Add to Cart"}
                </button>

                {/* ✅ Heart button now connected to WishlistContext */}
                <button
                  className={`pd-wish-btn ${wished ? "active" : ""}`}
                  onClick={handleWishlist}
                  title={wished ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <HeartIcon on={wished} />
                </button>
              </div>

              <button className="pd-order-btn" onClick={() => setShowModal(true)} disabled={!inStock}>
                <BoltIcon /> Order Now
              </button>
            </div>

            <Link to={`/category/${product.category}`} className="pd-more-link">
              ← More {catLabel} products
            </Link>
          </div>

          <div className="pd-right-col">
            <div className="pd-img-card">
              <img
                src={product.image || product.imageUrl || "https://via.placeholder.com/600x480?text=No+Image"}
                alt={product.name}
              />
              <div className="pd-img-grad" />
              <div className="pd-price-badge">₹{product.price?.toLocaleString("en-IN")}</div>
              {!inStock && (
                <div className="pd-oos-overlay">
                  <span className="pd-oos-pill">OUT OF STOCK</span>
                </div>
              )}
            </div>
            <p className="pd-product-id">PRODUCT #{product.id}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;