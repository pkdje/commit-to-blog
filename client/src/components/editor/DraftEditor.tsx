import type { Draft } from 'shared';

export type DraftPatch = {
  title?: string;
  summary?: string;
  body?: string;
};

type Props = {
  draft: Draft;
  onChange: (patch: DraftPatch) => void;
};

function DraftEditor({ draft, onChange }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-blue-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M12 4v4" />
          <circle cx="9" cy="14" r="1" />
          <circle cx="15" cy="14" r="1" />
          <path d="M8 18h8" />
        </svg>
        <h3 className="font-bold">AI 요약</h3>
      </div>

      <div className="relative space-y-3 rounded-md bg-gray-100 p-4">
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          aria-label="draft title"
          placeholder="제목"
          className="w-full bg-transparent text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />

        <textarea
          value={draft.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          aria-label="draft summary"
          placeholder="1~2문장 요약"
          rows={2}
          className="w-full resize-none bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
        />

        <textarea
          value={draft.body}
          onChange={(e) => onChange({ body: e.target.value })}
          aria-label="draft body"
          placeholder="본문"
          rows={10}
          className="min-h-[200px] w-full resize-y bg-transparent text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />

        <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
          <span>{draft.body.length} chars</span>
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </div>
      </div>
    </section>
  );
}

export default DraftEditor;
