// src/hooks/categories/useCategoryMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategoryType, updateCategoryType, deleteCategoryType } from "../../api/categoryTypes";

const categoriesKey = (params = {}) => ["categoryTypes", params];

export function useAddCategoryType(params = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createCategoryType(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey(params) });
    },
  });
}

export function useUpdateCategoryType(id, params = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateCategoryType(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey(params) });
      qc.invalidateQueries({ queryKey: ["categoryType", id] });
    },
  });
}

export function useDeleteCategoryType(params = {}) {
  const qc = useQueryClient();
  return useMutation({
    // id is passed when calling mutate/mutateAsync
    mutationFn: (id) => deleteCategoryType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKey(params) }),
  });
}
