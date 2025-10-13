// src/hooks/categories/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { getCategoryTypesLists } from "../../api/categoryTypes";

const categoriesKey = (params = {}) => ["categoryTypes", params];

export function useCategoryTypes(params = {}) {
  return useQuery({
    queryKey: categoriesKey(params),
    queryFn: () => getCategoryTypesLists(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    select: (payload) => {
      const items = Array.isArray(payload?.data) ? payload.data : [];

      const rows = items.map((it, idx) => ({
        id: it._id || it.id || idx,
        name: it.name || "",
        slug: it.slug || "",
        isActive: it.isActive || "",
        parent: it?.parent?.name || "",
        image: it?.parent?.image || "",
      }));

      return {
        rows,
        success: payload?.success ?? true,
        message: payload?.message ?? "",
      };
    },
  });
}
