# Smart Blog

GitHub 커밋을 분석해 LLM으로 개발 블로그 초안을 자동 생성하고, 편집·발행까지 한 흐름으로 처리하는 서비스. 2주 과제.

## 기능

- GitHub 저장소·브랜치·커밋 선택 (`useRepos` / `useBranches` / `useCommits`)
- Google Gemini로 선택된 커밋에서 블로그 초안(제목·요약·본문) 생성
- 카드형 저장 포스트 목록 (브랜치 태그·날짜·요약 미리보기·썸네일 그라데이션)
- 드래프트 인라인 편집 (제목/요약/본문 + 글자수 카운터)
- GitHub repo에 markdown 파일로 발행 (YAML frontmatter 포함)
- 드래프트 삭제
- 글로벌 에러 토스트 + 로딩 스켈레톤

## 화면

> 🚧 시연 캡처는 PR에 첨부. 저장 경로: `docs/images/`
>
> - `screenshot-my-blog.png` — My Blog 페이지 (저장소·커밋 선택 → AI 요약 → 편집)
> - `screenshot-saved-posts.png` — Saved Posts 페이지 (카드 그리드 + 새 초안 슬롯)
> - `screenshot-published.png` — 발행 후 GitHub 링크 표시

## 아키텍처

```
Browser ── React Client ── /api 프록시 ── Express Server ── GitHub Contents API
                                                         └─ Gemini chat API
```

- **클라이언트** (`client/`): React 19 + Vite 8 + Tailwind 4 + React Query 5 + React Router 7
- **서버** (`server/`): Express 5 + TypeScript 6 + Octokit + Google GenAI SDK + zod
- **공용** (`shared/`): TypeScript 타입 정의

상세 설계: [docs/superpowers/specs/2026-05-18-smart-blog-design.md](docs/superpowers/specs/2026-05-18-smart-blog-design.md).

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

(npm workspaces로 client / server / shared 동시 설치)

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env`를 열어 다음 값을 채웁니다:

| 키 | 발급처 | 필수 | 비고 |
|---|---|---|---|
| `GITHUB_TOKEN` | https://github.com/settings/tokens | ✅ | Fine-grained PAT 권장. **Contents: Read and write** (발행 위해 쓰기 권한 필요), Metadata: Read. |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey | ✅ | **무료 티어 제공**, 카드 등록 불필요. |
| `BLOG_REPO` | — | ⚠️ 발행 시 필수 | 발행 대상 GitHub repo (예: `pkdje/blog-posts`). 미설정 시 발행만 400 응답. 빈 값 OK. |
| `PORT` | — | ❌ | 서버 포트. 기본 `3001`. |

> ⚠️ `.env`는 절대 commit하지 마세요. `.gitignore`에 포함돼 있습니다.
>
> 💡 `BLOG_REPO`는 본인 GitHub 계정의 빈 repo를 미리 만들어두고 `owner/repo` 형태로 입력하세요 (예: `pkdje/blog-posts`). 슬래시 1개만, 파일 경로 X.

### 3. 개발 서버 실행

두 개 터미널을 띄워 동시 실행:

```bash
# 터미널 1: Express 서버 (포트 3001)
npm run dev:server

# 터미널 2: Vite 클라이언트 (포트 5173)
npm run dev:client
```

브라우저에서 http://localhost:5173 접속.

> Vite는 `/api/*` 요청을 `http://localhost:3001`로 프록시합니다. 클라이언트 코드는 상대 경로 `/api/...`만 사용하며 토큰은 서버에만 보관됩니다.

### 4. 빌드 · 타입체크 · 테스트

```bash
npm run build       # 양쪽 워크스페이스 빌드
npm run typecheck   # 양쪽 타입체크
npm test            # 서버 vitest (53 tests)
```

## 프로젝트 구조

```
commit-to-blog/
├── client/                      # React + Vite
│   ├── src/
│   │   ├── pages/               # MyBlogPage, SavedPostsPage, SettingsPage
│   │   ├── components/
│   │   │   ├── layout/          # Header, ErrorBanner
│   │   │   ├── repo/            # RepoSearchInput, BranchSelect
│   │   │   ├── commit/          # CommitList, CommitListItem, CommitListSkeleton
│   │   │   ├── editor/          # DraftEditor
│   │   │   └── saved/           # PostCard, PostCardGrid, PostCardSkeleton
│   │   ├── hooks/               # useRepos, useBranches, useCommits, useDrafts,
│   │   │                        # useGenerateDraft, useUpdateDraft, usePublishDraft
│   │   ├── lib/                 # api.ts (fetch wrapper), notify.ts (toast bus)
│   │   ├── App.tsx              # Routes
│   │   └── main.tsx             # BrowserRouter + QueryClientProvider
│   └── vite.config.ts           # /api proxy → :3001
├── server/                      # Express + TS
│   ├── src/
│   │   ├── routes/              # health, github, drafts
│   │   ├── services/            # githubClient, geminiClient, draftStore
│   │   ├── prompts/             # blogDraftPrompt.ts
│   │   ├── middleware/          # errorHandler.ts
│   │   ├── app.ts               # createApp() (테스트용)
│   │   ├── env.ts               # zod로 .env 검증
│   │   └── index.ts             # bootstrap
│   └── tsconfig.json
├── shared/
│   └── types.ts                 # RepoSummary, CommitSummary, Draft, ApiResult<T>
├── docs/
│   ├── superpowers/specs/       # 디자인 spec
│   ├── week1-plan.md            # 1주차 계획 + 회고
│   └── week2-plan.md
├── .env.example
└── package.json                 # workspaces 루트
```

## API 요약

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/health` | 헬스 체크 |
| GET | `/api/github/repos?q=` | 본인 저장소 목록 (`q`로 부분 매치) |
| GET | `/api/github/branches?repo=owner/name` | 브랜치 목록 |
| GET | `/api/github/commits?repo=&branch=&limit=` | 최근 커밋 |
| POST | `/api/drafts/generate` | 커밋 → LLM → 초안 저장. body: `{ repo, branch, sha }` |
| GET | `/api/drafts` | 전체 드래프트 (newest-first) |
| GET | `/api/drafts/:id` | 드래프트 1건 |
| PUT | `/api/drafts/:id` | 드래프트 부분 수정. body: `{ title?, summary?, body? }` (최소 1개 필수) |
| POST | `/api/drafts/:id/publish` | GitHub repo에 .md 발행. body: `{ targetRepo?, path? }` (둘 다 기본값 있음) |
| DELETE | `/api/drafts/:id` | 드래프트 삭제 |

응답 envelope: `{ data: T }` 또는 `{ error: { code, message } }`. 모든 throw된 에러는 `errorHandler` 미들웨어가 같은 형태로 정규화.

## 사용 흐름

### 새 드래프트 생성 → 편집 → 발행

1. **My Blog** 탭에서 "저장소 검색" 입력 → 매칭 repo 목록에서 클릭
2. 브랜치 자동 선택 (필요 시 변경)
3. 최근 커밋 목록에서 행 클릭 = 선택, **요약 생성** 클릭 = LLM 호출
4. 우측 패널의 편집기에서 제목·요약·본문 수정 (글자수 실시간 표시)
5. **블로그 포스트로 저장 및 게시** 클릭 → PUT 저장 → **Saved Posts** 페이지로 이동
6. Saved Posts에서 카드의 **발행하기** 클릭 → 확인 → GitHub repo에 .md 푸시 → 카드에 **GitHub에서 보기** 링크 표시

### 기존 드래프트 수정 / 삭제

- Saved Posts 카드의 **수정하기** → `/?draft={id}` URL로 이동 → 편집기 로드
- 카드 좌측 **🗑️** 아이콘 → 확인 → 삭제

## 진행 상황

- [x] 1주차 — 기반 + 얇은 end-to-end ([docs/week1-plan.md](docs/week1-plan.md))
- [x] 2주차 — 편집기 · 저장 · 발행 · 다듬기 ([docs/week2-plan.md](docs/week2-plan.md))

## 참고

- 디자인 spec: [docs/superpowers/specs/2026-05-18-smart-blog-design.md](docs/superpowers/specs/2026-05-18-smart-blog-design.md)
- PR 템플릿: [.github/pull_request_template.md](.github/pull_request_template.md)
