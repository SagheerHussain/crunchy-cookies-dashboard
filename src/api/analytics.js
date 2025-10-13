// src/api/categories.js
import axios from "axios";

// Build base once (no shared api instance)
const BASE = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";

// ---- 1) LIST ----
export async function getOverviewCards() {
  const res = await axios.get(`${BASE}/analytics/overview`);
  return res.data;
}
