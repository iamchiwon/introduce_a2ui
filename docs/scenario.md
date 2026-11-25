# A2UI 소개 영상 시나리오 (iOS)

- 채널: 곰튀김
- 형식: Xcode 라이브코딩 화면 녹화 + 내레이션. 내레이션은 [narration.md](narration.md)에 따로 있고 장면 번호(S0~S12)로 대충 맞춘다. 많이 어긋나도 괜찮다.
- 예상 길이: 15~20분 (빌드·대기 구간은 빨리 감기)
- 진행 방식: 빈 Xcode 프로젝트부터 시작해서, 코드는 AI에게 말로 시키는 바이브코딩으로 만든다. 사람은 기획하고, 프롬프트를 쓰고, 결과를 확인만 한다.
- 핵심 메시지
  1. A2UI는 "UI를 데이터(JSON)로 표현하는 규격"이다. AI가 화면을 만들 수도 있고, 서버 드리븐 UI 규격으로도 쓸 수 있다.
  2. SwiftUI 렌더러가 이미 나와 있다. 패키지 추가해서 쓰면 된다.
  3. 커스텀이 필요하면 Apache License 2.0 오픈소스이니 포크해서 고치면 된다.
  4. 코딩 비용은 0에 수렴한다. 무엇을 어떻게 만들지에 시간을 쓰자.

## 완성 목표

- 앱 이름: A2UIBooking (iOS 17+, SwiftUI)
- 상단 세그먼트로 예약 입력 화면 4개 전환: 일정 / 골프 / 진료 / 항공권
- 화면은 전부 A2UI JSON(`fixtures/*.json`)으로 정의. Swift 코드에는 화면 구성이 없다.
- 하단 "Agent log"에 버튼 액션 JSON 출력 (에이전트에게 보낼 메시지)
- 참고 구현: 이 저장소의 `ios/` (`ios/App/App.swift` 약 90줄), JSON은 `fixtures/`

## 준비물

- Xcode (iOS 17 이상 시뮬레이터)
- AI 코딩 도구: Xcode에 내장된 AI 어시스턴트(Claude 계정 연결) 또는 터미널의 Claude Code. 화면이 Xcode 하나로 끝나는 내장 어시스턴트를 기본으로 하고, 안 되면 Claude Code로 대체한다.
- A2UI 저장소: https://github.com/a2ui-project/a2ui

---

## S0. 오프닝 (0:00~0:40)

- 화면: 완성된 앱이 iPhone 시뮬레이터에서 실행 중. 세그먼트를 눌러 일정 → 골프 → 진료 → 항공권으로 빠르게 전환.
- 화면: 골프 예약에서 골프장·티타임 선택 → "예약하기" → 하단 Agent log에 JSON이 찍힘.
- 화면: Xcode로 전환. 프로젝트 네비게이터에 Swift 파일 하나, JSON 파일 네 개.
- 자막: "이 화면들, SwiftUI 코드로 만든 게 아닙니다"

## S1. A2UI가 뭔가 (0:40~2:30)

- 화면: 브라우저로 GitHub `a2ui-project/a2ui` README.
- 화면: `specification/v1_0/docs/a2ui_protocol.md`에서 메시지 4종(`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`) 하이라이트.
- 화면: `catalogs/basic/v1/catalog.json`의 컴포넌트 목록 (Text, Row, Column, Card, TextField, CheckBox, ChoicePicker, Slider, DateTimeInput, Button …).
- 화면: 저장소의 `swift/` 폴더 → `A2UISwiftUI`, `BasicCatalogSwiftUI`. "SwiftUI 렌더러가 이미 있다".
- 도식(슬라이드 1장): 에이전트/서버 → A2UI JSON → MessageProcessor → SwiftUI 뷰.

## S2. 기획 (2:30~4:30)

- 화면: 메모 앱(또는 Xcode 옆 텍스트 파일)에 직접 타이핑한다. 이 장면은 AI 없이 사람이 쓴다.

```text
무엇을: 예약 입력 화면 4개 (일정 / 골프 / 진료 / 항공권)
확인할 것:
  - 입력하면 데이터가 바뀌고 화면에 다시 반영되는가 (요약 문구)
  - 필수값이 없으면 경고 + 버튼 비활성
  - 버튼을 누르면 입력값이 JSON으로 나가는가
순서:
  1. Xcode 프로젝트 + A2UI 패키지
  2. 골프 예약 JSON 하나 먼저
  3. JSON을 읽어서 그려주는 앱 코드
  4. 실행해서 확인
  5. 나머지 3개 화면은 JSON만 추가
  6. 서버 드리븐 UI처럼 JSON만 바꿔보기
```

- 포인트: 화면 하나로 끝까지 확인한 다음 넓힌다. 이 기획이 이 영상에서 사람이 하는 일의 대부분이다.

## S3. Xcode 새 프로젝트 만들기 (4:30~5:30)

- 화면: Xcode 실행 → `File > New > Project…`
- 화면: `iOS` 탭 → `App` 선택 → Next
- 화면: 옵션 입력
  - Product Name: `A2UIBooking`
  - Interface: `SwiftUI` / Language: `Swift`
  - Testing System, Storage: 기본값 또는 None
- 화면: 저장 위치 선택 → Create
- 화면: 타깃 `General > Minimum Deployments`를 `iOS 17.0`으로 설정 (A2UI Swift 패키지가 iOS 17+)
- 화면: 템플릿 그대로 ⌘R → "Hello, world!" 시뮬레이터 확인

## S4. A2UI 패키지 추가 (5:30~7:00)

- 화면: `File > Add Package Dependencies…`
- 화면: 검색창에 `https://github.com/a2ui-project/a2ui` 입력
- 화면: Dependency Rule `Up to Next Minor Version`, `0.12.0` (저장소 README 기준. 버전이 안 잡히면 `Branch: main`)
- 화면: 라이브러리 선택 → 타깃 `A2UIBooking`에 추가
  - `A2UISwiftCore` (코어: 메시지 처리, 데이터 모델)
  - `A2UISwiftUI` (SwiftUI 어댑터)
  - `BasicCatalogSwiftUI` (기본 컴포넌트의 SwiftUI 구현)
- 화면: 첫 빌드 때 빌드 플러그인(`A2UISchemaGeneratorPlugin`) 신뢰 여부를 묻는 창 → `Trust & Enable`
- 화면: 패키지 해석·빌드 진행 (빨리 감기)
- 포인트: 렌더러를 만들 필요가 없다. 패키지 추가가 끝이다.

## S5. 바이브코딩 1: 골프 예약 JSON (7:00~9:00)

- 화면: 프로젝트에 `fixtures` 그룹(폴더) 생성.
- 화면: AI 어시스턴트에 프롬프트 입력.

```text
A2UI v1.0 basic catalog로 골프 예약 입력 화면 JSON을 만들어줘.
fixtures/golf.json, 형식은 {"name","description","messages":[...]}이고
createSurface 하나에 components와 dataModel을 같이 넣어줘.
- 골프장 선택(필수), 라운드 날짜, 티타임(chips), 인원 슬라이더 1~4,
  카트/캐디 체크박스, 요청사항, 요약 문구(formatString), 예약하기 버튼
- 필수값은 @checks로 검증하고, 버튼 action.event의 context로 입력값 전부 보내줘
스펙: https://github.com/a2ui-project/a2ui 의 specification/v1_0, catalogs/basic/v1
```

- 화면: 생성된 `golf.json`을 스크롤하며 포인트 짚기
  - `{"@path": "/teeTime"}` 데이터 바인딩
  - `"@checks"` + `required` → "골프장을 선택하세요."
  - `Button.action.event.context` → 에이전트로 돌려보낼 값
- 화면: 파일 인스펙터에서 `Target Membership: A2UIBooking` 체크 확인 (번들 리소스로 들어가야 함)

## S6. 바이브코딩 2: JSON을 그리는 앱 코드 (9:00~11:00)

- 화면: AI 어시스턴트에 프롬프트 입력.

```text
A2UI Swift 패키지(A2UICore, A2UISwiftUI, BasicCatalogSwiftUI)로
번들의 fixtures/golf.json을 읽어서 화면에 그려줘.
- BasicCatalogImplementation.makeCatalog(version: .v10) 카탈로그 사용
- MessageProcessor로 messages를 순서대로 처리하고 첫 surface를 A2UISwiftUI.Surface로 표시
- processor.outboundListener로 받은 메시지를 JSON으로 바꿔서 하단 "Agent log"에 표시
- 나중에 화면이 늘어날 수 있으니 상단에 세그먼트 Picker
참고: 저장소의 swift/swiftui/README.md, swift/sample
```

- 화면: 생성된 `ContentView.swift`(또는 `App.swift`)를 훑으며 핵심 네 부분만 하이라이트
  1. `MessageProcessor(catalogs:)` 생성
  2. JSON → `MessageParser().decode` → `processor.process(message:)`
  3. `A2UISwiftUI.Surface(viewModel:catalogs:)`
  4. `processor.outboundListener` → 로그
- 포인트: 코드 어디에도 "골프장", "티타임" 같은 화면 내용이 없다.

## S7. 빌드하고 고치기 (11:00~12:00)

- 화면: ⌘R
- 화면: 빌드 에러가 나면 에러 메시지를 그대로 AI에게 붙여넣고 "고쳐줘" → 다시 ⌘R. (에러가 안 나면 이 장면은 생략)
- 포인트: 에러를 사람이 읽고 고치지 않는다. 확인만 한다.

## S8. 동작 확인 (12:00~13:30)

- 화면: 시뮬레이터에서 골프 예약 화면
  - 처음엔 "골프장을 선택하세요." 경고, 예약하기 버튼 비활성
  - 골프장, 티타임 선택 → 요약 문구 갱신 → 버튼 활성화
  - 인원 슬라이더, 체크박스 조작
  - 예약하기 → 하단 Agent log에 `golf_submit` JSON
- 화면: Agent log 확대 → `context` 안에 course, teeTime, players, cart, caddie가 들어있음
- 포인트: 데이터 바인딩, 검증, 액션은 코어 라이브러리가 처리했다. 앱 코드는 "그려라"만 했다.

## S9. 나머지 3개 화면은 JSON만 (13:30~15:00)

- 화면: AI 어시스턴트에 프롬프트 입력.

```text
golf.json과 같은 형식으로 3개 더 만들어줘.
- schedule.json: 일정 제목(필수), 종일, 시작/종료 날짜시간, 반복(chips), 알림(복수 선택), 메모
- clinic.json: 진료과(필수), 담당의, 날짜/시간, 환자 이름(필수), 연락처(정규식 검증), 증상, 개인정보 동의(필수)
- flight.json: 왕복/편도, 출발/도착(필수), 가는 날/오는 날, 승객 수, 좌석 등급
세그먼트 Picker에 4개 다 나오게 해줘.
```

- 화면: Swift 코드 변경은 Picker 목록 한 줄뿐인 것을 diff로 확인.
- 화면: ⌘R → 세그먼트로 4개 화면 전환. 진료 예약에서 연락처를 잘못 입력해 정규식 경고 표시.
- 포인트: 새 화면 = 새 JSON. UI 코드를 짜지 않는다.

## S10. 서버 드리븐 UI로 쓰기 (15:00~16:30)

- 화면: `clinic.json`의 진료과 options에 `{"value": "eye", "label": "안과"}` 추가, 버튼 문구 "예약 신청" → "진료 예약하기"로 변경.
- 화면: ⌘R → Swift 코드는 그대로인데 화면이 바뀜.
- 도식(슬라이드 1장): 서버 API가 JSON을 내려줌 → 앱은 그리기만. "앱 심사 없이 화면 변경".
- 포인트: 지금은 번들에서 읽지만, 같은 JSON을 서버에서 받으면 그대로 서버 드리븐 UI다. 자체 SDUI 포맷을 설계하고 렌더러를 만들 필요가 없다. 같은 JSON은 웹·안드로이드 렌더러에서도 쓸 수 있다.

## S11. 한계와 커스텀 (16:30~18:00)

- 화면: 메모에 테스트하며 본 점 정리
  - 쓸 수 있는 컴포넌트는 카탈로그에 있는 것뿐 (대신 안전하다)
  - 기본 컴포넌트는 iOS 기본 스타일. 디자인 시스템을 입히려면 카탈로그 구현을 바꿔야 한다
  - `formatString`에 배열 값을 넣으면 `["06:30"]`처럼 그대로 찍힌다
  - 프로토콜은 v1.0(v0.8 → v0.9 → v1.0)이지만 라이브러리 패키지는 아직 0.x라 API가 바뀔 수 있다
  - 커맨드라인 빌드 시 `-sdk iphonesimulator`를 주면 빌드 플러그인을 못 찾는다 (`-destination`만 사용)
- 화면: 저장소 `LICENSE` → "Apache License 2.0"
- 화면: GitHub Fork 버튼 → 포크한 저장소 URL로 패키지를 바꾸는 장면(시늉만)
- 포인트: 마음에 안 들면 포크해서 고치면 된다. 그 수정도 AI가 한다.

## S12. 마무리 (18:00~19:00)

- 화면: 프로젝트 네비게이터 → 사람이 쓴 것(기획 메모, 프롬프트) vs AI가 만든 것(Swift 파일 1개, JSON 4개).
- 화면: 시뮬레이터로 돌아와 4개 화면 전환.
- 자막: "코딩 비용 → 0. 무엇을, 어떻게 만들지에 시간을 쓰자"
- 엔딩: 구독/좋아요, 설명란에 저장소 링크.

---

## 촬영 준비 체크리스트

- [ ] Xcode AI 어시스턴트 로그인 상태 확인 (안 되면 Claude Code 터미널 준비)
- [ ] 시뮬레이터 미리 부팅 (첫 부팅 대기 시간 제거)
- [ ] A2UI 패키지 한 번 미리 받아두기 (촬영 때 해석 시간 단축, 촬영 본편은 새 프로젝트에서 다시 추가)
- [ ] S2 기획 메모, S5·S6·S9 프롬프트 텍스트 미리 준비 (붙여넣기용)
- [ ] AI 결과가 촬영 중에 엇나갈 때를 대비해 참고 구현 `ios/App/App.swift`, `fixtures/*.json` 준비
- [ ] S1, S10 도식 슬라이드 2장
- [ ] 설명란: https://github.com/a2ui-project/a2ui , https://a2ui.org
