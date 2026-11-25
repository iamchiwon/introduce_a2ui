# 유튜브 업로드 정보

- 영상: `video/out/introduce_a2ui.mp4` (8:20)
- 자막: `video/out/introduce_a2ui.ko.srt` (한국어, 업로드 시 "자막 > 파일 업로드 > 타이밍 포함")
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

## 업로드 전 확인

- [ ] 예제 코드 저장소(iamchiwon/introduce_a2ui)를 푸시하고 공개 상태인지 확인 (아니면 설명란에서 그 줄을 뺀다)
- [ ] 챕터 시간은 `video/public/audio/manifest.json` 기준. 영상을 다시 렌더하면 아래 명령으로 다시 뽑는다

```bash
node -e "const m=require('./video/public/audio/manifest.json');for(const s of m.scenes){const t=Math.floor(s.visualStartSec);console.log(Math.floor(t/60)+':'+String(t%60).padStart(2,'0'),s.title)}"
```
