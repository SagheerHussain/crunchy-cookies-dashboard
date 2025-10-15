// src/api/categories.js
import axios from "axios";

// Build base once (no shared api instance)
const BASE = import.meta.env.VITE_BASE_URL || "https://crunchy-cookies-server.onrender.com/api/v1";

// ---- 1) LIST ----
export async function getBrandsLists() {
  const res = await axios.get(`${BASE}/brand/lists`);
  return res.data;
}

// ---- 2) DETAIL ----
export async function getBrandById(id) {
  const res = await axios.get(`${BASE}/brand/lists/${id}`);
  return res.data?.data ?? res.data ?? {};
}

// ---- 3) CREATE ----
export async function createBrand(payload) {
  const res = await axios.post(`${BASE}/brand`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 4) UPDATE ----
export async function updateBrand(id, payload) {
  const res = await axios.put(`${BASE}/brand/update/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 5) DELETE ----
export async function deleteBrand(id) {
  const res = await axios.delete(`${BASE}/brand/delete/${id}`);
  return res.data;
}
