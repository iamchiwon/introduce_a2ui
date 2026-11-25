# Fish Audio 내레이션 및 자막

Node.js 24 이상과 `ffprobe`가 필요합니다. 저장소 루트 `.env`에 `FISH_AUDIO_API_KEY`와 `VOICE_ID`를 설정한 뒤 다음 명령을 실행합니다.

```sh
node video/tts/build.mjs --dry-run       # 전체 대본의 발음 치환과 잔존 토큰 확인
node video/tts/build.mjs --scene S00     # 오프닝 샘플 생성
node video/scripts/srt.mjs              # 현재 manifest로 한국어 SRT 생성
node video/tts/build.mjs                 # 청취 검수 후 전체 장면 생성
node video/tts/build.mjs --timeline-only # storyboard 변경 후 기존 manifest의 시간만 재계산
```

발음을 수정하려면 `pronunciation.json`을 바꿉니다. TTS 텍스트·모델·음성의 해시가 일치하는 장면은 `video/public/audio/`의 MP3와 단어 타임스탬프를 재사용합니다. 장면 하나를 지정해도 유효한 다른 캐시는 manifest에 포함됩니다. SRT는 `video/out/introduce_a2ui.ko.srt`에 저장됩니다.

Fish Audio의 단어 정렬과 대본의 글자가 다르면 정렬이 일치하는 콘텐츠 청크 경계를 기준으로 글자 수 비율을 적용합니다. 청크 경계도 식별할 수 없으면 장면 전체를 기준으로 보정합니다. 긴 자막을 나눌 때 발음 치환 때문에 원문과 발음 텍스트의 경계가 다르면 주변 어절을 찾거나 글자 수 비율로 단어 시간을 추정합니다. 이 경우 자막과 강조 타이밍에 오차가 생길 수 있습니다. [Fish Audio 타임스탬프 API](https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech-stream-with-timestamps)
