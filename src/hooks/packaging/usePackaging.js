// src/hooks/categories/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { getPackagingLists } from "../../api/packaging";

const packagingKey = (params = {}) => ["packaging", params];

export function usePackaging(params = {}) {
  return useQuery({
    queryKey: packagingKey(params),
    queryFn: () => getPackagingLists(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    select: (payload) => {
      const items = Array.isArray(payload?.data) ? payload.data : [];

      const rows = items.map((it, idx) => ({
        id: it._id || it.id || idx,
        name: it.name || "",
        slug: it.slug || "",
        materials: it.materials || "",
        isActive: it.isActive || "",
        image: it?.image || "",
      }));

      return {
        rows,
        success: payload?.success ?? true,
        message: payload?.message ?? "",
      };
    },
  });
}
