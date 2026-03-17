import React, { useState, useEffect } from "react";

import StoreSettings from "../components/settings/StoreSettings";
import PaymentSettings from "../components/settings/PaymentSettings";
import ShippingSettings from "../components/settings/ShippingSettings";
import TaxSettings from "../components/settings/TaxSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import SecuritySettings from "../components/settings/SecuritySettings";
import AppearanceSettings from "../components/settings/AppearenceSettings";
import SEOSettings from "../components/settings/SEOSettings";
import FeatureSettings from "../components/settings/FeatureSettings";
import SystemSettings from "../components/settings/SystemSettings";
import EmailSettings from "../components/settings/EmailSettings";
import AnalyticsSettings from "../components/settings/AnalyticsSettings";

import { getOrdersByEmail, getMe } from "../api/api";
import "../styles/settings.css";

export default function SettingsPage() {
  const [tab, setTab] = useState("store");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const user = await getMe(token);
        const userOrders = await getOrdersByEmail(user.email);
        setOrders(userOrders);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  return (
    <div className="settings-layout">
      <h2 className="settings-title">SETTINGS</h2>

      {/* Top navbar */}
      <div className="settings-navbar">
        <ul className="settings-tabs">
          <li className={tab === "store" ? "active" : ""} onClick={() => setTab("store")}>Store</li>
          <li className={tab === "payment" ? "active" : ""} onClick={() => setTab("payment")}>Payments</li>
          <li className={tab === "shipping" ? "active" : ""} onClick={() => setTab("shipping")}>Shipping</li>
          <li className={tab === "tax" ? "active" : ""} onClick={() => setTab("tax")}>Taxes</li>
          <li className={tab === "notification" ? "active" : ""} onClick={() => setTab("notification")}>Notifications</li>
          <li className={tab === "security" ? "active" : ""} onClick={() => setTab("security")}>Security</li>
          <li className={tab === "appearance" ? "active" : ""} onClick={() => setTab("appearance")}>Appearance</li>
          <li className={tab === "seo" ? "active" : ""} onClick={() => setTab("seo")}>SEO</li>
          <li className={tab === "features" ? "active" : ""} onClick={() => setTab("features")}>Features</li>
          <li className={tab === "system" ? "active" : ""} onClick={() => setTab("system")}>System</li>
          <li className={tab === "analytics" ? "active" : ""} onClick={() => setTab("analytics")}>Analytics</li>
        </ul>
      </div>

      {/* Content */}
      <div className="settings-content">
        {loading && <p>Loading orders...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            {tab === "store" && <StoreSettings />}
            {tab === "payment" && <PaymentSettings />}
            {tab === "shipping" && <ShippingSettings />}
            {tab === "tax" && <TaxSettings />}
            {tab === "notification" && <NotificationSettings />}
            {tab === "security" && <SecuritySettings />}
            {tab === "appearance" && <AppearanceSettings />}
            {tab === "seo" && <SEOSettings />}
            {tab === "features" && <FeatureSettings />}
            {tab === "system" && <SystemSettings />}
            {tab === "email" && <EmailSettings />}
            {tab === "analytics" && <AnalyticsSettings orders={orders} />}
          </>
        )}
      </div>
    </div>
  );
}