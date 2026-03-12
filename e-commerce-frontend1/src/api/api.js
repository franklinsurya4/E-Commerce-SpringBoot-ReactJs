import axios from "axios";

const API_URL       = "http://localhost:8080/api/products";
const ORDER_API_URL = "http://localhost:8080/api";

export const placeOrder = async (orderData) => {
  const res = await axios.post(`${ORDER_API_URL}/orders`, orderData);
  return res.data;
};

// ✅ ADDED — fetch orders by email
export const getOrdersByEmail = async (email) => {
  if (!email || !email.trim()) throw new Error("Email is required");

  // ✅ encodeURIComponent fixes @ and + breaking the URL
  const encoded = encodeURIComponent(email.trim().toLowerCase());

  const res = await axios.get(`${ORDER_API_URL}/orders?email=${encoded}`);

  // ✅ always return array even if backend returns null
  return Array.isArray(res.data) ? res.data : [];
};

// ✅ ADDED — cancel order by id
export const cancelOrder = async (orderId) => {
  const res = await axios.patch(`${ORDER_API_URL}/orders/${orderId}/cancel`);
  return res.data;
};

export const getProductsByCategory = async (category) => {
  const res = await axios.get(`${API_URL}/category/${category}`);
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};