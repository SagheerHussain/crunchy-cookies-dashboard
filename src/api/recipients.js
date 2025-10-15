// src/api/categories.js
import axios from "axios";

// Build base once (no shared api instance)
const BASE = import.meta.env.VITE_BASE_URL || "https://crunchy-cookies-server.onrender.com/api/v1";
// const BASE = "http://localhost:5000/api/v1";

// ---- 1) LIST ----
export async function getRecipientLists() {
  const res = await axios.get(`${BASE}/recipient/lists`);
  return res.data;
}

// ---- 2) DETAIL ----
export async function getRecipientById(id) {
  const res = await axios.get(`${BASE}/recipient/lists/${id}`);
  return res.data?.data ?? res.data ?? {};
}

// ---- 3) CREATE ----
export async function createRecipient(payload) {
  const res = await axios.post(`${BASE}/recipient`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 4) UPDATE ----
export async function updateRecipient(id, payload) {
  const res = await axios.put(`${BASE}/recipient/update/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ---- 5) DELETE ----
export async function deleteRecipient(id) {
  const res = await axios.delete(`${BASE}/recipient/delete/${id}`);
  return res.data;
}
