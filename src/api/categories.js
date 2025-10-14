// src/api/categories.js
import axios from "axios";

// Build base once (no shared api instance)
const BASE = import.meta.env.VITE_BASE_URL || "https://crunchy-cookies-server.onrender.com/api/v1";

// ---- 1) LIST ----
export async function getCategoriesLists() {
  const res = await axios.get(`${BASE}/category/lists`);
  console.log("response", res.data);
  return res.data;
}

// ---- 2) DETAIL ----
export async function getCategoryById(id) {
  const res = await axios.get(`${BASE}/category/lists/${id}`);
  return res.data?.data ?? res.data ?? {};
}

// ---- 3) CREATE ----
export async function createCategory(payload) {
  const res = await axios.post(`${BASE}/category`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 4) UPDATE ----
export async function updateCategory(id, payload) {
  console.log("payload", id, payload);
  const res = await axios.put(`${BASE}/category/update/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 5) DELETE ----
export async function deleteCategory(id) {
  const res = await axios.delete(`${BASE}/category/delete/${id}`);
  return res.data;
}
