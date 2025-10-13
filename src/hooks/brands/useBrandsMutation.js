// hooks/brands/useBrandsMutation.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrand, deleteBrand, updateBrand } from '../../api/brands';

export function useAddBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createBrand(formData),
    retry: 0,                      // ⬅️ important
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateBrand(id, formData),
    retry: 0,                      // ⬅️ important
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteBrand(id),
    retry: 0,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brands'] }),
  });
}
