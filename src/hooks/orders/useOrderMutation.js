// src/hooks/orders/useOrderMutation.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, deleteOrder, updateOrder } from '../../api/orders';

export function useAddOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createOrder(formData),
    retry: 0,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'], exact: false });
      qc.invalidateQueries({ queryKey: ['order-detail'], exact: false });
    },
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateOrder(id, formData),
    retry: 0,

    onMutate: async ({ id, formData }) => {
      await qc.cancelQueries({ queryKey: ['orders'], exact: false });

      // snapshot all orders queries
      const snapshots = qc.getQueriesData({ queryKey: ['orders'] });

      // patch helper maps API fields -> our row shape
      const patchRow = (row) => {
        const rowId = row.id ?? row._id;
        if (rowId !== id) return row;

        return {
          ...row,
          ...(formData.status       != null ? { status: formData.status } : {}),
          ...(formData.payment      != null ? { payment: String(formData.payment).toLowerCase() } : {}),
          ...(formData.totalAmount  != null ? { amount: formData.totalAmount } : {}),
          ...(formData.taxAmount    != null ? { tax: formData.taxAmount } : {}),
          ...(formData.totalItems   != null ? { totalItems: formData.totalItems } : {}),
        };
      };

      snapshots.forEach(([key, data]) => {
        if (!data) return;
        qc.setQueryData(key, (old) => {
          if (!old) return old;
          return { ...old, rows: (old.rows || []).map(patchRow) };
        });
      });

      return { snapshots };
    },

    onError: (_err, _vars, ctx) => {
      // rollback
      ctx?.snapshots?.forEach(([key, data]) => qc.setQueryData(key, data));
    },

    onSettled: () => {
      // refetch all orders & any order-detail
      qc.invalidateQueries({ queryKey: ['orders'], exact: false });
      qc.invalidateQueries({ queryKey: ['order-detail'], exact: false });
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteOrder(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['orders'], exact: false });
      const snapshots = qc.getQueriesData({ queryKey: ['orders'] });
      snapshots.forEach(([key]) => {
        qc.setQueryData(key, (old) => {
          if (!old) return old;
          const getId = (r) => r?.id ?? r?._id;
          return { ...old, rows: (old.rows || []).filter((r) => getId(r) !== id) };
        });
      });
      return { snapshots };
    },
    onError: (_e, _id, ctx) => {
      ctx?.snapshots?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['orders'], exact: false });
      qc.invalidateQueries({ queryKey: ['order-detail'], exact: false });
    },
  });
}
