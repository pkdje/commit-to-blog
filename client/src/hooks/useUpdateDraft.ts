import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Draft } from 'shared';
import { apiFetch } from '../lib/api';

type UpdateDraftPatch = {
  title?: string;
  summary?: string;
  body?: string;
};

export function useUpdateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateDraftPatch }) =>
      apiFetch<Draft>(`/api/drafts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.setQueryData(['drafts', updated.id], updated);
    },
  });
}
