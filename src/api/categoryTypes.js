// src/api/categories.js
import axios from "axios";

// Build base once (no shared api instance)
const BASE = import.meta.env.VITE_BASE_URL || "https://crunchy-cookies-server.onrender.com/api/v1";

// ---- 1) LIST ----
export async function getCategoryTypesLists() {
  const res = await axios.get(`${BASE}/categoryType/lists`);
  console.log("response", res.data);
  return res.data;
}

// ---- 2) DETAIL ----
export async function getCategoryTypeById(id) {
  const res = await axios.get(`${BASE}/categoryType/lists/${id}`);
  return res.data?.data ?? res.data ?? {};
}

// ---- 3) CREATE ----
export async function createCategoryType(payload) {
  const res = await axios.post(`${BASE}/categoryType`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// ---- 4) UPDATE ----
export async function updateCategoryType(id, payload) {
  console.log("payload", id, payload);
  const res = await axios.put(`${BASE}/categoryType/update/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// ---- 5) DELETE ----
export async function deleteCategoryType(id) {
  const res = await axios.delete(`${BASE}/categoryType/delete/${id}`);
  return res.data;
}
