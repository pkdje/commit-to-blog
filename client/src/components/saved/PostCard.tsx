import type { Draft } from 'shared';

type Props = {
  draft: Draft;
  onEdit?: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
};

function PostCard({ draft, onEdit, onPublish, isPublishing = false }: Props) {
  const date = draft.createdAt.slice(0, 10).replace(/-/g, '.');
  const isPublished = draft.status === 'published';

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-xs text-blue-700">
            {draft.branch}
          </span>
          <span className="font-mono text-xs text-gray-500">{date}</span>
        </div>
        <h3 className="mt-3 text-base font-bold text-gray-900">{draft.title}</h3>
      </div>

      <div className="mt-4 aspect-video bg-gradient-to-br from-gray-200 to-gray-300" />

      <div className="px-5 pb-5 pt-4">
        <p className="line-clamp-3 text-sm text-gray-600">{draft.summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={!onEdit}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            수정하기
          </button>
          {isPublished && draft.publishedUrl ? (
            <a
              href={draft.publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              GitHub에서 보기
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={!onPublish || isPublished || isPublishing}
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPublished ? '발행됨' : isPublishing ? '발행 중...' : '발행하기'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default PostCard;
