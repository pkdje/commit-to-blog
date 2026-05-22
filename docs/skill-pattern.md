# Skill 패턴: Spec-anchored Commit Checklist

> 2주 과제를 진행하면서 발견한, AI와 협업할 때 가장 큰 효용을 준 작업 방식 하나.

## 이름

**Spec-anchored Commit Checklist** — 단일 디자인 spec에 commit 단위 체크리스트를 함께 적어두고, 모든 commit이 그 체크리스트 한 항목과 1:1로 매핑되도록 작업하는 방식.

## 언제 쓰나

- AI와 협업해 2주 이상 분량의 새 프로젝트를 시작할 때
- 세션이 자주 끊기거나, 도중에 LLM 모델/제공자를 바꿔야 할 가능성이 있을 때
- 평가자/리뷰어에게 "무엇을 어떤 순서로 했는지"를 commit 메시지만으로 설명해야 할 때

## 문제 인식

AI(Claude/Gemini/GPT 등)는 세션마다 컨텍스트가 리셋된다. 큰 단위로 작업을 시키면 흔히 발생하는 증상:

- 매 세션마다 "현재 어디까지 했지"를 재구축하는 비용이 큼
- 같은 commit 안에 무관한 변경들이 섞임 (ex: 새 기능 + 리팩토링 + 스타일 + 테스트)
- 도중에 결정을 바꿔야 할 때 영향 범위를 파악하기 어려움
- PR 본문 쓸 때 "완료 작업 목록"을 처음부터 재구성해야 함

## 해법

**디자인 spec 한 문서에 4가지를 한꺼번에 적어둔다:**

1. **결정 사항 표** — 도구·라이브러리·아키텍처 선택 + 각각의 근거
2. **데이터 모델** — TypeScript 타입 정의 (정답 형상)
3. **디렉토리 / API 계약** — 파일 위치 + 엔드포인트 표
4. **Commit 단위 체크리스트** — 각 항목이 그대로 conventional-commit 메시지가 되도록 작성

예시 (이 프로젝트의 일부):

```markdown
### Claude 연동 + 드래프트 생성 (서버)
- [ ] `feat(server): claudeClient.complete() with Anthropic SDK`
- [ ] `feat(server): prompts/blogDraftPrompt.ts template`
- [ ] `feat(server): draftStore.ts Map-based memory store`
- [ ] `feat(server): POST /api/drafts/generate (commit → LLM → store)`
- [ ] `feat(server): GET /api/drafts, GET /api/drafts/:id`
- [ ] `test(server): draftStore CRUD + generate route with mocked Claude`
```

## 운영 규칙

1. **각 commit = spec 체크리스트 한 항목.** 1:1 매핑이 깨지면 commit 단위가 너무 크다는 신호.
2. **체크리스트에 없는 작업이 생기면** → 작업 전에 먼저 체크리스트를 갱신하는 commit을 만든다.
3. **AI는 commit 메시지만 제안**, 사용자가 직접 `git commit` 실행. AI에게 atomic commit 권한을 주면 묶음/누락이 생긴다.
4. **세션 시작/재개 시 spec 문서를 먼저 읽는다.** "다음은 N번 항목"이 명확한 referent가 된다.
5. **결정이 바뀌면 spec부터 갱신한다.** 코드 → spec 순으로 일관성을 유지하면 다음 세션이 다시 헤맨다.

## 이 프로젝트에서 얻은 구체적 효용

### 1. LLM provider 전환이 2 commit으로 마감
1주차 도중에 Anthropic Claude → Google Gemini로 전환. spec 4.3절 디렉토리 표에 `services/claudeClient.ts`가 적혀 있어 영향 범위가 즉시 보였고, "service 레이어로 격리"라는 결정 사항 자체가 전환 비용을 미리 줄여 놓은 상태였다.

- `docs: switch LLM provider to Google Gemini in spec and plans`
- `feat(server): switch LLM provider from Anthropic Claude to Google Gemini`

이미 작성된 35개 테스트는 mock의 모듈명·shape만 바꿔서 그대로 통과.

### 2. 세션 단절 비용이 거의 0
주중에 여러 번 세션이 끊겼다. 매번 재개할 때 다음 한 줄만 확인하면 됐다:
> "spec 8절에서 다음 unchecked 항목이 뭐지?"

AI에게 "이전 컨텍스트 복구"를 요청할 필요 없음.

### 3. PR 본문이 commit 메시지 그대로 완성
PR의 "완료 작업 목록" 섹션은 git log 한 줄 한 줄을 거의 그대로 옮겨 붙이면 됐다. "이거 뭐 했더라"를 PR 작성 시점에 다시 생각하지 않음.

### 4. AI에게 "큰 단위 요청 → 작은 commit으로 쪼개기" 부담을 안 줘도 됨
체크리스트 항목 1개가 곧 commit 단위라서, AI는 그 한 항목의 구현에만 집중하면 된다. "여러 기능을 한꺼번에" 같은 요청이 자연 차단됨.

## 변형 / 안티 패턴

| 시도해본 변형 | 결과 | 교훈 |
|---|---|---|
| 체크리스트 없이 결정 사항만 spec에 적기 | AI가 한 commit에 4~5개 기능을 끌어옴 | 체크리스트가 commit 단위 강제력을 함 |
| Day 1/Day 2/... 일자별 분할 | 작업 페이스(주말/평일 차이)와 안 맞음. 일자가 밀리면 죄책감 발생 | **주차 단위로만 묶고, 항목 단위로 commit** 하는 게 작업 페이스와 자연스러움 |
| AI에게 자동 commit 권한 부여 | 누락된 파일 / 묶음 commit / 잘못된 메시지 다수 발생 | AI는 메시지 제안, 사람이 commit 실행이 안전 |
| 체크리스트 안 항목에 "여러 작업 묶음" | 한 commit이 너무 커져서 diff 리뷰 어려움 | 체크박스 하나 = 한 가지 변경. 의심되면 더 쪼갠다 |

## 측정 가능한 지표 (이 프로젝트 기준)

- 총 commit 수: **약 60개** (2주차 종료 시점)
- spec 체크리스트 항목 수: **약 50개**
- 체크리스트 항목과 1:1 매핑된 commit 비율: **95%+** (소수는 follow-up/fix commit)
- AI 세션 재시작 후 "어디까지 했는지" 재구축에 든 시간: **거의 0** — spec 8절 한 번 보면 끝

## 한 줄 요약

**"Spec = 단일 진실의 출처. 그 안의 체크박스 = commit 단위. AI는 메시지를 제안, 사람이 commit."**
