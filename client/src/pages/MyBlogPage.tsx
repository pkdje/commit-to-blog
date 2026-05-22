import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Draft } from 'shared';
import { useRepos } from '../hooks/useRepos';
import { useBranches } from '../hooks/useBranches';
import { useCommits } from '../hooks/useCommits';
import { useDraft } from '../hooks/useDrafts';
import { useGenerateDraft } from '../hooks/useGenerateDraft';
import { useUpdateDraft } from '../hooks/useUpdateDraft';
import RepoSearchInput from '../components/repo/RepoSearchInput';
import BranchSelect from '../components/repo/BranchSelect';
import CommitList from '../components/commit/CommitList';
import DraftEditor, { type DraftPatch } from '../components/editor/DraftEditor';

function MyBlogPage() {
  const [repoQuery, setRepoQuery] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [selectedSha, setSelectedSha] = useState<string | null>(null);
  const [editedDraft, setEditedDraft] = useState<Draft | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editDraftId = searchParams.get('draft');
  const isEditMode = Boolean(editDraftId);

  const reposQuery = useRepos(repoQuery);
  const branchesQuery = useBranches(repo);
  const commitsQuery = useCommits(repo, branch);
  const editDraftQuery = useDraft(editDraftId);
  const generate = useGenerateDraft();
  const update = useUpdateDraft();

  useEffect(() => {
    if (branchesQuery.data?.length && !branch) {
      setBranch(branchesQuery.data[0] ?? '');
    }
  }, [branchesQuery.data, branch]);

  useEffect(() => {
    if (generate.data) setEditedDraft(generate.data);
  }, [generate.data]);

  useEffect(() => {
    if (editDraftQuery.data) setEditedDraft(editDraftQuery.data);
  }, [editDraftQuery.data]);

  const selectedCommit =
    commitsQuery.data?.find((c) => c.sha === selectedSha) ?? null;

  const handleGenerate = (sha: string) => {
    if (!repo || !branch) return;
    setSelectedSha(sha);
    setEditedDraft(null);
    generate.mutate({ repo, branch, sha });
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate('/saved');
      return;
    }
    generate.reset();
    setSelectedSha(null);
    setEditedDraft(null);
  };

  const handleDraftChange = (patch: DraftPatch) => {
    setEditedDraft((d) => (d ? { ...d, ...patch } : d));
  };

  const handleSave = () => {
    if (!editedDraft) return;
    update.mutate(
      {
        id: editedDraft.id,
        patch: {
          title: editedDraft.title,
          summary: editedDraft.summary,
          body: editedDraft.body,
        },
      },
      {
        onSuccess: () => {
          navigate('/saved');
        },
      },
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-8 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[360px_1fr]">
        {/* Left: pickers + commit list */}
        <aside className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              저장소 검색
            </label>
            <RepoSearchInput value={repoQuery} onChange={setRepoQuery} />
            {reposQuery.data && reposQuery.data.length > 0 && (
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {reposQuery.data.map((r) => (
                  <li key={r.name}>
                    <button
                      type="button"
                      onClick={() => {
                        setRepo(r.name);
                        setBranch('');
                        setSelectedSha(null);
                        generate.reset();
                      }}
                      className={[
                        'w-full rounded px-3 py-1.5 text-left text-sm hover:bg-gray-100',
                        repo === r.name ? 'bg-gray-100 font-semibold' : 'text-gray-700',
                      ].join(' ')}
                    >
                      {r.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              브랜치 선택
            </label>
            <BranchSelect
              branches={branchesQuery.data ?? []}
              value={branch}
              onChange={(v) => {
                setBranch(v);
                setSelectedSha(null);
                generate.reset();
              }}
              disabled={!repo}
            />
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-gray-700">최근 커밋</h2>
            {commitsQuery.isLoading && (
              <div className="text-sm text-gray-500">로딩 중...</div>
            )}
            {commitsQuery.data && (
              <CommitList
                commits={commitsQuery.data}
                selectedSha={selectedSha}
                onSelect={(c) => setSelectedSha(c.sha)}
                onGenerateSummary={(c) => handleGenerate(c.sha)}
              />
            )}
            {!repo && (
              <p className="text-sm text-gray-500">먼저 저장소를 선택하세요.</p>
            )}
          </div>
        </aside>

        {/* Right: selected commit + AI 요약 */}
        <section>
          {!selectedCommit && !editedDraft && !editDraftQuery.isLoading && (
            <div className="grid h-80 place-items-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500">
              왼쪽에서 커밋을 선택해 "요약 생성"을 누르세요.
            </div>
          )}

          {editDraftQuery.isLoading && (
            <div className="grid h-80 place-items-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500">
              드래프트 불러오는 중...
            </div>
          )}

          {(selectedCommit || editedDraft) && !editDraftQuery.isLoading && (
            <article className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <header>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    {isEditMode ? '편집 중인 드래프트' : '선택된 커밋'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-mono font-semibold text-blue-700">
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
                      <circle cx="12" cy="12" r="3" />
                      <path d="M3 12h6m6 0h6" />
                    </svg>
                    {(selectedCommit?.sha ?? editedDraft?.commitSha ?? '').slice(0, 7)}
                  </span>
                </div>
                {selectedCommit ? (
                  <>
                    <h2 className="mt-3 text-xl font-bold text-gray-900">
                      {selectedCommit.message}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Authored by{' '}
                      <strong className="font-semibold text-gray-700">
                        {selectedCommit.author}
                      </strong>{' '}
                      on {selectedCommit.date.slice(0, 10)}
                    </p>
                  </>
                ) : (
                  editedDraft && (
                    <p className="mt-3 text-sm text-gray-500">
                      <strong className="font-semibold text-gray-700">{editedDraft.repo}</strong>{' '}
                      · <span className="font-mono">{editedDraft.branch}</span> ·{' '}
                      {editedDraft.createdAt.slice(0, 10)}
                    </p>
                  )
                )}
              </header>

              <div className="mt-6">
                {!isEditMode && generate.isIdle && !editedDraft && (
                  <p className="text-sm text-gray-500">
                    이 커밋의 "요약 생성" 버튼을 눌러 AI 요약을 만드세요.
                  </p>
                )}
                {!isEditMode && generate.isPending && (
                  <p className="text-sm text-gray-500">요약 생성 중...</p>
                )}
                {!isEditMode && generate.isError && (
                  <p className="text-sm text-red-600">{generate.error.message}</p>
                )}
                {editedDraft && <DraftEditor draft={editedDraft} onChange={handleDraftChange} />}
                {update.isError && (
                  <p className="mt-2 text-sm text-red-600">{update.error.message}</p>
                )}
              </div>

              {editedDraft && (
                <footer className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={update.isPending}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={update.isPending}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                      <path d="M12 19V5" />
                      <path d="m5 12 7-7 7 7" />
                    </svg>
                    {update.isPending ? '저장 중...' : '블로그 포스트로 저장 및 게시'}
                  </button>
                </footer>
              )}
            </article>
          )}
        </section>
      </div>
    </main>
  );
}

export default MyBlogPage;
