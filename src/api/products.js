// src/api/categories.js
import axios from "axios";

// Build base once (no shared api instance)
const BASE = import.meta.env.VITE_BASE_URL || "https://crunchy-cookies-server.onrender.com/api/v1";

// ---- 1) LIST ----
export async function getProductsLists(params = {}) {
  // accepts: { stockStatus?, from?, to?, page?, limit? }
  const res = await axios.get(`${BASE}/product/lists`, { params });
  return res.data;
}

// ---- 2) NAMES ----
export async function getProductNames() {
  const res = await axios.get(`${BASE}/product/names`);
  return res.data;
}

// ---- 2) DETAIL ----
export async function getProductById(id) {
  const res = await axios.get(`${BASE}/product/lists/${id}`);
  return res.data?.data ?? res.data ?? {};
}

// ---- 3) CREATE ----
export async function createProduct(payload) {
  const res = await axios.post(`${BASE}/product`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 4) UPDATE ----
export async function updateProduct(id, payload) {
  const res = await axios.put(`${BASE}/product/update/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 5) DELETE ----
export async function deleteProduct(id) {
  const res = await axios.delete(`${BASE}/product/delete/${id}`);
  return res.data;
}
