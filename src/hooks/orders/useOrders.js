// src/hooks/orders/useOrders.js
import { useQuery } from "@tanstack/react-query";
import { getOrdersLists, getOrderById } from "../../api/orders";

const orderKey = (params = {}) => ["orders", params];
const asArray = (v) => (Array.isArray(v) ? v : []);

export function useOrders(params = {}) {
  return useQuery({
    queryKey: orderKey(params),
    queryFn: () => getOrdersLists(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    select: (payload) => {
      const items = Array.isArray(payload?.data) ? payload.data : [];
      const rows = items.map((it, idx) => ({
        id: it._id || it.id || idx,
        code: it.code || "",
        user: it.user?.firstName + ' ' + it?.user?.lastName || "__",
        totalItems: it?.totalItems ?? 0,
        amount: it?.grandTotal ?? 0,
        tax: it?.taxAmount ?? 0,
        avgDiscount: it?.appliedCoupon?.value ?? 0,
        couponType: it?.appliedCoupon?.type ?? 0,
        status: it.status || "",
        cancelReason: it?.cancelReason || "",
        payment: it?.payment || "Pending",
        placedAt: it?.placedAt || "",
        deliveredAt: it?.deliveredAt || "__",
        appliedCoupon: it?.appliedCoupon || "__",
      }));

      return { rows, success: payload?.success ?? true, message: payload?.message ?? "" };
    },
  });
}

export function useOrderDetail(id) {
  return useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    select: (payload) => {
      const order = payload?.data ?? payload ?? {};
      const items = asArray(order.items);
      const coupons = asArray(order.appliedCoupon);
      const subtotal = items.reduce((sum, it) => sum + Number(it?.totalAmount || 0), 0);
      const discount = coupons.reduce((sum, c) => {
        if (!c) return sum;
        const val = Number(c.value || 0);
        return sum + (c.type === "percentage" ? (subtotal * val) / 100 : val);
      }, 0);
      const shipping = Number(order.shippingAmount || 0);
      const tax = Number(order.taxAmount || 0);
      const total =
        order.totalAmount != null
          ? Number(order.totalAmount)
          : Math.max(0, subtotal - discount + shipping + tax);

      return { ...order, _derived: { subtotal, discount, shipping, tax, total, coupons } };
    },
  });
}
