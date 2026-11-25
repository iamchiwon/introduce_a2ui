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
  const relative = (seconds: number) =>
    frameAt(scene.audioStartSec + seconds, fps) - firstFrame(scene, fps);
  const sentenceFrame = (index: number) =>
    relative(scene.sentences[index]?.startSec ?? 0);
  const wordFrame = (text: string, fallbackSentence = 0, occurrence = 0) => {
    const matches = scene.sentences
      .flatMap((s) => s.words)
      .filter((w) => w.text.includes(text));
    const match = matches[occurrence];
    return match ? relative(match.startSec) : sentenceFrame(fallbackSentence);
  };
  return { sentenceFrame, wordFrame };
}
export type SceneProps = { scene: SceneManifest } & ReturnType<
  typeof timingFor
>;
