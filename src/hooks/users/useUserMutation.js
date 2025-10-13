// hooks/users/useUserMutation.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '../../api/users';

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateUser(id, formData),
    retry: 0,
    onSuccess: (_data, vars) => {
      // Invalidate both the list and this user's detail
      qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === 'users' });
      qc.invalidateQueries({ queryKey: ['user', vars?.id] });
    },
  });
}
