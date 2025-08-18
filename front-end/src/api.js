// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Correct template literal syntax using backticks
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;