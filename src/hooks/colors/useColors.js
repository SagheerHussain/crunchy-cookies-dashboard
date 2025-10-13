// src/hooks/categories/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { getColorsLists } from "../../api/colors";

const colorsKey = (params = {}) => ["colors", params];

export function useColors(params = {}) {
  return useQuery({
    queryKey: colorsKey(params),
    queryFn: () => getColorsLists(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    select: (payload) => {
      const items = Array.isArray(payload?.data) ? payload.data : [];

      const rows = items.map((it, idx) => ({
        id: it._id || it.id || idx,
        name: it.name || "",
        slug: it?.image || "",
        mode: it.mode || "",
        value: it.value || "",
        isActive: it.isActive || "",
      }));

      return {
        rows,
        success: payload?.success ?? true,
        message: payload?.message ?? "",
      };
    },
  });
}
