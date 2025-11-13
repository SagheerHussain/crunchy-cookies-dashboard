// src/hooks/categories/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { getProductsLists, getProductNames } from "../../api/products";
const productsKey = (params = {}) => ["products", params];

export function useProducts(params = {}) {
  return useQuery({
    queryKey: productsKey(params),
    queryFn: () => getProductsLists(params), // params may contain: stockStatus, from, to, q, page, limit...
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    select: (payload) => {
      const items = Array.isArray(payload?.data) ? payload.data : [];

      const rows = items.map((it, idx) => ({
        id: it._id || it.id || idx,
        featuredImage: it?.featuredImage || "",
        title: it.title || "",
        description: it.description || "",
        price: it.price || "",
        sku: it.sku || "",
        remainingStocks: it?.remainingStocks || "",
        stockStatus: it?.stockStatus || "",
        createdAt: it?.createdAt || "",
      }));

      return {
        rows,
        success: payload?.success ?? true,
        message: payload?.message ?? "",
      };
    },
  });
}

export function useProductNames() {
  return useQuery({
    queryKey: ["productNames"],
    queryFn: () => getProductNames(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    select: (payload) => {
      const items = Array.isArray(payload?.data) ? payload.data : [];
      // API returns: [{ _id, title }]
      const rows = items.map((it) => ({
        _id: it._id,           // <-- use _id consistently
        name: it.title || "",  // <-- label field used by getLabel()
      }));
      return {
        rows,
        success: payload?.success ?? true,
        message: payload?.message ?? "",
      };
    },
  });
}