import { useNavigate } from 'react-router-dom';
import type { Draft } from 'shared';
import { useDrafts } from '../hooks/useDrafts';
import PostCardGrid from '../components/saved/PostCardGrid';

function SavedPostsPage() {
  const navigate = useNavigate();
  const draftsQuery = useDrafts();

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
      {draftsQuery.data && draftsQuery.data.length === 0 && (
        <p className="text-sm text-gray-500">아직 저장된 포스트가 없습니다.</p>
      )}
      {draftsQuery.data && draftsQuery.data.length > 0 && (
        <PostCardGrid>
          {draftsQuery.data.map((d) => (
            <DraftCardStub key={d.id} draft={d} />
          ))}
        </PostCardGrid>
      )}
    </main>
  );
}

// Lightweight placeholder card. Replaced by PostCard component in the next commit.
function DraftCardStub({ draft }: { draft: Draft }) {
  const date = draft.createdAt.slice(0, 10);
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-xs text-blue-700">
          {draft.branch}
        </span>
        <span className="font-mono text-xs text-gray-500">{date}</span>
      </div>
      <h3 className="mt-2 font-bold text-gray-900">{draft.title}</h3>
      <p className="mt-1 line-clamp-3 text-sm text-gray-600">{draft.summary}</p>
    </article>
  );
}

export default SavedPostsPage;
