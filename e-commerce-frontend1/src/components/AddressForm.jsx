import { saveAddress, getAddressesByEmail, deleteAddress } from "../api/api";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useState } from "react";

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };

function AddressForm({ isLoaded, userEmail, onSaved }) {
  const [location, setLocation] = useState(null);
  const [marker,   setMarker]   = useState(DEFAULT_CENTER);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", street: "",
    city: "", state: "", country: "", pincode: ""
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    setLocation({ lat, lng });
  };

  // ✅ Fixed: uses saveAddress from api.js — no raw axios
  const saveAddressHandler = async () => {
    if (!location) return alert("Please click on the map to select a location first.");
    try {
      setSaving(true);
      await saveAddress({
        ...form,
        email:     userEmail,
        latitude:  location.lat,
        longitude: location.lng
      });
      alert("Address saved successfully!");
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
        <input
          key={field}
          name={field}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={form[field]}
          onChange={handleChange}
        />
      ))}

      <h4>📍 Click on the map to pin your location</h4>

      {/* ✅ Fixed px height — prevents gray map */}
      <div className="map-wrapper">
        {!isLoaded ? (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center",
            justifyContent: "center", color: "#888", fontSize: "14px"
          }}>
            ⏳ Loading map...
          </div>
        ) : (
          <GoogleMap
            zoom={14}
            center={DEFAULT_CENTER}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            mapTypeId="roadmap"
            options={{
              zoomControl:       true,
              streetViewControl: false,
              mapTypeControl:    false,
              fullscreenControl: true,
              gestureHandling:   "greedy"
            }}
            onClick={handleMapClick}
          >
            <Marker position={marker} />
          </GoogleMap>
        )}
      </div>

      {/* ✅ Location status */}
      {location ? (
        <p style={{ fontSize: "12px", color: "green", margin: "6px 0" }}>
          ✅ Location pinned: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </p>
      ) : (
        <p style={{ fontSize: "12px", color: "#e55", margin: "6px 0" }}>
          ⚠️ No location selected — click anywhere on the map
        </p>
      )}

      <button onClick={saveAddressHandler} disabled={saving}>
        {saving ? "Saving..." : "💾 Save Address"}
      </button>

    </div>
  );
}