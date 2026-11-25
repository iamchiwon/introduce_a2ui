import mock from "./mock-manifest.json";

export type Manifest = typeof mock;
export type SceneManifest = Manifest["scenes"][number];
export const frameAt = (seconds: number, fps: number) =>
  Math.round(seconds * fps);
export const firstFrame = (scene: SceneManifest, fps: number) =>
  frameAt(scene.visualStartSec, fps);
export const lengthFrames = (scene: SceneManifest, fps: number) =>
  frameAt(scene.visualEndSec, fps) - firstFrame(scene, fps);
export function timingFor(scene: SceneManifest, fps: number) {
  const words = scene.sentences.flatMap((sentence) => sentence.words);
  const reportedMisses = new Set<string>();
  const relative = (seconds: number) =>
    frameAt(scene.audioStartSec + seconds, fps) - firstFrame(scene, fps);
  const sentenceFrame = (index: number) =>
    relative(scene.sentences[index]?.startSec ?? 0);
  const wordFrame = (text: string | readonly string[], fallbackSentence = 0, occurrence = 0) => {
    const alternatives = typeof text === "string" ? [text] : text;
    const match = words.filter((word) => alternatives.some((part) => word.text.includes(part)))[occurrence];
    if (match) return relative(match.startSec);

    const cue = `"${alternatives.join(" / ")}" occurrence ${occurrence}, fallback sentence ${fallbackSentence}`;
    if (!reportedMisses.has(cue)) {
      console.warn(`[${scene.id}] Missing word cue ${cue}`);
      reportedMisses.add(cue);
    }
    return sentenceFrame(fallbackSentence);
  };
  return { sentenceFrame, wordFrame };
}
export type SceneProps = { scene: SceneManifest } & ReturnType<
  typeof timingFor
>;
