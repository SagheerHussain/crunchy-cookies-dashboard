// src/api/categories.js
import axios from "axios";

// Build base once (no shared api instance)
const BASE = import.meta.env.VITE_BASE_URL || "https://crunchy-cookies-server.onrender.com/api/v1";

// ---- 1) LIST ----
export async function getOccasionsLists() {
  const res = await axios.get(`${BASE}/occasion/lists`);
  return res.data;
}

// ---- 2) DETAIL ----
export async function getOccasionById(id) {
  const res = await axios.get(`${BASE}/occasion/lists/${id}`);
  return res.data?.data ?? res.data ?? {};
}

// ---- 3) CREATE ----
export async function createOccasion(payload) {
  const res = await axios.post(`${BASE}/occasion`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 4) UPDATE ----
export async function updateOccasion(id, payload) {
  const res = await axios.put(`${BASE}/occasion/update/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 5) DELETE ----
export async function deleteOccasion(id) {
  const res = await axios.delete(`${BASE}/occasion/delete/${id}`);
  return res.data;
}
