# introduce_a2ui

[A2UI](https://github.com/a2ui-project/a2ui)(Agent to User Interface)를 직접 써 보고, 그 내용을 소개하는 영상을 만드는 프로젝트입니다.

목적은 두 가지입니다.

1. **A2UI 테스트**: 같은 A2UI JSON으로 정의한 예약 입력 화면 4종을 세 플랫폼(TUI, Web, iOS)에서 렌더링하고, 데이터 바인딩·입력 검증·액션 전달이 동작하는지 확인한다.
2. **소개 영상 제작**: 곰튀김 채널용 A2UI 소개 영상을 모션그래픽 기반으로, 코드로 만든다. (진행 예정)

## 구조

| 경로 | 내용 |
|---|---|
| `fixtures/` | 예약 입력 화면 A2UI v1.0 메시지 4종 (일정, 골프, 진료, 항공권). 세 렌더러가 공통으로 쓴다 |
| `tui/` | React Ink 렌더러 (`@a2ui/web_core` + `@a2ui/react` 컴포넌트 구현 위에 Ink 뷰) |
| `web/` | React + Tailwind CSS + shadcn/ui 렌더러 (`@a2ui/react`, shadcn 커스텀 카탈로그) |
| `ios/` | SwiftUI 렌더러 (A2UI Swift 패키지의 `BasicCatalogSwiftUI`, XcodeGen) |
| `docs/` | 영상 시나리오(`scenario.md`)와 내레이션 대본(`narration.md`) |
| `vendor/a2ui` | A2UI 원본 저장소 (git submodule). iOS 앱이 로컬 Swift 패키지로 참조한다 |

## 시작하기

```bash
git clone --recursive https://github.com/iamchiwon/introduce_a2ui.git
cd introduce_a2ui
```

이미 clone했다면 `git submodule update --init`으로 `vendor/a2ui`를 받는다.

### fixture 검증

```bash
cd tui && npm install
node validate.mjs   # 4종 모두 @a2ui/web_core MessageProcessor로 처리되는지 확인
```

### TUI

```bash
cd tui
npm install
npm start -- golf   # schedule | golf | clinic | flight, 생략하면 메뉴
npm test            # 4개 화면 스냅샷(screens/*.txt), 검증, 액션 출력 확인
```

Tab/Shift+Tab 이동, ←/→ 선택지·슬라이더·날짜, Space 선택, Enter 버튼.

### Web

```bash
cd web
npm install
npm run dev
npm run e2e         # 빌드 후 Playwright로 screenshots/*.png 생성
```

### iOS

```bash
cd ios
./run.sh            # xcodegen → 빌드 → 시뮬레이터 스크린샷(screenshots/*.png) → UI 테스트
```

Xcode, XcodeGen(`brew install xcodegen`), iOS 17 이상 시뮬레이터(스크립트 기본값 iPhone 16 Pro)가 필요하다. Xcode에서 열려면 `xcodegen generate` 후 `A2UIRenderer.xcodeproj`를 연다.

## 테스트에서 확인한 것

세 플랫폼 모두 4개 화면을 렌더링하고, 아래 동작을 자동 테스트로 확인했다.

- 입력 → data model 갱신 → `formatString` 요약 문구 갱신
- `@checks` 실패 시 메시지 표시, 버튼 비활성
- 버튼 클릭 시 action(event name + context)이 Agent log에 JSON으로 출력

발견한 이슈와 한계:

- `@a2ui/react`의 `A2uiSurface`는 DOM(custom element)에 의존해서 Ink에서 쓸 수 없다. TUI는 컴포넌트 트리를 직접 순회해 그린다 (처음 그린 뒤 들어오는 `updateComponents`는 반영하지 않음).
- `@a2ui/react` 0.16.1에는 React용 기본 컴포넌트 세트가 없다. Web은 shadcn으로 카탈로그 구현을 직접 연결했다.
- `formatString`이 배열 값(ChoicePicker)을 `["06:30"]`처럼 JSON 그대로 넣는다.
- `sendDataModel: true`여도 action 이벤트에는 data model이 붙지 않는다 (전송 계층에서 붙이는 구조로 보임).
- iOS를 커맨드라인으로 빌드할 때 `-sdk iphonesimulator`를 주면 빌드 플러그인(`A2UISchemaGenerator`)을 찾지 못한다. `-destination`만 쓴다.
- 프로토콜은 v1.0이지만 라이브러리 패키지는 아직 0.x다.

## 소개 영상

- 대상: iOS. 빈 Xcode 프로젝트에서 시작해 AI 바이브코딩으로 A2UI 앱을 만드는 과정을 보여준다.
- 시나리오: [docs/scenario.md](docs/scenario.md)
- 내레이션: [docs/narration.md](docs/narration.md)
- 영상은 모션그래픽 기반으로 코드로 만들 예정이다. 도구와 구성은 아직 정하지 않았다.

## 라이선스

A2UI는 [Apache License 2.0](https://github.com/a2ui-project/a2ui/blob/main/LICENSE)이다.
