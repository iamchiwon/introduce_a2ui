# 유튜브 업로드 정보

- 영상: `video/out/introduce_a2ui.mp4` (8:20)
- 자막: `video/out/introduce_a2ui.ko.srt`(한국어), `video/out/introduce_a2ui.en.srt`(영어). 올리는 방법은 아래 "자막·번역 올리는 방법"
- 재생목록: 잔머리는 삶의 지혜 (Tricks make wisdom)
- 썸네일: [thumbnail/thumbnail.png](thumbnail/thumbnail.png) (1280×720, 재생목록 양식). 이전 시안은 [thumbnail/alt-generic.png](thumbnail/alt-generic.png)

## 제목

추천:

> iOS 서버 드리븐 UI, 이제 공짜입니다 | A2UI 1.0

다른 후보:

- UI 코드, 이제 안 짭니다 | A2UI 1.0으로 iOS 앱 바이브코딩
- 앱 배포 없이 iOS 화면 바꾸기, 공짜로 | A2UI 1.0
- SwiftUI 코드 없이 화면 4개 만들기 | A2UI 1.0 소개
- 화면은 JSON, 코드는 AI가 | A2UI로 서버 드리븐 UI 만들기
- 구글 A2UI 1.0 써봤습니다 | Xcode 빈 프로젝트부터 바이브코딩까지

## 설명란

아래를 그대로 붙여 넣는다.

```text
UI를 코드가 아니라 데이터(JSON)로 표현하는 오픈소스 규격, A2UI가 1.0이 됐습니다.
빈 Xcode 프로젝트에서 시작해서, AI에게 말로 시키는 바이브코딩으로 예약 입력 화면 4개(일정·골프·진료·항공권)를 만들어 봤습니다.
Swift 코드는 파일 하나, 화면은 전부 JSON입니다.

이 영상에서 다루는 것
- A2UI가 뭔지: 메시지 몇 가지와 컴포넌트 카탈로그로 UI를 표현하는 방식
- Xcode에 A2UI Swift 패키지 추가하고 SwiftUI로 렌더링하기
- 데이터 바인딩(@path), 입력 검증(@checks), 버튼 액션이 JSON 선언만으로 동작하는 모습
- 앱 코드를 건드리지 않고 화면을 바꾸는 서버 드리븐 UI로 쓰기
- 아직 남은 한계와, 오픈소스(Apache 2.0)라서 포크해서 고쳐 쓰는 방법

코딩 비용은 0에 가까워지고 있습니다. 이제 코딩같은거 하는데 시간 쓰지 말고, 무엇을 어떻게 만들지 고민하는 데 시간을 더 써 봅시다.

📌 링크
A2UI 저장소: https://github.com/a2ui-project/a2ui
A2UI 문서: https://a2ui.org
이 영상의 예제 코드: https://github.com/iamchiwon/introduce_a2ui

⏱ 챕터
0:00 오프닝
0:42 A2UI가 뭔가
1:45 기획: 무엇을 만들까
2:27 Xcode 새 프로젝트
2:49 A2UI 패키지 추가
3:23 바이브코딩 1: 골프 예약 JSON
4:12 바이브코딩 2: JSON을 그리는 앱 코드
4:49 빌드하고 고치기
4:59 동작 확인
5:37 나머지 화면은 JSON만
6:04 서버 드리븐 UI로 쓰기
6:52 한계와 커스텀
7:38 마무리

#A2UI #SwiftUI #iOS개발 #바이브코딩 #서버드리븐UI
```

## 태그

A2UI, Agent to User Interface, SwiftUI, iOS 개발, Xcode, 바이브코딩, vibe coding, 서버 드리븐 UI, Server Driven UI, 생성형 UI, Generative UI, AI 에이전트, 곰튀김

## English (영어 제목·설명)

제목:

> iOS Server-Driven UI, Now for Free | A2UI 1.0

설명:

```text
A2UI, an open-source standard for describing UI as data (JSON) instead of code, just hit 1.0.
Starting from an empty Xcode project, I vibe-coded four booking screens (schedule, golf, clinic, flight) by simply telling AI what to build.
One Swift file. Every screen is JSON.

What this video covers
- What A2UI is: describing UI with a handful of messages and a component catalog
- Adding the A2UI Swift package in Xcode and rendering with SwiftUI
- Data binding (@path), validation (@checks), and button actions working from JSON declarations alone
- Using it as server-driven UI: change screens without touching app code
- Current limits, and forking it since it's open source (Apache 2.0)

The cost of coding is approaching zero. Stop spending time on things like coding, and spend more time thinking about what to build and how.

📌 Links
A2UI repository: https://github.com/a2ui-project/a2ui
A2UI docs: https://a2ui.org
Example code from this video: https://github.com/iamchiwon/introduce_a2ui

⏱ Chapters
0:00 Intro
0:42 What is A2UI
1:45 Planning: what to build
2:27 New Xcode project
2:49 Adding the A2UI package
3:23 Vibe coding 1: golf booking JSON
4:12 Vibe coding 2: app code that draws JSON
4:49 Build and fix
4:59 Checking it works
5:37 The other screens are just JSON
6:04 Using it as server-driven UI
6:52 Limits and customization
7:38 Wrap-up

#A2UI #SwiftUI #iOSDev #VibeCoding #ServerDrivenUI
```

## 자막·번역 올리는 방법 (YouTube Studio, PC)

1. **영상 언어 지정**: 콘텐츠 → 영상 선택 → 세부정보 → 하단 "더보기"의 "언어 및 자막 인증"에서 **동영상 언어: 한국어**로 저장한다. 번역 제목·자막은 이 원래 언어를 기준으로 붙는다.
2. **한국어 자막**: 왼쪽 메뉴 **자막** → 한국어 행의 자막 "추가" → **파일 업로드 → 타이밍 포함** → `video/out/introduce_a2ui.ko.srt`
3. **영어 자막**: 같은 화면에서 **언어 추가 → 영어** → 자막 "추가" → 파일 업로드(타이밍 포함) → `video/out/introduce_a2ui.en.srt` → 게시
4. **영어 제목·설명**: 영어 행의 **제목 및 설명** 열에서 "추가" → 위 English 섹션의 제목과 설명을 붙여 넣고 게시. 해외 시청자에게는 이 제목·설명이 보인다.

영어 자막을 다시 만들 때는 `node video/scripts/srt-translate.mjs en`을 실행한다. 번역문은 `docs/narration.en.json`에 있고, 대본(narration.md)이 바뀌어 원문과 다르면 스크립트가 실패하며 해당 문장 ID를 알려준다. 다른 언어는 같은 형식으로 `docs/narration.<언어>.json`을 만들고 `srt-translate.mjs <언어>`를 실행한다.

## 음성 더빙 (YouTube 기능)

YouTube에는 두 가지 방식이 있다. 메뉴 이름과 자격 조건은 바뀌므로 Studio 화면과 도움말로 확인한다.

**A. 자동 더빙 (AI가 번역 음성을 만들어 줌)**

- 도움말: https://support.google.com/youtube/answer/15569972
- 자격: 채널에 기능이 열려 있어야 한다(주로 YouTube 파트너 프로그램 채널). 지원 언어 목록은 자주 바뀌므로 Studio에서 한국어 원본이 지원되는지 확인한다.
- 켜기: Studio **설정 → 업로드 기본 설정 → 고급 설정**에서 자동 더빙을 켜면 이후 업로드에 적용된다.
- 확인: 업로드 후 영상의 **언어** 페이지에서 생성된 더빙 트랙을 미리 듣고, 마음에 들지 않는 언어는 게시 전에 삭제한다. 자동 더빙 트랙은 설명에 "자동 더빙" 표시가 붙는다.
- 주의: 용어(A2UI, SwiftUI, @path) 발음과 목소리 품질은 직접 들어보고 결정한다.

**B. 직접 만든 더빙 업로드 (다국어 오디오 트랙)**

- 도움말: https://support.google.com/youtube/answer/13338784
- 자격: 기능이 채널에 열려 있어야 한다. 없으면 업로드 메뉴가 보이지 않는다.
- 방법: Studio 영상의 **언어** 페이지 → 언어 추가(영어) → **더빙** "추가" → 오디오 파일 업로드 → 게시. 오디오 길이는 영상과 같아야 한다.
- 이 프로젝트로 만들 수 있다: Fish Audio(같은 목소리)로 `narration.en.json`의 영어 문장을 생성하고, 장면별로 원래 한국어 구간 길이에 맞춰 배치해 영상 길이(8:20)와 같은 오디오 파일을 만든다. 영어가 한국어보다 길면 그 장면만 말 속도를 조금 올리거나 문장을 줄여야 한다.

## 업로드 전 확인

- [ ] 예제 코드 저장소(iamchiwon/introduce_a2ui)를 푸시하고 공개 상태인지 확인 (아니면 설명란에서 그 줄을 뺀다)
- [ ] 챕터 시간은 `video/public/audio/manifest.json` 기준. 영상을 다시 렌더하면 아래 명령으로 다시 뽑는다

```bash
node -e "const m=require('./video/public/audio/manifest.json');for(const s of m.scenes){const t=Math.floor(s.visualStartSec);console.log(Math.floor(t/60)+':'+String(t%60).padStart(2,'0'),s.title)}"
```
