# 1주차 계획

## 목표

1주차 끝에 **동작하는 얇은 end-to-end** 완성:
커밋 선택 → AI 요약 → 화면 표시.

✅ **2026-05-19 달성.** PR 제출 완료.

## 참고 문서

- 전체 디자인 / 결정 사항 / 데이터 모델 / API 계약: [docs/superpowers/specs/2026-05-18-smart-blog-design.md](../docs/superpowers/specs/2026-05-18-smart-blog-design.md)
- 본 파일은 design spec 8절의 1주차 부분을 미러링한다. spec과 불일치 발생 시 spec을 우선하고 본 파일을 갱신한다.
- **2026-05-19 LLM 전환:** Anthropic Claude → Google Gemini. 아래 "Claude 연동" 섹션의 commit 라벨은 전환 전 실제 commit 메시지를 보존한다.

## 체크리스트 (각 항목 = 1 commit)

### 프로젝트 셋업
- [x] `chore: init npm workspaces (client, server, shared) + .gitignore + .env.example`
- [x] `chore: scaffold Vite React TS in client/`
- [x] `chore: scaffold Express TS in server/ with /api/health`
- [x] `chore: add tailwind to client/`
- [x] `chore: add shared/types.ts with RepoSummary/CommitSummary/Draft`
- [x] `docs: add week1-plan.md and week2-plan.md`

### GitHub 연동 (서버)
- [x] `feat(server): env.ts loads GITHUB_TOKEN/ANTHROPIC_API_KEY with zod validation`
- [x] `feat(server): githubClient.listRepos() with Octokit`
- [x] `feat(server): GET /api/github/repos endpoint`
- [x] `feat(server): githubClient.listBranches() + GET /api/github/branches`
- [x] `feat(server): githubClient.listCommits() + GET /api/github/commits`
- [x] `test(server): integration tests for /api/github/* with mocked Octokit`

### Claude 연동 + 드래프트 생성 (서버)
- [x] `feat(server): claudeClient.complete() with Anthropic SDK`
- [x] `feat(server): prompts/blogDraftPrompt.ts template`
- [x] `feat(server): draftStore.ts Map-based memory store`
- [x] `feat(server): POST /api/drafts/generate (commit → LLM → store)`
- [x] `feat(server): GET /api/drafts, GET /api/drafts/:id`
- [x] `test(server): draftStore CRUD + generate route with mocked Claude`

### 프론트 골격 + 데이터 페치
- [x] `feat(client): Header with tabs (My Blog / Saved Posts / Settings)`
- [x] `feat(client): React Query setup + lib/api.ts fetch wrapper`
- [x] `feat(client): useRepos + RepoSearchInput component`
- [x] `feat(client): useBranches + BranchSelect component`
- [x] `feat(client): useCommits + CommitList/CommitListItem components`

### 얇은 end-to-end 완주
- [x] `feat(client): useGenerateDraft mutation + "요약 생성" button wired`
- [x] `feat(client): AISummaryPanel renders generated draft`
- [x] `feat(client): MyBlogPage layout matches mockup`
- [x] `chore: README with run instructions + screenshots`

### Extra (체크리스트 외 추가 commit)
- [x] `chore(server): exclude test files from tsc build` (테스트 중복 fix)
- [x] `docs: switch LLM provider to Google Gemini in spec and plans`
- [x] `feat(server): switch LLM provider from Anthropic Claude to Google Gemini`
- [x] `fix(server): treat empty BLOG_REPO env as unset, not invalid`

## 마일스톤

🎯 ✅ 커밋 선택 → AI 요약 → 화면 표시까지 동작 (2026-05-19 달성).

## 진행 노트

| 날짜 | 진행 | 비고 |
|---|---|---|
| 2026-05-18 | 프로젝트 셋업 6항목 완료 (workspaces / vite / express / tailwind / shared types / plan files) | |
| 2026-05-18 | GitHub 연동 블록 6항목 완료 (env, client, 3 routes, 13 tests) | |
| 2026-05-18 | Claude 연동 + 드래프트 생성 블록 6항목 완료 (서버측 35 tests) | |
| 2026-05-18 | 프론트 골격 + 데이터 페치 블록 5항목 완료 | |
| 2026-05-18 | 얇은 end-to-end 블록 4항목 완료 + README | 1주차 마일스톤 달성 |
| 2026-05-19 | LLM provider를 Claude → Gemini로 전환 | 결제 부담 회피 |
| 2026-05-19 | PR 제출 (`pkdje:pkdje` → `boostcampwm-snu-2026-1:pkdje`) | |

## 회고 메모 (PR 작성용)

- **분석·설계 과정:** 브레인스토밍으로 발행 동작·저장 방식·인증·LLM provider·도구 선택을 한 번에 한 질문씩 결정. 결정 근거는 spec 1절 표에 기록. 수직 슬라이스 우선 전략을 채택해 1주차 끝에 동작하는 얇은 end-to-end 확보가 시연·평가 리스크를 가장 줄임. 데이터 모델 → 디렉토리 구조 → API 계약 순으로 spec을 작성한 뒤 commit 단위 체크리스트로 분해. 이후 모든 commit은 spec 8절을 기준으로 결정.
- **가장 막혔던 순간:** LLM provider를 Claude → Gemini로 중간 전환한 순간. Claude Pro 구독으로는 API를 못 쓴다는 걸 깨닫고 무료 티어가 있는 Gemini로 갈아탔다. 다행히 `services/claudeClient.ts`로 LLM 호출을 격리해뒀던 덕에 이름 변경 + SDK 교체 + 테스트 mock 갱신만으로 끝났고 35개 테스트는 그대로 통과. AI에게 "변경 영향 범위를 spec 4.3 디렉토리 표 관점에서 알려달라"고 질문한 게 정리에 도움이 됐다.
- **새로 알게 된 것:** ChatGPT Plus / Claude Pro 같은 구독은 API와 별개 빌링이라는 점. Gemini는 무료 티어가 있어 결제 없이 시작 가능. Vite `server.proxy`로 dev에서 `/api`를 Express(3001)로 넘기면 클라이언트는 상대 경로만 사용하고 토큰은 서버에 남길 수 있음. Express 5는 async route handler의 throw를 기본 에러 핸들러로 자동 forwarding (별도 try/catch 불필요). zod에서 빈 문자열을 "미설정"으로 처리하려면 `.transform()` 후 `.refine()` 패턴 필요.
- **다르게 한다면:** LLM provider를 처음부터 환경변수로 선택 가능하게 추상화했어야 함. 도중 전환에서 docs + code 2개 commit 추가 발생. spec 8절 commit 체크리스트를 만들 때 `githubClient.getCommit()` 같은 보조 메서드를 명시적으로 항목화하지 못함. 결과적으로 `POST /api/drafts/generate` commit에 끼워넣었는데, 다음 주에는 라우트 commit 전에 의존하는 서비스 메서드를 먼저 체크리스트화할 계획. AI에게 한 번에 너무 큰 단위를 시키지 말고 "spec의 어느 행과 매핑되는 commit인가"를 매번 명시했더니 도중 일관성이 훨씬 좋아짐 — 처음부터 그 규칙으로 갔어야.
