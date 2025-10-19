// src/hooks/categories/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { getOccasionsLists } from "../../api/occasions";

const occasionsKey = (params = {}) => ["occasions", params];

export function useOccasions(params = {}) {
  return useQuery({
    queryKey: occasionsKey(params),
    queryFn: () => getOccasionsLists(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    select: (payload) => {
      const items = Array.isArray(payload?.data) ? payload.data : [];

      const rows = items.map((it, idx) => ({
        id: it._id || it.id || idx,
        name: it.name || "",
        ar_name: it.ar_name || "",
        slug: it.slug || "",
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
