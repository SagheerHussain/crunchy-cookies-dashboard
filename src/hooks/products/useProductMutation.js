// hooks/brands/useBrandsMutation.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, deleteProduct, updateProduct } from '../../api/products';

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createProduct(formData),
    retry: 0,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateProduct(id, formData),
    retry: 0,
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteProduct(id),

    // Optimistic update for instant UI feedback
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["products"] });
      const previous = qc.getQueryData(["products"]);

      qc.setQueryData(["products"], (old) => {
        if (!old) return old;
        const getId = (r) => r?.id ?? r?._id;
        return { ...old, rows: (old.rows || []).filter((r) => getId(r) !== id) };
      });

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(["products"], ctx.previous);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}