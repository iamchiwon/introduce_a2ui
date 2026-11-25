# A2UI 소개 영상 썸네일

- 추천안: `thumbnail.png` (유일한 시안)
- 배경 이미지 모델: `gpt-image-2.5-flare` (OpenAI Image API, `image_gen.py` CLI)
- 배경 프롬프트: Clean white YouTube thumbnail background illustration. On the right, a modern iPhone displaying a simple reservation form with abstract blank UI controls. A floating JSON-like arrangement of colored code marks transforms into the form, with a subtle directional flow. Leave the entire left half almost blank white for a large title. Bright white studio lighting, polished minimal technology editorial style, blue accents, 16:9 framing. No text, no letters, no numbers, no watermark.
- 배경 원본: `bg.png` (1536×1024). 제목과 배지는 Remotion에서 합성한다.

재생성 (저장소의 `video` 디렉터리에서):

```sh
npx remotion still Thumbnail ../docs/thumbnail/thumbnail.png
```
