// src/api/orders.js
import axios from "axios";

const BASE = 'http://localhost:5000/api/v1';

// ---- 1) LIST ----
export async function getOrdersLists(params = {}) {
  const res = await axios.get(`${BASE}/orders/lists`, { params }); // <-- status/from/to
  return res.data;
}
export async function getOrdersListsByUser(id) {
  const res = await axios.get(`${BASE}/orders/lists/user/${id}`);
  return res.data;
}

// ---- 2) DETAIL ----
export async function getOrderById(id) {
  const res = await axios.get(`${BASE}/orders/lists/${id}`);
  return res.data?.data ?? res.data ?? {};
}

// ---- 3) CREATE ----
export async function createOrder(payload) {
  const res = await axios.post(`${BASE}/orders`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// ---- 4) UPDATE ----
export async function updateOrder(id, payload) {
  const res = await axios.put(`${BASE}/orders/update/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// ---- 5) DELETE ----
export async function deleteOrder(id) {
  const res = await axios.delete(`${BASE}/orders/delete/${id}`);
  return res.data;
}
