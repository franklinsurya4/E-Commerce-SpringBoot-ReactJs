import api from "../api/api";

export const getAllProducts = () => {
  return api.get("/api/product");
};
