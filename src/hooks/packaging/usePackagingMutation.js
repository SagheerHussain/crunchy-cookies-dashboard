// hooks/brands/useBrandsMutation.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPackaging, deletePackaging, updatePackaging } from '../../api/packaging';

export function useAddPackaging() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createPackaging(formData),
    retry: 0,                      // ⬅️ important
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packaging', 'packaging'] });
    },
  });
}

export function useUpdatePackaging() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updatePackaging(id, formData),
    retry: 0,                      // ⬅️ important
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packaging', 'packaging'] });
    },
  });
}

export function useDeletePackaging() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => deletePackaging(id),

    // Optimistic update for instant UI feedback
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["packaging"] });
      const previous = qc.getQueryData(["packaging"]);

      qc.setQueryData(["packaging"], (old) => {
        if (!old) return old;
        const getId = (r) => r?.id ?? r?._id;
        return { ...old, rows: (old.rows || []).filter((r) => getId(r) !== id) };
      });

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(["packaging"], ctx.previous);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["packaging"] });
    },
  });
}