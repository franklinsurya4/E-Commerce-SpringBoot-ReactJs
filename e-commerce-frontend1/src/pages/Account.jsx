import React, { useState, useEffect } from "react";
import "../styles/Account.css";
import "../styles/Wishlist.css";
import { getMe, getOrdersByEmail } from "../api/api";
import { saveAddress, getAddressesByEmail, deleteAddress } from "../api/api";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };

// ─────────────────────────────────────────
// ADDRESS FORM
// ─────────────────────────────────────────
function AddressForm({ isLoaded, userEmail, onSaved, editData = null }) {
  const [location, setLocation] = useState(
    editData?.latitude ? { lat: editData.latitude, lng: editData.longitude } : null
  );
  const [marker, setMarker] = useState(
    editData?.latitude ? { lat: editData.latitude, lng: editData.longitude } : DEFAULT_CENTER
  );
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:    editData?.name    || "",
    phone:   editData?.phone   || "",
    street:  editData?.street  || "",
    city:    editData?.city    || "",
    state:   editData?.state   || "",
    country: editData?.country || "",
    pincode: editData?.pincode || ""
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    setLocation({ lat, lng });
  };

  const saveAddressHandler = async () => {
    if (!location) return alert("Please click on the map to select a location.");
    try {
      setSaving(true);
      const payload = { ...form, email: userEmail, latitude: location.lat, longitude: location.lng };
      if (editData?.id) {
        await saveAddress({ ...payload, id: editData.id });
      } else {
        await saveAddress(payload);
      }
      alert(editData?.id ? "Address updated!" : "Address saved!");
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      alert("Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="address-form">
      {["name", "phone", "street", "city", "state", "country", "pincode"].map((field) => (
        <input key={field} name={field}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={form[field]} onChange={handleChange}
        />
      ))}

      <h4>📍 Click on map to pin your location</h4>

      <div className="map-wrapper">
        {!isLoaded ? (
          <div style={{ width:"100%", height:"100%", display:"flex",
            alignItems:"center", justifyContent:"center", color:"#888" }}>
            ⏳ Loading map...
          </div>
        ) : (
          <GoogleMap zoom={14} center={marker}
            mapContainerStyle={{ width:"100%", height:"100%" }}
            mapTypeId="roadmap"
            options={{ zoomControl:true, streetViewControl:false,
              mapTypeControl:false, fullscreenControl:true, gestureHandling:"greedy" }}
            onClick={handleMapClick}
          >
            <Marker position={marker} />
          </GoogleMap>
        )}
      </div>

      {location ? (
        <p style={{ fontSize:"12px", color:"green", margin:"6px 0" }}>
          ✅ {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </p>
      ) : (
        <p style={{ fontSize:"12px", color:"#e55", margin:"6px 0" }}>
          ⚠️ No location selected — click on the map
        </p>
      )}

      <button onClick={saveAddressHandler} disabled={saving}>
        {saving ? "Saving..." : editData?.id ? "💾 Update Address" : "💾 Save Address"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// ADDRESS CARD
// ─────────────────────────────────────────
function AddressCard({ address, onEdit, onDelete }) {
  return (
    <div className="saved-address-card">
      <div className="saved-address-info">
        <strong>{address.name}</strong>
        <p>{address.street}, {address.city}</p>
        <p>{address.state}, {address.country} - {address.pincode}</p>
        <p>📞 {address.phone}</p>
        {address.mapLink && (
          <a href={address.mapLink} target="_blank" rel="noreferrer"
            style={{ fontSize:"12px", color:"#2563eb" }}>
            📍 View on Google Maps
          </a>
        )}
      </div>
      <div className="saved-address-actions">
        <button className="btn-edit"   onClick={() => onEdit(address)}>✏️ Edit</button>
        <button className="btn-delete" onClick={() => onDelete(address.id)}>🗑️ Delete</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// WISHLIST CARD
// ─────────────────────────────────────────
function WishlistCard({ product, onRemove }) {
  const navigate = useNavigate();
  return (
    <div className="wishlist-card">
      <img
        src={product.image || product.imageUrl || "https://via.placeholder.com/60"}
        alt={product.name}
        onClick={() => navigate(`/product/${product.id}`)}
      />
      <div className="wishlist-card-info" onClick={() => navigate(`/product/${product.id}`)}>
        <p className="wishlist-card-name">{product.name}</p>
        <p className="wishlist-card-price">₹{product.price?.toLocaleString("en-IN")}</p>
        {product.category && (
          <span className="wishlist-card-cat">{product.category}</span>
        )}
      </div>
      <button className="wishlist-card-remove" onClick={() => onRemove(product.id)}
        title="Remove from wishlist">
        ✕
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN ACCOUNT
// ─────────────────────────────────────────
export default function Account() {
  const [tab,             setTab]             = useState("overview");
  const [user,            setUser]            = useState(null);
  const [orders,          setOrders]          = useState([]);
  const [addresses,       setAddresses]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddress,     setEditAddress]     = useState(null);
  const [profileImg,      setProfileImg]      = useState(null);  // ✅

  const { wishlist, removeFromWishlist } = useWishlist();
  const token = localStorage.getItem("token");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAP_API_KEY"
  });

  // ✅ Load saved profile image
  useEffect(() => {
    if (token) {
      const saved = localStorage.getItem(`profileImg_${token}`);
      if (saved) setProfileImg(saved);
    }
  }, [token]);

  // ✅ Persist profile image
  useEffect(() => {
    if (profileImg && token) {
      localStorage.setItem(`profileImg_${token}`, profileImg);
    }
  }, [profileImg, token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const u = await getMe(token);
      setUser(u);
      const o = await getOrdersByEmail(u.email);
      setOrders(o);
      await fetchAddresses(u.email);
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || e.message || "Failed to load account");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async (email) => {
    try {
      const data = await getAddressesByEmail(email);
      setAddresses(data);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Failed to delete address.");
    }
  };

  const handleEdit = (address) => {
    setEditAddress(address);
    setShowAddressForm(true);
  };

  const handleSaved = () => {
    setShowAddressForm(false);
    setEditAddress(null);
    fetchAddresses(user.email);
  };

  useEffect(() => {
    if (!token) { setError("No token found. Please login."); setLoading(false); return; }
    fetchData();
  }, []);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible" && token) fetchData(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const delivered  = orders.filter(o => o.status === "DELIVERED").length;
  const shipped    = orders.filter(o => o.status === "SHIPPED").length;
  const active     = orders.filter(o => ["PENDING","CONFIRMED","SHIPPED"].includes(o.status)).length;
  const cancelled  = orders.filter(o => o.status === "CANCELLED").length;
  const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  if (loading) return <div className="account-center"><h3>Loading Account...</h3></div>;
  if (error)   return <div className="account-center"><p className="account-error">{error}</p><button onClick={fetchData}>Retry</button></div>;

  return (
    <div className="account-wrap">

      {/* HERO */}
      <div className="account-hero">

        {/* ✅ USER CARD — with banner + avatar + stats */}
        <div className="hero-card user-card">

          {/* ✅ Gradient banner */}
          <div className="user-card-banner" />

          <div className="user-card-body">

            {/* ✅ Avatar floats over banner */}
            <div className="account-avatar-wrap">
              <div className="account-avatar">
                {profileImg ? (
                  <img src={profileImg} alt="profile" className="account-avatar-img" />
                ) : (
                  user.username?.charAt(0).toUpperCase()
                )}
              </div>
              <label className="avatar-upload-btn" title="Upload photo">
                📷
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setProfileImg(reader.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

          {/* Info */}
          <div className="user-card-info">
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: "0" }}>
               {user.username}
            </h2>
            <p style={{ fontSize: "16px", color: "#6b7280", margin: "0" }}>
                {user.email}
            </p>
              <span className="user-card-badge">Member #{user.id}</span>
          </div>

            <div className="user-card-divider" />

            {/* Mini stats at bottom */}
            <div className="user-card-stats">
              <div className="user-card-stat">
                <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", margin: "0" }}>
                   {orders.length}
                </h4>
                 <p style={{ fontSize: "13px", color: "#9ca3af", margin: "2px 0 0" }}>Orders</p>
              </div>
              <div className="user-card-stat">
                <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#a855f7", margin: "0" }}>
                 {delivered}
                </h4>
                <p style={{ fontSize: "13px", color: "#9ca3af", margin: "2px 0 0" }}>Delivered</p>
              </div>
              <div className="user-card-stat">
                <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#f43f5e", margin: "0" }}>
                  {wishlist.length}
                </h4>
                <p style={{ fontSize: "13px", color: "#9ca3af", margin: "2px 0 0" }}>Wishlist</p>
            </div>
          </div>

          </div>
        </div>

        {/* ✅ WISHLIST CARD */}
        <div className="hero-card wishlist-hero-card">
          <div className="wishlist-hero-header">
            <h3>❤️ Wishlist <span className="wishlist-count">{wishlist.length}</span></h3>
            <button className="account-refresh-btn" onClick={fetchData}>↻ Refresh</button>
          </div>

          {wishlist.length === 0 ? (
            <p className="wishlist-empty">No items yet.<br/>
              <small>Click ❤️ on any product to save it here.</small>
            </p>
          ) : (
            <div className="wishlist-list">
              {wishlist.map(product => (
                <WishlistCard key={product.id} product={product} onRemove={removeFromWishlist} />
              ))}
            </div>
          )}
        </div>

        {/* ✅ ADDRESS CARD */}
        <div className="hero-card address-card" style={{ overflow:"visible" }}>
          <h3>Saved Addresses ({addresses.length})</h3>

          {addresses.length === 0 ? (
            <p style={{ fontSize:"13px", color:"#888" }}>No address added yet</p>
          ) : (
            addresses.map(addr => (
              <AddressCard key={addr.id} address={addr}
                onEdit={handleEdit} onDelete={handleDeleteAddress} />
            ))
          )}

          <button className="account-refresh-btn" style={{ marginTop:"10px" }}
            onClick={() => { setEditAddress(null); setShowAddressForm(!showAddressForm); }}>
            {showAddressForm ? "✕ Close" : "+ Add New Address"}
          </button>

          {showAddressForm && (
            <AddressForm isLoaded={isLoaded} userEmail={user.email}
              editData={editAddress} onSaved={handleSaved} />
          )}
        </div>

      </div>

      {/* STATS BAR */}
      <div className="account-stats-bar">
        <div className="account-stat">
          <h3>{orders.length}</h3>
          <p>Orders</p>
        </div>
        <div className="account-stat">
          <h3 className="stat-delivered">{delivered}</h3>
          <p>Delivered</p>
        </div>
        <div className="account-stat">
          <h3 className="stat-shipped">{shipped}</h3>
          <p>Shipped</p>
        </div>
        <div className="account-stat">
          <h3 className="stat-active">{active}</h3>
          <p>Active</p>
        </div>
        <div className="account-stat">
          <h3 className="stat-cancelled">{cancelled}</h3>
          <p>Cancelled</p>
        </div>
      </div>

      {/* TABS */}
      <div className="account-tabs">
        <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Overview</button>
        <button className={tab === "orders"   ? "active" : ""} onClick={() => setTab("orders")}>Orders</button>
        <button className={tab === "profile"  ? "active" : ""} onClick={() => setTab("profile")}>Profile</button>
        <button className={tab === "wishlist" ? "active" : ""} onClick={() => setTab("wishlist")}>
          ❤️ Wishlist ({wishlist.length})
        </button>
      </div>

      {/* CONTENT */}
      <div className="account-content">

        {tab === "overview" && (
          <div className="account-grid">
            <div className="overview-card">
              <p>Total Orders</p>
              <h3>{orders.length}</h3>
            </div>
            <div className="overview-card card-delivered">
              <p>Delivered</p>
              <h3>{delivered}</h3>
            </div>
            <div className="overview-card card-shipped">
              <p>Shipped</p>
              <h3>{shipped}</h3>
            </div>
            <div className="overview-card card-active">
              <p>Active</p>
              <h3>{active}</h3>
            </div>
            <div className="overview-card card-cancelled">
              <p>Cancelled</p>
              <h3>{cancelled}</h3>
            </div>
            <div className="overview-card card-spent">
              <p>Total Spent</p>
              <h3>₹{totalSpent.toLocaleString("en-IN")}</h3>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            {orders.length === 0 ? <p>No orders yet</p> : orders.map(o => (
              <div key={o.id} className="account-order-card">
                <div>
                  <p>Order #{o.id}</p>
                  <h4>{o.customerName}</h4>
                  <span className={`account-order-status account-status-${o.status?.toLowerCase()}`}>
                    {o.status}
                  </span>
                </div>
                <div>₹{o.totalAmount?.toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "profile" && (
          <div className="account-profile">
            <div className="account-info">
              <span>Member ID</span>
              <span>{user.id}</span>
            </div>
            <div className="account-info">
              <span>Username</span>
              <span>{user.username}</span>
            </div>
            <div className="account-info">
              <span>Email</span>
              <span>{user.email}</span>
            </div>
          </div>
        )}

        {tab === "wishlist" && (
          <div className="wishlist-tab-content">
            <h3 style={{ marginBottom:"20px" }}>❤️ Your Wishlist ({wishlist.length} items)</h3>
            {wishlist.length === 0 ? (
              <div className="wishlist-tab-empty">
                <span>💔</span>
                <p>Your wishlist is empty</p>
                <small>Browse products and click ❤️ to save them here</small>
              </div>
            ) : (
              <div className="wishlist-tab-grid">
                {wishlist.map(product => (
                  <WishlistCard key={product.id} product={product} onRemove={removeFromWishlist} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}