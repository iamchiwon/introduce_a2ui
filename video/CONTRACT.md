# video/ 작업 계약 (워커 공통)

이 파일은 병렬 워커들이 서로 맞춰야 하는 인터페이스다. 바꿔야 하면 직접 고치지 말고 코디네이터에게 ask 한다.

## 공통 사실
- 저장소 루트: /Users/iamchiwon/study/ai/a2ui (git, 브랜치 main). **워커는 커밋하지 않는다.** 코디네이터가 커밋한다.
- 계획: docs/PLAN.md, 시나리오: docs/scenario.md, 내레이션: docs/narration.md, 발음 사전: video/tts/pronunciation.json
- 결정 사항: 1920x1080, 30fps, 화이트 톤, 영상 안 자막 없음(SRT 파일만), BGM·인트로·아웃트로 없음, Fish Audio 모델 s2.1-pro, 음성은 영상 시작 2초 뒤 시작, 마지막 음성 종료 5초 뒤 영상 종료.
- 생성물(git 제외): video/public/audio/, video/public/footage/, video/out/
- 비밀값: 저장소 루트 .env (FISH_AUDIO_API_KEY, VOICE_ID). TTS 스크립트만 읽는다. 값을 출력·로그·파일·Remotion 번들에 남기지 않는다.

## 장면 ID
narration.md의 `## S0.` ~ `## S12.` 헤딩 → 장면 ID `S00` ~ `S12` (두 자리).

## video/storyboard.json (W1 작성, W2가 읽음)
```json
{ "scenes": { "S00": { "title": "오프닝", "minSec": 8 }, "S01": { "title": "...", "minSec": 0 } } }
```
- minSec: 화면 연출에 필요한 최소 장면 길이(초). 음성이 더 길면 음성 길이를 따른다. 없으면 0.

## video/public/audio/manifest.json (W2 생성, W1/W4가 읽음)
```json
{
  "model": "s2.1-pro", "fps": 30, "leadInSec": 2, "gapSec": 0.8, "tailSec": 5,
  "totalSec": 1012.4,
  "scenes": [
    {
      "id": "S00", "title": "오프닝",
      "audio": "audio/S00.mp3",
      "visualStartSec": 0, "audioStartSec": 2, "audioDurationSec": 31.2, "visualEndSec": 34.0,
      "sentences": [
        { "text": "원문 문장 (A2UI 표기)", "tts": "발음 텍스트", "startSec": 0.0, "endSec": 2.4,
          "words": [ { "text": "...", "startSec": 0.0, "endSec": 0.3 } ] }
      ]
    }
  ]
}
```
- 모든 sentences/words 시간은 **해당 장면 오디오 시작 기준**(audioStartSec 기준 상대 시간). 절대 시간 = audioStartSec + startSec.
- 타임라인 공식 (단일 출처, W2가 계산):
  - S00: visualStartSec = 0, audioStartSec = leadInSec(2)
  - 장면 i>0: visualStartSec = audioStartSec = max(이전 장면 audio 끝 + gapSec, 이전 장면 visualStartSec + 이전 장면 minSec)
  - 장면 i의 visualEndSec = 다음 장면 visualStartSec, 마지막 장면은 audio 끝 + tailSec
  - totalSec = 마지막 장면 visualEndSec
- Remotion(W1)은 이 값을 그대로 쓴다(프레임 = round(sec * fps)). 자체 계산하지 않는다.
- manifest가 없을 때 Remotion은 video/src/mock-manifest.json(W1 작성, 같은 스키마)로 동작한다.

## 자막
- video/scripts/srt.mjs (W2): manifest → video/out/introduce_a2ui.ko.srt. 문구는 sentences[].text(원문). 시간은 절대 시간. 한 큐 최대 2줄, 줄당 약 20자.

## 실사 영상 (W3 생성, W4가 읽음)
- video/public/footage/<name>.mp4, 목록과 길이는 video/public/footage/index.json: `{ "<name>": { "durationSec": 12.3, "width": 1179, "height": 2556, "note": "무엇을 하는 장면" } }`
- 필요 목록: s00_tour(4화면 전환 + 골프 제출), s08_golf(골프 조작·검증·제출·로그), s09_all(4화면 전환 + 진료 연락처 정규식 경고), s10_before(진료 원본), s10_after(진료과 '안과' 추가·버튼 문구 변경본)
