import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // API Gateway ONLY
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // fail fast (Black Friday ready)
});

export default api;
