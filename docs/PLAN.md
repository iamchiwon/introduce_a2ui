# 소개 영상 제작 계획 (모션그래픽 + Fish Audio)

- 입력: [scenario.md](scenario.md)(S0~S12), [narration.md](narration.md)
- 출력: 1920×1080, 30fps, 15~20분 MP4. 내레이션은 Fish Audio TTS로 만든다.
- 방식: 영상을 코드로 만든다. 화면은 모션그래픽과, 시뮬레이터에서 자동으로 녹화한 실제 앱 화면을 섞는다.

## 1. 검토 결과

| # | 항목 | 내용 | 대응 |
|---|---|---|---|
| 1 | 시나리오 전제가 바뀜 | scenario.md는 "Xcode 라이브코딩 화면 녹화"를 전제로 썼다. 모션그래픽 영상에는 사람이 녹화한 화면이 없다. | Xcode 화면(새 프로젝트, 패키지 추가, AI 프롬프트, 코드)은 **모션그래픽 목업**으로 재현한다. 앱 동작 장면은 **시뮬레이터 자동 녹화**(XCUITest + `simctl io recordVideo`)로 만든 실제 영상을 쓴다. 시나리오의 "화면" 항목을 장면별 스토리보드로 다시 쓴다(W1). |
| 2 | 도구 | 코드 기반 모션그래픽 도구가 필요하다. | **Remotion 4**(React/TS, 현재 4.0.547)를 쓴다. 기존 React 코드와 같은 스택이고, 오디오 길이에 맞춰 장면 길이를 정할 수 있고, CLI로 렌더링된다. Remotion은 개인과 3인 이하 회사는 무료, 그 외는 회사 라이선스가 필요하다(**확인 필요**). 안 되면 Motion Canvas(MIT)를 쓴다. |
| 3 | 싱크 | 내레이션과 화면은 장면 단위로만 맞추면 된다. | 장면마다 TTS를 따로 만들고, 장면 길이 = max(음성 길이 + 여백, 화면 최소 길이)로 정한다. 장면 안의 강조 타이밍은 Fish Audio `/v1/tts/stream/with-timestamp`의 단어 타임스탬프로 맞추고, 자막도 같은 데이터로 만든다. |
| 4 | 발음 | 영문 용어·숫자는 TTS가 영어식으로 읽거나 잘못 읽는다. | 용어는 **실제 개발자들이 부르는 한국어 발음**으로 적는다(예: A2UI → 에이투유아이, SwiftUI → 스위프트 유아이, JSON → 제이슨, Xcode → 엑스코드). narration.md는 그대로 두고, 발음 사전 [`video/tts/pronunciation.json`](../video/tts/pronunciation.json)으로 TTS용 텍스트만 바꾼다. 적용 후 영문자·숫자가 남으면 TTS 생성을 실패시킨다. 처음 생성한 음성을 사람이 듣고 사전을 고친다. |
| 5 | 비밀값 | `.env`(FISH_AUDIO_API_KEY, VOICE_ID)가 git 제외 대상에 없었다. | `.gitignore`에 `.env`를 추가했다. 키는 TTS 스크립트(Node)에서만 읽고, Remotion 번들이나 작업 지시서·로그에는 넣지 않는다. |
| 6 | 소스 재사용 | 코드와 JSON 화면이 이미 있다. | `ios/App/App.swift`, `fixtures/*.json`을 그대로 import해 코드 하이라이트(shiki)로 보여준다. 스크린샷은 `ios/screenshots/`를 쓴다. |
| 7 | 상표 | Xcode, iOS UI를 똑같이 베끼면 문제가 될 수 있다. | 실제 Xcode 캡처 대신 단순화한 "IDE 풍" 목업으로 만든다. 시뮬레이터 녹화는 실제 앱 화면이라 문제없다. |
| 8 | 렌더링 시간 | 15~20분 1080p는 렌더링이 오래 걸린다. | 장면별로 따로 렌더링해 확인하고, 최종본만 전체 렌더링한다. |

## 2. 결정 필요 (사용자)

- [ ] Remotion 라이선스 조건 확인 (개인 채널이면 무료)
- [ ] 화면 톤: 다크 / 라이트
- [ ] 자막 넣기 여부 (기본: 넣음)
- [ ] BGM 사용 여부, 사용하면 음원 파일
- [ ] Fish Audio 모델: `s2.1-pro`(기본) / `s1`
- [ ] 채널 인트로·아웃트로 소스가 있는지

## 3. 폴더 구조 (예정)

```text
video/
  package.json            # remotion, @remotion/cli, shiki
  src/
    Root.tsx              # Composition 등록, calculateMetadata로 장면 길이 계산
    theme.ts              # 색·폰트·간격
    components/           # IdeMock, CodeBlock, JsonHighlight, Simulator, Diagram, Caption, Title
    scenes/S00.tsx ~ S12.tsx
  tts/
    pronunciation.json    # 발음 사전 (작성 완료, 대본 수정 시 함께 갱신)
    build.mjs             # narration.md → 장면별 TTS → public/audio
  public/
    audio/Sxx.mp3, Sxx.words.json, manifest.json   # 생성물 (git 제외)
    footage/*.mp4                                  # 시뮬레이터 녹화 (git 제외)
  out/                                             # 렌더 결과 (git 제외)
docs/storyboard.md        # 장면별 화면 비트, 사용 소스, 최소 길이
```

## 4. 작업 분배

모델은 `router.py` 결과를 따른다. 지금은 codex 잔량이 더 많아서 general과 design이 codex로 배정됐다(claude 남은 94%, codex 남은 96%).

| ID | 업무 | 담당 (agent / model / effort) | 입력 | 산출물 / 완료 조건 |
|---|---|---|---|---|
| C | 총괄: 결정 반영, 작업 지시, 통합, 발음 청취 검수, 최종 렌더 | 코디네이터 (claude / opus-5.5) | 이 계획 | 각 단계 승인, 최종 MP4 |
| W1 | 스토리보드와 디자인 시스템 설계 | codex / gpt-6.2-astra / high (design) | scenario.md, narration.md, ios/, fixtures/ | `docs/storyboard.md`(장면별 비트·소스·최소 길이·강조 단어), `video/` 뼈대(Root, theme, 공용 컴포넌트 인터페이스). `npx remotion studio` 실행 확인 |
| W2 | TTS 파이프라인 | codex / gpt-6.2-sol / medium (backend) | narration.md, .env | `video/tts/build.mjs`: 장면 분리 → 발음 사전 적용(영문·숫자 잔존 시 실패) → with-timestamp 호출 → mp3와 단어 타임스탬프, `manifest.json`(장면별 길이). 텍스트 해시 캐시로 바뀐 장면만 다시 생성. S0 한 장면 샘플 생성 |
| W3 | 시뮬레이터 실사 녹화 | codex / gpt-6.2-sol / medium (general) | ios/, fixtures/ | XCUITest 시나리오 + `simctl io recordVideo`로 `video/public/footage/`에 S0(4화면 전환·골프 제출), S8(골프 조작), S9(4화면·진료 정규식 경고), S10(안과 추가 전후). 녹화 스크립트 `video/footage.sh` |
| W4a | 장면 구현 S0~S6 | codex / gpt-6.2-sol / medium (general) | storyboard, W1 뼈대, W2 manifest | `scenes/S00~S06.tsx`. 장면별 still 렌더 확인 |
| W4b | 장면 구현 S7~S12 | codex / gpt-6.2-sol / medium (general) | storyboard, W1 뼈대, W2 manifest, W3 footage | `scenes/S07~S12.tsx`. 장면별 still 렌더 확인 |
| W5 | 썸네일·타이틀 카드 이미지 (선택) | codex / gpt-6.1-terra / medium (image, gpt-image-2.5-flare) | 영상 톤 | `video/public/images/` 썸네일 1장, 타이틀 배경 |
| R1 | 리뷰: 코드 + 장면별 still 샘플 + 싱크 | claude / claude-fable-5-2 / high (review-codex) | W1~W4 결과 | 이슈 목록 → 해당 워커에 수정 지시 |

## 5. 진행 순서

```text
P0  사용자 결정 (2절)
P1  병렬: W1 설계  |  W2 TTS (S0 샘플 → 청취 → 발음 사전 확정 → 전체 생성)  |  W3 실사 녹화
P2  W1, W2 완료 후 병렬: W4a  |  W4b (W3 footage 필요)  |  W5
P3  R1 리뷰 → 수정
P4  C: 전체 렌더 → 사용자 검수 → 내레이션 수정이 있으면 W2 캐시로 해당 장면만 재생성 → 재렌더
```

- 병렬 작업 사이의 계약은 `docs/storyboard.md`(장면 ID·소스), `manifest.json`(장면 길이·단어 타임스탬프), `theme.ts`(디자인 토큰) 세 가지다. W1과 W2가 먼저 이것을 고정한다.
- 모든 워커는 같은 작업 공간에서 자기 폴더만 수정한다(W2: `video/tts`, W3: `video/footage.sh`와 `ios/UITests`, W4a/b: 각자 장면 파일).
- 워커 지시서에는 Jev 보조 판단 지침과 스크립트 경로(`/Users/iamchiwon/.iamchiwon/scripts/jev/decision.py`)를 넣고, API 키는 넣지 않는다.

## 6. 완료 기준

- [ ] `npx remotion render`로 최종 MP4 생성, 길이 15~20분
- [ ] 13개 장면 모두 음성이 잘리지 않고, 장면 사이 무음은 1초 이하
- [ ] 발음 사전 적용 후 영문 용어 오독 없음 (사용자 청취 확인)
- [ ] 자막이 단어 타임스탬프와 맞음
- [ ] `.env` 값이 커밋·로그·번들에 없음 (`git grep`, 번들 검색으로 확인)
- [ ] 생성물(audio, footage, out)은 git 제외, 다시 만드는 스크립트는 커밋
