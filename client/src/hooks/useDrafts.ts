import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Draft } from 'shared';
import { apiFetch } from '../lib/api';

export function useDrafts() {
  return useQuery({
    queryKey: ['drafts'],
    queryFn: () => apiFetch<Draft[]>('/api/drafts'),
  });
}

export function useDraft(id: string | null | undefined) {
  return useQuery({
    queryKey: ['drafts', id],
    queryFn: () => apiFetch<Draft>(`/api/drafts/${id}`),
    enabled: Boolean(id),
  });
}

export function useDeleteDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: true }>(`/api/drafts/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.removeQueries({ queryKey: ['drafts', id] });
    },
  });
}
