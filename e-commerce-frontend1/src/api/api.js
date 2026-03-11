import axios from "axios";

const API_URL = "http://localhost:8080/api/products";

export const getProductsByCategory = async (category) => {
  const res = await axios.get(`${API_URL}/category/${category}`);
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};