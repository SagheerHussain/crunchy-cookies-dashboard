// src/hooks/categories/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { getBrandsLists } from "../../api/brands";

const categoriesKey = (params = {}) => ["brands", params];

export function useBrands(params = {}) {
  return useQuery({
    queryKey: categoriesKey(params),
    queryFn: () => getBrandsLists(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    select: (payload) => {
      const items = Array.isArray(payload?.data) ? payload.data : [];

      const rows = items.map((it, idx) => ({
        id: it._id || it.id || idx,
        name: it.name || "",
        slug: it.slug || "",
        isActive: it.isActive || "",
        logo: it?.logo || "",
        countryCode: it?.countryCode || "",
      }));

      return {
        rows,
        success: payload?.success ?? true,
        message: payload?.message ?? "",
      };
    },
  });
}
