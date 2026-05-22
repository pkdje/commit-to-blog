import type { Draft } from 'shared';

const THUMBNAIL_GRADIENTS = [
  'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-400',
  'bg-gradient-to-tr from-gray-800 via-gray-500 to-gray-300',
  'bg-gradient-to-bl from-gray-600 via-gray-400 to-gray-200',
  'bg-gradient-to-tl from-gray-500 via-gray-700 to-gray-300',
  'bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800',
] as const;

function pickGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % THUMBNAIL_GRADIENTS.length;
  return THUMBNAIL_GRADIENTS[idx] ?? THUMBNAIL_GRADIENTS[0];
}

type Props = {
  draft: Draft;
  onEdit?: () => void;
  onPublish?: () => void;
  onDelete?: () => void;
  isPublishing?: boolean;
  isDeleting?: boolean;
};

function PostCard({
  draft,
  onEdit,
  onPublish,
  onDelete,
  isPublishing = false,
  isDeleting = false,
}: Props) {
  const date = draft.createdAt.slice(0, 10).replace(/-/g, '.');
  const isPublished = draft.status === 'published';
  const thumbnailGradient = pickGradient(draft.id);

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

      <div className={`mt-4 aspect-video ${thumbnailGradient}`} />

      <div className="px-5 pb-5 pt-4">
        <p className="line-clamp-3 text-sm text-gray-600">{draft.summary}</p>

        <div className="mt-4 flex items-stretch gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={!onDelete || isDeleting}
            aria-label="삭제"
            title="삭제"
            className="grid w-9 shrink-0 place-items-center rounded-md border border-gray-300 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={!onEdit}
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            수정하기
          </button>
          {isPublished && draft.publishedUrl ? (
            <a
              href={draft.publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
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
              className="flex-1 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
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
