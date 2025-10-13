// src/api/categories.js
import axios from "axios";

// Build base once (no shared api instance)
const BASE = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";

// ---- 1) LIST ----
export async function getSubCategoriesLists() {
  const res = await axios.get(`${BASE}/subCategory/lists`);
  console.log("response", res.data);
  return res.data;
}

// ---- 2) DETAIL ----
export async function getSubCategoryById(id) {
  const res = await axios.get(`${BASE}/subCategory/lists/${id}`);
  return res.data?.data ?? res.data ?? {};
}

// ---- 3) CREATE ----
export async function createSubCategory(payload) {
  const res = await axios.post(`${BASE}/subCategory`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 4) UPDATE ----
export async function updateSubCategory(id, payload) {
  console.log("payload", id, payload);
  const res = await axios.put(`${BASE}/subCategory/update/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 5) DELETE ----
export async function deleteSubCategory(id) {
  const res = await axios.delete(`${BASE}/subCategory/delete/${id}`);
  return res.data;
}
