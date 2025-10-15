// hooks/analytics/useCurrentYearOrder.js
import { useEffect, useState } from "react";

export default function useCurrentYearOrder() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let aborted = false;

    const base =
      (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, ""); // remove trailing slash
    const url = `http://localhost:5000/api/v1/analytics/current-year-order`;

    const load = async () => {
      try {
        const res = await fetch(url, {
          cache: "no-store",
          headers: { "Cache-Control": "no-store" }
        });
        if (!res.ok) throw new Error("Request failed");
        const json = await res.json();
        const monthly = Array.isArray(json?.monthly) ? json.monthly : [];
        // ensure exactly 12 values (Jan..Dec)
        const values = monthly.map((m) => Number(m?.orders || 0));
        if (!aborted) setOrders(values);
      } catch (e) {
        if (!aborted) setOrders(Array(12).fill(0));
        console.error("current-year-order error:", e);
      }
    };

    load();
    return () => { aborted = true; };
  }, []);

  return orders; // [ordersJan, ordersFeb, ... ordersDec]
}
