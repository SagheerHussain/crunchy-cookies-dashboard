// src/hooks/categories/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { getCategoriesLists } from "../../api/categories";

const categoriesKey = (params = {}) => ["categories", params];

export function useCategories(params = {}) {
  return useQuery({
    queryKey: categoriesKey(params),
    queryFn: () => getCategoriesLists(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    select: (payload) => {
      const items = Array.isArray(payload?.data) ? payload.data : [];

      const rows = items.map((it, idx) => ({
        id: it._id || it.id || idx,
        name: it.name || "",
        slug: it.slug || "",
        isActive: it.isActive || "",
        image: it.image || it.imageUrl || "",
      }));

      return {
        rows,
        success: payload?.success ?? true,
        message: payload?.message ?? "",
      };
    },
  });
}
