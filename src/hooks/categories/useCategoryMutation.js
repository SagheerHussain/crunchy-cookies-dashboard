// src/hooks/categories/useCategoryMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory, updateCategory, deleteCategory } from "../../api/categories";

const categoriesKey = (params = {}) => ["categories", params];

export function useAddCategory(params = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createCategory(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey(params) });
    },
  });
}

export function useUpdateCategory(id, params = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateCategory(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey(params) });
      qc.invalidateQueries({ queryKey: ["category", id] });
    },
  });
}

export function useDeleteCategory(params = {}) {
  const qc = useQueryClient();
  return useMutation({
    // id is passed when calling mutate/mutateAsync
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKey(params) }),
  });
}
