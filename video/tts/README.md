# Fish Audio 내레이션 및 자막

Node.js 24 이상과 `ffmpeg`·`ffprobe`가 필요합니다. 저장소 루트 `.env`에 `FISH_AUDIO_API_KEY`와 `VOICE_ID`를 설정한 뒤 다음 명령을 실행합니다.

```sh
node video/tts/build.mjs --dry-run       # 전체 대본의 발음 치환과 잔존 토큰 확인
node video/tts/build.mjs --scene S00     # 오프닝 샘플 생성
node video/tts/build.mjs --force S12     # S12 캐시를 무시하고 해당 장면 재생성
node video/scripts/srt.mjs              # 현재 manifest로 한국어 SRT 생성
node video/tts/build.mjs                 # 청취 검수 후 전체 장면 생성
node video/tts/build.mjs --timeline-only # storyboard 변경 후 기존 manifest의 시간만 재계산
```

발음을 수정하려면 `pronunciation.json`을 바꿉니다. TTS 텍스트·모델·음성의 해시가 일치하는 장면은 `video/public/audio/`의 MP3와 단어 타임스탬프를 재사용합니다. 장면 하나를 지정해도 유효한 다른 캐시는 manifest에 포함됩니다. SRT는 `video/out/introduce_a2ui.ko.srt`에 저장됩니다.

마지막 단어 뒤 오디오가 1.5초를 넘거나, 문장 사이 공백이 3초를 넘거나, 문장 길이가 0.3초 미만이거나, 초당 한글 음절이 9.5개를 넘으면 대상 장면을 최대 3회 재시도합니다. 검사에는 시간이 배정된 단어를 사용합니다. 재시도 후에도 검사에 통과하지 못하면 종료 코드 1을 반환합니다.

타임라인은 각 MP3의 앞 무음(`leadSilenceSec`)을 측정해 재생 시작을 앞당깁니다. 첫 장면의 발화는 영상 시작 2초 뒤에 시작하고, 다음 발화까지의 기본 간격은 이전 오디오 파일 종료 후 0.6초입니다. 자막은 한 큐에 최대 두 줄을 사용하고 한 어절만 남거나 0.7초보다 짧으면 인접 큐와 합치거나 나누는 위치를 조정합니다.

Fish Audio의 단어 정렬과 대본의 글자가 다르면 정렬이 일치하는 콘텐츠 청크 경계를 기준으로 글자 수 비율을 적용합니다. 청크 경계도 식별할 수 없으면 장면 전체를 기준으로 보정합니다. 긴 자막을 나눌 때 발음 치환 때문에 원문과 발음 텍스트의 경계가 다르면 주변 어절을 찾거나 글자 수 비율로 단어 시간을 추정합니다. 이 경우 자막과 강조 타이밍에 오차가 생길 수 있습니다. [Fish Audio 타임스탬프 API](https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech-stream-with-timestamps)
