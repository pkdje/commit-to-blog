import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Draft } from 'shared';
import { apiFetch } from '../lib/api';

type PublishDraftInput = {
  id: string;
  targetRepo?: string;
  path?: string;
};

export function usePublishDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: PublishDraftInput) =>
      apiFetch<Draft>(`/api/drafts/${id}/publish`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: (published) => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.setQueryData(['drafts', published.id], published);
    },
  });
}
