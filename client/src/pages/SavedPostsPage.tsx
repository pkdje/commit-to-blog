import { useNavigate } from 'react-router-dom';
import type { Draft } from 'shared';
import { useDrafts } from '../hooks/useDrafts';
import { usePublishDraft } from '../hooks/usePublishDraft';
import PostCardGrid from '../components/saved/PostCardGrid';
import PostCard from '../components/saved/PostCard';

function SavedPostsPage() {
  const navigate = useNavigate();
  const draftsQuery = useDrafts();
  const publish = usePublishDraft();

  const handlePublish = (draft: Draft) => {
    if (!window.confirm(`"${draft.title}"을(를) 발행하시겠습니까?`)) return;
    publish.mutate({ id: draft.id });
  };

  return (
    <main className="mx-auto max-w-7xl px-8 py-10">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">저장된 포스트</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI가 생성한 초안과 백업된 커밋 로그 목록입니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          블로그 생성
        </button>
      </header>

      {draftsQuery.isLoading && (
        <p className="text-sm text-gray-500">로딩 중...</p>
      )}
      {draftsQuery.isError && (
        <p className="text-sm text-red-600">{draftsQuery.error.message}</p>
      )}
      {publish.isError && (
        <p className="mb-4 text-sm text-red-600">
          발행 실패: {publish.error.message}
        </p>
      )}
      {draftsQuery.data && (
        <PostCardGrid>
          {draftsQuery.data.map((d) => (
            <PostCard
              key={d.id}
              draft={d}
              onEdit={() => navigate(`/?draft=${d.id}`)}
              onPublish={() => handlePublish(d)}
              isPublishing={publish.isPending && publish.variables?.id === d.id}
            />
          ))}
          <NewDraftSlot onClick={() => navigate('/')} />
        </PostCardGrid>
      )}
    </main>
  );
}

function NewDraftSlot({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center transition-colors hover:border-gray-400 hover:bg-gray-50"
    >
      <span className="grid h-12 w-12 place-items-center rounded-md bg-blue-50 text-blue-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M12 18v-6" />
          <path d="M9 15h6" />
        </svg>
      </span>
      <div>
        <div className="text-sm font-semibold text-gray-900">새 초안 작성</div>
        <div className="mt-1 text-xs text-gray-500">
          커밋 로그를 불러와 포스트를 생성하세요
        </div>
      </div>
    </button>
  );
}

export default SavedPostsPage;
