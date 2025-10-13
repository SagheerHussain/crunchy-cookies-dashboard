// src/api/users.js
import axios from "axios";
const BASE = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";

export async function getUsersLists() {
  const res = await axios.get(`${BASE}/user/lists`);
  return res.data;
}

export async function getUserById(id) {
  // If your backend uses /user/:id, change this line to: `${BASE}/user/${id}`
  const res = await axios.get(`${BASE}/user/lists/${id}`);
  // Normalize to { ...userFields }
  return res.data?.data ?? res.data ?? {};
}

export async function createUser(payload) {
  const res = await axios.post(`${BASE}/user`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function updateUser(id, payload) {
  const res = await axios.put(`${BASE}/user/update/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function deleteUser(id) {
  const res = await axios.delete(`${BASE}/user/delete/${id}`);
  return res.data;
}
