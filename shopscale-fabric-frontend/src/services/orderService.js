import axios from "axios";

const API_GATEWAY_URL = "http://localhost:8080/api/order";

export const placeOrder = (orderRequest) => {
  return axios.post(API_GATEWAY_URL, orderRequest, {
    headers: {
      "Content-Type": "application/json"
    }
  });
};

// ✅ ADD THIS
export const getOrders = () => {
  return axios.get(`${API_BASE_URL}/api/order`);
};
