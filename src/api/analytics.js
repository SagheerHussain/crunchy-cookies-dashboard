// src/api/categories.js
import axios from "axios";

// Build base once (no shared api instance)
const BASE = import.meta.env.VITE_BASE_URL || "https://crunchy-cookies-server.onrender.com/api/v1";
// const BASE = "http://localhost:5000/api/v1";

// ---- 1) LIST ----
export async function getOverviewCards() {
  const res = await axios.get(`${BASE}/analytics/overview`);
  return res.data;
}
export async function getSales() {
  const res = await axios.get(`${BASE}/analytics/sales`);
  return res.data;
}
export async function getCounts() {
  const res = await axios.get(`${BASE}/analytics/counts`);
  return res.data;
}