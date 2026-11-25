import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Freeze,
  getStaticFiles,
  interpolate,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import schedule from "../../../fixtures/schedule.json";
import golf from "../../../fixtures/golf.json";
import clinic from "../../../fixtures/clinic.json";
import flight from "../../../fixtures/flight.json";
import scheduleShot from "../../../ios/screenshots/schedule.png";
import golfShot from "../../../ios/screenshots/golf.png";
import actionShot from "../../../ios/screenshots/golf_action.png";
import clinicShot from "../../../ios/screenshots/clinic.png";
import flightShot from "../../../ios/screenshots/flight.png";
import { Simulator } from "../components/Simulator";
import { CodeBlock } from "../components/CodeBlock";
import { JsonHighlight } from "../components/JsonHighlight";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const screens = [
  { file: "schedule.json", name: schedule.name, screenshot: scheduleShot },
  { file: "golf.json", name: golf.name, screenshot: golfShot },
  { file: "clinic.json", name: clinic.name, screenshot: clinicShot },
  { file: "flight.json", name: flight.name, screenshot: flightShot },
];
const footage = "s00_tour";
const footageIndex = "footage/index.json";

function useTourDuration() {
  const [duration, setDuration] = useState<number>();
  const { delayRender, continueRender, cancelRender } = useDelayRender();

  useEffect(() => {
    const files = getStaticFiles();
    if (!files.some((file) => file.name === footageIndex)
      || !files.some((file) => file.name === `footage/${footage}.mp4`)) return;

    const handle = delayRender("Reading the opening footage index");
    fetch(staticFile(footageIndex))
      .then(async (response) => {
        if (!response.ok) throw new Error(`Footage index HTTP ${response.status}`);
        const index: Record<string, { durationSec: number }> = await response.json();
        setDuration(index[footage]?.durationSec);
        continueRender(handle);
      })
      .catch(cancelRender);
  }, [delayRender, continueRender, cancelRender]);

  return duration;
}

export default function S00({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = useTourDuration();
  const footageCues = [
    0, wordFrame("골프", 2), wordFrame("진료", 2), wordFrame("항공권", 2),
    wordFrame("막히", 3), wordFrame("만든", 4), wordFrame("하나", 5),
  ].reduce<number[]>((ordered, cue, index) => {
    ordered.push(Math.max(cue, (ordered[index - 1] ?? -1) + 1));
    return ordered;
  }, []);
  const [submit, log, code] = footageCues.slice(4);
  const fixtures = wordFrame("전부", 6);
  const focus = sentenceFrame(7);
  const zoom = frame < code ? reveal(frame, submit, 22) : 0;
  const active = frame >= submit ? 1 : footageCues.slice(0, 4).filter((cue) => frame >= cue).length - 1;
  const showTree = frame >= code;
  const showFixture = frame >= focus;
  const shot = frame >= log && !showTree ? actionShot : screens[active].screenshot;
  // Source positions follow the simulator recording. Narration cues control the edit.
  const sourceFrame = duration
    ? Math.round(interpolate(
        frame,
        footageCues,
        [0, 1.43, 2.63, 3.93, 5.13, 10.10, duration].map((position) => Math.min(
          position * fps, Math.round(duration * fps) - 1,
        )),
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      ))
    : undefined;

  return (
    <AbsoluteFill style={{ padding: "72px 96px", flexDirection: "row", alignItems: "center", gap: 110 }}>
      <div style={{
        width: 610, height: 936, flexShrink: 0, overflow: "hidden",
        display: "grid", placeItems: "center", background: theme.canvas, borderRadius: 32,
      }}>
        <div style={{ transform: `translateY(${-150 * zoom}px) scale(${1 + 0.36 * zoom})`, transformOrigin: "center bottom" }}>
          {sourceFrame === undefined
            ? <Simulator screenshot={shot} height={842} />
            : <Freeze frame={sourceFrame}><Simulator footage={footage} height={842} /></Freeze>}
        </div>
      </div>
      <section style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: theme.accent, font: `26px ${theme.mono}`, marginBottom: 16 }}>a2ui-project/a2ui</div>
        <h1 style={{ fontSize: 76, margin: "0 0 40px", letterSpacing: "-0.055em" }}>
          {showTree ? "화면을 정의하는 파일" : frame >= submit ? "예약 제출" : "예약 화면"}
        </h1>
        {showTree ? (
          <div style={{ border: `2px solid ${theme.edge}`, borderRadius: 22, padding: "24px 28px" }}>
            <div style={{ background: theme.canvas, borderRadius: 8, padding: "15px 20px", font: `25px ${theme.mono}` }}>
              App.swift
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 18 }}>
              {screens.map(({ file }, index) => (
                <div key={file} style={{ opacity: reveal(frame, fixtures + 6 * index),
                  background: showFixture && file === "golf.json" ? theme.wash : theme.canvas,
                  color: showFixture && file === "golf.json" ? theme.accent : theme.ink,
                  borderRadius: 8, padding: "14px 16px", font: `23px ${theme.mono}` }}>
                  {file}
                </div>
              ))}
            </div>
            {showFixture ? <div style={{ paddingTop: 20 }}>
              <JsonHighlight data={golf} path="/name" context={1} fontSize={22} highlightFrom={focus} />
            </div> : null}
          </div>
        ) : frame >= submit ? (
          <div style={{ minHeight: 300, boxSizing: "border-box", padding: 26, background: theme.canvas, borderRadius: 18 }}>
            <div style={{ color: theme.muted, fontSize: 25, marginBottom: 12 }}>Agent log</div>
            {frame >= log ? (
              <CodeBlock lang="json" fontSize={26} code={JSON.stringify({ action: { name: golf.messages[0].createSurface.components.find((part) => part.id === "submit")?.action?.event.name } }, null, 2)} />
            ) : (
              <div style={{ color: theme.muted, font: `24px ${theme.mono}` }}>(no actions yet)</div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {screens.map(({ name }, index) => (
              <div key={name} style={{ background: index === active ? theme.wash : theme.canvas,
                color: index === active ? theme.accent : theme.muted,
                border: `2px solid ${index === active ? theme.accent : theme.edge}`,
                borderRadius: 13, padding: "22px 25px", fontSize: 31, fontWeight: 650 }}>
                {name}
              </div>
            ))}
          </div>
        )}
      </section>
    </AbsoluteFill>
  );
}
