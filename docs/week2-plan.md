# 2주차 계획

## 목표

2주차 끝에 **편집·저장·발행까지 완주**:
커밋 → 요약 → 수정 → GitHub repo에 .md 발행.

## 참고 문서

- 전체 디자인 / 결정 사항 / 데이터 모델 / API 계약: [docs/superpowers/specs/2026-05-18-smart-blog-design.md](../docs/superpowers/specs/2026-05-18-smart-blog-design.md)
- 본 파일은 design spec 8절의 2주차 부분을 미러링한다. spec과 불일치 발생 시 spec을 우선하고 본 파일을 갱신한다.

## 체크리스트 (각 항목 = 1 commit)

### 편집기 + 드래프트 수정
- [x] `feat(server): PUT /api/drafts/:id (title/summary/body update)`
- [x] `feat(client): DraftEditor textarea with 글자수 카운터`
- [x] `feat(client): "취소" / "블로그 포스트로 저장" 버튼 동작`
- [x] `test(server): PUT /api/drafts/:id integration test`

### Saved Posts 카드 그리드
- [ ] `feat(client): useDrafts hook (list/get/delete)`
- [ ] `feat(client): SavedPostsPage with PostCardGrid`
- [ ] `feat(client): PostCard with branch tag, date, summary preview`
- [ ] `feat(client): "새 초안 작성" empty slot → navigate to MyBlogPage`
- [ ] `feat(client): "수정하기" loads existing draft into editor`

### 발행 (GitHub push)
- [ ] `feat(server): githubClient.putContent() — create/update file via Contents API`
- [ ] `feat(server): POST /api/drafts/:id/publish (md serialization + push)`
- [ ] `feat(client): "발행하기" button on PostCard + confirmation`
- [ ] `feat(client): show publishedUrl link after successful publish`
- [ ] `test(server): publish route with mocked Octokit`

### 에러 처리 + UI 다듬기
- [ ] `feat(server): errorHandler middleware with normalized { error } shape`
- [ ] `feat(client): toast/banner for API errors`
- [ ] `feat(client): loading skeletons on lists`
- [ ] `style: card thumbnails placeholder gradient (목업 톤 매치)`
- [ ] `feat(server): DELETE /api/drafts/:id endpoint`
- [ ] `feat(client): DELETE 드래프트 (수정하기 옆 옵션)`

### 검증, 문서, PR
- [ ] `docs: update README with final screenshots + .env setup`
- [ ] `docs: add skill pattern note (개발하며 발견한 패턴 1개 정리)`
- [ ] `chore: tsc --noEmit passes on both workspaces`
- [ ] `chore: all vitest suites pass`
- [ ] PR 작성 — 템플릿 5개 섹션(완료 작업/설계 과정/막힌 순간/새로 알게 된 것/다르게 한다면) + 시연 스크린샷

## 마일스톤

🎯 커밋 → 요약 → 수정 → GitHub repo에 .md 발행까지 동작.

## 진행 노트

(작업 세션마다 갱신)

| 날짜 | 진행 | 비고 |
|---|---|---|
| 2026-05-22 | 편집기 + 드래프트 수정 블록 4항목 완료 (PUT 라우트·DraftEditor·저장 버튼·통합 테스트 7개 추가, 누적 42 tests) | 다음: Saved Posts 카드 그리드 |

## 회고 메모 (PR 작성용)

- **분석·설계 과정:** _작성 예정_
- **가장 막혔던 순간:** _작성 예정_
- **새로 알게 된 것:** _작성 예정_
- **다르게 한다면:** _작성 예정_
