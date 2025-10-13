import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createColors as createColorApi,
  updateColors as updateColorApi,
  deleteColor as deleteColorApi,
} from "../../api/colors";

const getId = (x) => x?.id ?? x?._id;

export function useAddColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createColorApi(payload),
    onSuccess: (created) => {
      // instant add
      qc.setQueryData(["colors", {}], (old) => {
        if (!old) return old;
        const rows = Array.isArray(old.rows) ? old.rows : [];
        const without = rows.filter((r) => getId(r) !== getId(created));
        return { ...old, rows: [created, ...without] };
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["colors"] });
    },
    retry: 0,
  });
}

export function useUpdateColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateColorApi(id, payload),
    onSuccess: (updated, { id }) => {
      qc.setQueryData(["colors", {}], (old) => {
        if (!old) return old;
        const rows = Array.isArray(old.rows) ? old.rows : [];
        return {
          ...old,
          rows: rows.map((r) => (getId(r) === getId(updated) ? { ...r, ...updated } : r)),
        };
      });
      qc.invalidateQueries({ queryKey: ["color", id] });
    },
    onSettled: (_res, _err, { id }) => {
      qc.invalidateQueries({ queryKey: ["colors"] });
      qc.invalidateQueries({ queryKey: ["color", id] });
    },
    retry: 0,
  });
}

export function useDeleteColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteColorApi(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["colors"] });
      const previous = qc.getQueryData(["colors", {}]);
      qc.setQueryData(["colors", {}], (old) => {
        if (!old) return old;
        const rows = Array.isArray(old.rows) ? old.rows : [];
        return { ...old, rows: rows.filter((r) => getId(r) !== id) };
      });
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(["colors", {}], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["colors"] });
    },
    retry: 0,
  });
}
