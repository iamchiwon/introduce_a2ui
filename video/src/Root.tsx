import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  getStaticFiles,
  registerRoot,
  staticFile,
  type CalculateMetadataFunction,
} from "remotion";
import type { ComponentType } from "react";
import mock from "./mock-manifest.json";
import { Demo } from "./components/Demo";
import {
  frameAt,
  firstFrame,
  lengthFrames,
  timingFor,
  type Manifest,
  type SceneProps,
} from "./timing";
import { theme } from "./theme";
import { Thumbnail } from "./Thumbnail";
import S00 from "./scenes/S00";
import S01 from "./scenes/S01";
import S02 from "./scenes/S02";
import S03 from "./scenes/S03";
import S04 from "./scenes/S04";
import S05 from "./scenes/S05";
import S06 from "./scenes/S06";
import S07 from "./scenes/S07";
import S08 from "./scenes/S08";
import S09 from "./scenes/S09";
import S10 from "./scenes/S10";
import S11 from "./scenes/S11";
import S12 from "./scenes/S12";

const views: Record<string, ComponentType<SceneProps>> = {
  S00,
  S01,
  S02,
  S03,
  S04,
  S05,
  S06,
  S07,
  S08,
  S09,
  S10,
  S11,
  S12,
};
type Props = { manifest: Manifest; mutedPreview: boolean; solo: string };
const defaults: Props = { manifest: mock, mutedPreview: true, solo: "" };
const metadata: CalculateMetadataFunction<Props> = async ({
  props,
  abortSignal,
}) => {
  const available = getStaticFiles().some(
    (file) => file.name === "audio/manifest.json",
  );
  let manifest: Manifest = mock;
  if (available) {
    const response = await fetch(staticFile("audio/manifest.json"), {
      signal: abortSignal,
    });
    if (!response.ok) throw new Error("Audio manifest HTTP " + response.status);
    manifest = await response.json();
  }
  const scene = manifest.scenes.find((s) => s.id === props.solo);
  if (props.solo && !scene)
    throw new Error("Scene missing from audio manifest: " + props.solo);
  return {
    fps: manifest.fps,
    durationInFrames: scene
      ? lengthFrames(scene, manifest.fps)
      : frameAt(manifest.totalSec, manifest.fps),
    props: { ...props, manifest, mutedPreview: !available },
  };
};
function Film({ manifest, solo, mutedPreview }: Props) {
  const fps = manifest.fps;
  return (
    <AbsoluteFill
      style={{
        background: theme.paper,
        fontFamily: theme.sans,
        color: theme.ink,
      }}
    >
      {manifest.scenes
        .filter((s) => !solo || s.id === solo)
        .map((scene) => {
          const View = views[scene.id];
          const start = firstFrame(scene, fps);
          const audioOffset = frameAt(scene.audioStartSec, fps) - start;
          return (
            <Sequence
              key={scene.id}
              name={scene.title}
              from={solo ? 0 : start}
              durationInFrames={lengthFrames(scene, fps)}
            >
              <View scene={scene} {...timingFor(scene, fps)} />
              {!mutedPreview && (
                <Sequence from={audioOffset} layout="none">
                  <Audio src={staticFile(scene.audio)} />
                </Sequence>
              )}
            </Sequence>
          );
        })}
    </AbsoluteFill>
  );
}
export function Root() {
  const dimensions = { width: 1920, height: 1080, fps: 30 };
  return (
    <>
      {["Main", ...Object.keys(views)].map((id) => (
        <Composition
          key={id}
          id={id}
          component={Film}
          {...dimensions}
          durationInFrames={frameAt(mock.totalSec, 30)}
          defaultProps={{ ...defaults, solo: id === "Main" ? "" : id }}
          calculateMetadata={metadata}
        />
      ))}
      <Composition id="Thumbnail" component={Thumbnail} width={1280} height={720} fps={30} durationInFrames={1} />
      <Composition id="ThumbnailEn" component={Thumbnail} defaultProps={{ lang: "en" as const }} width={1280} height={720} fps={30} durationInFrames={1} />
      <Composition
        id="Components"
        component={Demo}
        {...dimensions}
        durationInFrames={120}
      />
    </>
  );
}
registerRoot(Root);
