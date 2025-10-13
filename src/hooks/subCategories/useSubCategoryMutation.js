// src/hooks/categories/useCategoryMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSubCategory, updateSubCategory, deleteSubCategory } from "../../api/subCategories";

const categoriesKey = (params = {}) => ["subCategories", params];

export function useAddSubCategory(params = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createSubCategory(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey(params) });
    },
  });
}

export function useUpdateSubCategory(id, params = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateSubCategory(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey(params) });
      qc.invalidateQueries({ queryKey: ["subCategory", id] });
    },
  });
}

export function useDeleteSubCategory(params = {}) {
  const qc = useQueryClient();
  return useMutation({
    // id is passed when calling mutate/mutateAsync
    mutationFn: (id) => deleteSubCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKey(params) }),
  });
}
