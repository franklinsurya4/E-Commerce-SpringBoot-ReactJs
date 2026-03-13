import axios from "axios";

const API_URL       = "http://localhost:8080/api/products";
const ORDER_API_URL = "http://localhost:8080/api";
const AUTH_API      = "http://localhost:8080/auth";

// ── Auth ──────────────────────────────────────────────
export const loginUser  = (data) => axios.post(`${AUTH_API}/login`,  data);
export const signupUser = (data) => axios.post(`${AUTH_API}/signin`, data);

export const getMe = async (token) => {
  const res = await axios.get(`${AUTH_API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ── Orders ────────────────────────────────────────────
export const placeOrder = async (orderData) => {
  const res = await axios.post(`${ORDER_API_URL}/orders`, orderData);
  return res.data;
};

export const markAsDelivered = async (orderId) => {
  const res = await axios.patch(`${ORDER_API_URL}/orders/${orderId}/deliver`);
  return res.data;
};

export const markAsShipped = async (orderId) => {               // ✅ NEW
  const res = await axios.patch(`${ORDER_API_URL}/orders/${orderId}/ship`);
  return res.data;
};
 

export const getOrdersByEmail = async (email) => {
  if (!email || !email.trim()) throw new Error("Email is required");

  const encoded = encodeURIComponent(email.trim());
  const res = await axios.get(`${ORDER_API_URL}/orders?email=${encoded}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const cancelOrder = async (orderId) => {
  const res = await axios.patch(`${ORDER_API_URL}/orders/${orderId}/cancel`);
  return res.data;
};

// ── Products ──────────────────────────────────────────
export const getProductsByCategory = async (category) => {
  const res = await axios.get(`${API_URL}/category/${category}`);
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};