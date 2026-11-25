# A2UI 소개 영상 스토리보드

1920×1080, 30fps. 화이트 바탕에 짙은 잉크색 본문, 청록색 강조 한 곳을 쓴다. 표의 인용구는 편집자가 음성을 찾는 단서다. 화면에는 파일명, 코드, 도식 라벨과 실제 앱 UI를 쓴다. 내레이션 자막은 별도 SRT로 제공한다. 각 행은 위에서 아래로 재생한다. minSec는 편집상 최소 길이이며 실제 경계는 음성 manifest가 정한다.

## S00 · 오프닝 · minSec 14

| 내레이션 큐 | 화면 비트 |
|---|---|
| 음성 전 2초 → “네 개 있습니다” | 첫 프레임부터 폰을 보여준다. 일정 → 골프 → 진료 → 항공권 전환을 따라 선택된 세그먼트를 강조한다. |
| “버튼이 막히기도” | 골프 제출과 하단 로그를 확대한다. |
| “Swift 파일은 하나뿐” → “전부 JSON” | 폰 옆 파일 트리에 App.swift 한 줄, 네 fixture 파일을 차례로 펼친다. 마지막에 골프 파일로 초점을 옮긴다. |

소스는 footage/s00_tour.mp4, ios/App/App.swift, fixtures/*.json. 강조어는 **네 개**, **Swift**, **JSON**.

## S01 · A2UI가 뭔가 · minSec 18

| 내레이션 큐 | 화면 비트 |
|---|---|
| “1.0” → “줄임말” | 저장소명과 v1.0 표식 옆에서 A2UI를 Agent to User Interface로 펼친다. |
| “화면을 만들어라”부터 “지워라”까지 | createSurface → updateComponents → updateDataModel → deleteSurface를 해당 동사에 맞춰 한 장씩 보인다. |
| “카탈로그” → “패키지만” | Text, ChoicePicker, Button을 골프 입력과 대응시킨 후 서버/에이전트 → JSON → MessageProcessor → SwiftUI 도식을 완성한다. |

소스는 vendor/a2ui/specification/v1_0/, vendor/a2ui/catalogs/basic/v1/, fixtures/golf.json, ios/screenshots/golf.png. 강조어는 **데이터**, **카탈로그**, **렌더러**.

## S02 · 기획 · minSec 12

| 내레이션 큐 | 화면 비트 |
|---|---|
| “제가 직접 씁니다” → “네 개” | 메모에 일정·골프·진료·항공권을 입력한다. |
| “확인할 건 세 가지” | 입력과 요약, 필수값 경고, 제출 JSON을 세 줄 체크 항목으로 만든다. |
| “순서도 정했습니다” | 프로젝트·패키지 → 골프 검증 → 세 화면 확장을 차례로 연결한다. |

소스는 docs/scenario.md S2의 기획 메모, fixtures/*.json의 name. 강조어는 **입력**, **필수값**, **JSON**.

## S03 · 새 프로젝트 · minSec 9

| 내레이션 큐 | 화면 비트 |
|---|---|
| “새 프로젝트” → “이름은” | 단순화한 IDE의 새 프로젝트 카드에서 iOS App을 선택하고 SwiftUI와 A2UIBooking을 채운다. |
| “최소 배포 버전” | 설정 행의 iOS 17.0을 강조한다. |
| “헬로 월드” | 실행 상태가 완료로 바뀌며 미리보기 캔버스에 Hello, world!가 뜬다. |

소스는 docs/scenario.md S3, ios/project.yml의 deploymentTarget. 강조어는 **SwiftUI**, **A2UIBooking**, **17**. 프로젝트명은 대본의 실습용 이름을 쓴다.

## S04 · 패키지 추가 · minSec 12

| 내레이션 큐 | 화면 비트 |
|---|---|
| “저장소 주소” | IDE의 간략한 의존성 입력란에 https://github.com/a2ui-project/a2ui 를 입력한다. |
| “라이브러리는 세 개” | A2UISwiftCore, A2UISwiftUI, BasicCatalogSwiftUI를 역할 순서로 선택한다. |
| “플러그인” → “패키지 추가로 끝” | 스키마 생성 플러그인 허용 → 빌드 완료 → 패키지 트리 세 항목을 유지한다. |

소스는 ios/project.yml, vendor/a2ui/Package.swift. 강조어는 **코어**, **어댑터**, **기본 컴포넌트**.

## S05 · 골프 예약 JSON · minSec 18

| 내레이션 큐 | 화면 비트 |
|---|---|
| “어떤 입력이 필요한지” | IDE 질문 패널에 S5 프롬프트를 입력한다. 폴더에 golf.json 탭이 열린다. |
| “선택지” → “체크박스” | 생성된 원본 JSON에서 각 컴포넌트 조각과 골프 스크린샷의 필드를 대응시킨다. |
| “데이터 경로” → “검증” → “버튼” | tee의 value.@path, course의 @checks, 제출 버튼의 action.event.context 순으로 좁혀 읽는다. |
| “앱 번들” | 파일 트리에서 fixtures 그룹을 리소스 목록에 연결한다. |

소스는 docs/scenario.md S5 프롬프트, fixtures/golf.json, ios/screenshots/golf.png, ios/project.yml. 강조어는 **@path**, **@checks**, **context**.

## S06 · JSON을 그리는 앱 코드 · minSec 18

| 내레이션 큐 | 화면 비트 |
|---|---|
| “흐름으로 처리” | IDE에서 S6 프롬프트의 처리 흐름을 입력하고 App.swift 탭을 연다. |
| “네 군데” | 원본에서 MessageProcessor(catalogs:) → MessageParser().decode와 process → A2UISwiftUI.Surface → outboundListener를 각각 가까이 잡는다. |
| “그냥 받은 걸 그릴 뿐” | 코드 오른쪽 입력 카드를 골프에서 진료로 교체하고 같은 Surface 호출을 유지한다. |

소스는 docs/scenario.md S6 프롬프트, ios/App/App.swift 원본, fixtures/golf.json과 clinic.json. 강조어는 **프로세서**, **서피스**, **로그**.

## S07 · 빌드하고 고치기 · minSec 6

| 내레이션 큐 | 화면 비트 |
|---|---|
| “실행해 보겠습니다” | 프로젝트 카드의 실행 표시가 빌드 → 실행 순으로 지나간다. |
| “에러가 나면” → “다시 실행” | 조건부 흐름을 작은 도식으로 표시한다. 오류 발생 → 메시지 전달 → 수정 → 재실행. 실제 오류 로그는 발생했을 때만 쓴다. |
| “확인만” | 골프 초기 화면을 펼쳐 S08 실사로 이어간다. |

소스는 ios/project.yml, ios/screenshots/golf.png. 강조어는 **실행**, **에러가 나면**, **확인**.

## S08 · 동작 확인 · minSec 20

| 내레이션 큐 | 화면 비트 |
|---|---|
| “아무것도 안 골랐으니” | 실사에서 필수 경고와 비활성 버튼을 잡는다. |
| “골프장을 고르고” → “체크박스” | 실제 선택 순서에 맞춰 골프장·티타임, 요약 갱신, 인원과 체크 상태를 따라간다. |
| “예약하기” → “golf_submit” | 제출 직후 Agent log를 확대하고 context에서 선택된 값들을 읽을 시간을 준다. |
| “라이브러리가” | 마지막 실사 프레임 곁에 입력 → 검증 → 액션 도식을 완성한다. |

소스는 footage/s08_golf.mp4, fixtures/golf.json, ios/screenshots/golf_action.png. 강조어는 **필수**, **요약**, **golf_submit**.

## S09 · 세 화면 추가 · minSec 17

| 내레이션 큐 | 화면 비트 |
|---|---|
| “같은 형식으로” | IDE 질문 패널에 일정·진료·항공권 조건을 입력한다. 각 fixture 탭이 생기고 생성 JSON의 필수 필드를 짧게 펼친다. |
| “세그먼트 목록” | App.swift의 cases 행에서 추가된 세 이름을 강조한다. |
| “넘겨 보겠습니다” → “형식 경고” | 실사 네 화면을 전환한 뒤 진료 연락처 오류에 멈춘다. 해당 regex 선언을 옆에 붙인다. |

소스는 docs/scenario.md S9 프롬프트, fixtures/{schedule,clinic,flight}.json, ios/App/App.swift, footage/s09_all.mp4. 강조어는 **같은 형식**, **목록**, **정규식**.

## S10 · 서버 드리븐 UI · minSec 17

| 내레이션 큐 | 화면 비트 |
|---|---|
| “하나의 규격” → “안과” | 진료과 옵션 원본과 변경 조각을 나란히 놓고 eye/안과 추가를 표시한다. |
| “버튼 문구” → “다시 실행” | 예약 신청 → 진료 예약하기 변경을 보여준다. 동일한 폰 위치에서 before와 after 실사를 전환한다. |
| “서버에서 받아오면” → “웹이나 안드로이드” | JSON 출처를 번들에서 서버 API로 바꾸고 같은 렌더러에 연결한다. 마지막에 플랫폼 라벨을 확장한다. |

소스는 fixtures/clinic.json, footage/s10_before.mp4, footage/s10_after.mp4. 강조어는 **안과**, **진료 예약하기**, **서버**.

## S11 · 한계와 커스텀 · minSec 14

| 내레이션 큐 | 화면 비트 |
|---|---|
| “카탈로그에 있는 것” → “디자인 시스템” | 카탈로그 카드에서 허용된 타입을 펼치고 SwiftUI 구현에 초점을 옮긴다. |
| “대괄호” → “0점대” | 골프 요약의 티타임 배열을 확대하고 프로토콜 1.0과 패키지 0.x를 두 행으로 구분한다. |
| “Apache” → “포크” | 저장소 LICENSE 헤더를 보여주고 원본 → 포크 → 패키지 주소 교체 순서로 도식을 닫는다. |

소스는 fixtures/golf.json, ios/screenshots/golf_action.png, vendor/a2ui/LICENSE, vendor/a2ui/Package.swift. 강조어는 **카탈로그**, **대괄호**, **Apache 2.0**, **포크**.

## S12 · 마무리 · minSec 10

| 내레이션 큐 | 화면 비트 |
|---|---|
| “제가 직접 쓴 건” → “AI가 만들었습니다” | 기획 메모·프롬프트 옆에 App.swift와 네 JSON의 파일 트리를 펼친다. |
| “화면은 데이터로” → “무엇을 어떻게” | 일정·골프·진료·항공권 스크린샷을 차례로 배열해 같은 코드가 그린 결과를 보여준다. |
| “설명란” → 마지막 음성 뒤 5초 | 마지막 화면에 저장소명 a2ui-project/a2ui를 두고 현재 구도를 고정한다. |

소스는 docs/scenario.md, ios/App/App.swift, fixtures/*.json, ios/screenshots/{schedule,golf,clinic,flight}.png. 강조어는 **기획**, **프롬프트**, **무엇을 어떻게**.

## 장면 구현 가이드

- 각 장면은 `video/src/scenes/Sxx.tsx`에서 기본 내보내기 한다. `SceneProps`는 `../timing`에서 가져온다. 각자 맡은 장면 안에서 비트를 조합한다. 제목 카드는 본편에 시간을 추가하지 않고 필요한 장면의 기존 시간 안에서 쓴다.
- `useCurrentFrame()`은 장면 Sequence 시작 기준이다. `sentenceFrame(0)`은 첫 문장, `wordFrame('골프장', 2, 0)`은 첫 일치 단어의 장면 프레임을 준다. 두 번째 인자는 일치하지 않을 때 쓸 문장 인덱스이고 세 번째는 0부터 세는 일치 순번이다. Fish가 발음형 단어를 제공하므로 실제 manifest의 words.text를 확인하고 발견하기 어려운 용어는 문장 큐를 지정한다. 장면 안에서 중첩 Sequence를 쓰면 내부 프레임은 다시 0부터 센다.
- 전체 경계와 음성 배치는 Root가 manifest의 절대 시간으로 계산한다. 개별 장면 파일에는 Audio를 넣지 않는다. mock은 무음 편집용 추정 타임스탬프다. 장면 안쪽 비트도 분 단위 시나리오 시각 대신 문장·단어 큐에 맞춘다.
- 공용 컴포넌트는 `../components/이름`에서 이름으로 import한다. `IdeMock`에 files, active, children을 전달한다. IDE는 프로젝트 트리·탭·편집 영역만 그린다. `CodeBlock`의 lang은 swift/json/text, typeFrom과 highlightFrom은 프레임, highlightLines는 표시하는 코드의 1번 줄부터 센다. 한 화면에는 해당 호출 주변의 줄만 넣는다.
- `JsonHighlight`의 data는 원본 JSON 객체, path는 RFC 6901 포인터다. 예를 들어 golf.json 전체와 `/messages/0/createSurface/components/3/value`를 전달하면 course의 바인딩과 앞뒤 context 줄을 표시한다. `Diagram nodes={[{label:'JSON',from:0},{label:'SwiftUI',from:15}]}`처럼 등장 프레임을 지정한다. `Title`은 title과 선택적 label을 받는다.
- 장면 파일에서 원본을 직접 가져온다. 예를 들어 `import app from '../../../ios/App/App.swift'`는 문자열, `import golf from '../../../fixtures/golf.json'`은 객체, `import shot from '../../../ios/screenshots/golf.png'`는 번들 URL이다. `<Simulator screenshot={shot}/>` 또는 `<Simulator footage="s08_golf"/>`로 표시한다. startFrom은 원본에서 건너뛸 프레임이다. 실사 구간은 public/footage/index.json의 durationSec와 실제 조작 시점을 확인해 Sequence로 자른다. 긴 설명 구간은 선택 결과 스크린샷이나 코드로 이어간다.
- `cd video && npm install && npm run studio`에서 Main, S00~S12, Components를 선택한다. `npx remotion still S08 out/stills/S08.png --frame=90`은 장면의 3초 지점, `npx remotion render S08 out/S08.mp4`는 단독 렌더다. `npx tsc --noEmit`으로 원본 import와 장면 인터페이스를 검증한다.
- S00 샘플만 있는 부분 manifest로는 Main과 S00에서 샘플 음성을 확인할 수 있다. 나머지 장면의 무음 목업 검수는 `mkdir -p out/mock-public` 후 `npx remotion studio --public-dir=out/mock-public`으로 연다. 단독 still에도 같은 옵션을 쓸 수 있다.
