// src/api/categories.js
import axios from "axios";

// Build base once (no shared api instance)
const BASE = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";

// ---- 1) LIST ----
export async function getPackagingLists() {
  const res = await axios.get(`${BASE}/packaging/lists`);
  return res.data;
}

// ---- 2) DETAIL ----
export async function getPackagingById(id) {
  const res = await axios.get(`${BASE}/packaging/lists/${id}`);
  return res.data?.data ?? res.data ?? {};
}

// ---- 3) CREATE ----
export async function createPackaging(payload) {
  const res = await axios.post(`${BASE}/packaging`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// ---- 4) UPDATE ----
export async function updatePackaging(id, payload) {
  const res = await axios.put(`${BASE}/packaging/update/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// ---- 5) DELETE ----
export async function deletePackaging(id) {
  const res = await axios.delete(`${BASE}/packaging/delete/${id}`);
  return res.data;
}
