import { AbsoluteFill, useCurrentFrame } from "remotion";
import schedule from "../../../fixtures/schedule.json";
import golf from "../../../fixtures/golf.json";
import clinic from "../../../fixtures/clinic.json";
import flight from "../../../fixtures/flight.json";
import scheduleShot from "../../../ios/screenshots/schedule.png";
import golfShot from "../../../ios/screenshots/golf.png";
import clinicShot from "../../../ios/screenshots/clinic.png";
import flightShot from "../../../ios/screenshots/flight.png";
import { Simulator } from "../components/Simulator";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const screens = [
  { file: "schedule.json", name: schedule.name, shot: scheduleShot },
  { file: "golf.json", name: golf.name, shot: golfShot },
  { file: "clinic.json", name: clinic.name, shot: clinicShot },
  { file: "flight.json", name: flight.name, shot: flightShot },
];

export default function S12({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const memo = wordFrame("기획", 1);
  const prompt = wordFrame("프롬프트", 1);
  const generated = sentenceFrame(2);
  const grid = sentenceFrame(4);
  const goal = sentenceFrame(6);
  const decide = wordFrame("무엇", 6);
  const repo = sentenceFrame(8);

  if (frame < grid) {
    return (
      <AbsoluteFill style={{ padding: "72px 96px", justifyContent: "center" }}>
        <h1 style={{ fontSize: 76, margin: "0 0 42px", letterSpacing: "-0.05em" }}>앱이 만들어지기까지</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
          <section style={{ border: `2px solid ${theme.edge}`, borderRadius: 24, padding: 34 }}>
            <h2 style={{ fontSize: 40, margin: "0 0 26px" }}>사람이 쓴 것</h2>
            <div style={{ opacity: reveal(frame, memo), background: theme.canvas, padding: "21px 24px", borderRadius: 12, marginBottom: 16 }}>
              <strong style={{ fontSize: 28 }}>기획 메모</strong>
              <div style={{ fontSize: 25, marginTop: 8, color: theme.muted }}>예약 화면 네 개, 하단에 Agent log</div>
            </div>
            <div style={{ opacity: reveal(frame, prompt), background: theme.canvas, padding: "21px 24px", borderRadius: 12 }}>
              <strong style={{ fontSize: 28 }}>프롬프트</strong>
              <div style={{ fontSize: 25, marginTop: 8, color: theme.muted }}>번들의 fixtures/golf.json을 읽어서 화면에 그려줘.</div>
            </div>
          </section>
          <section style={{ opacity: reveal(frame, generated), border: `2px solid ${theme.edge}`, borderRadius: 24, padding: 34 }}>
            <h2 style={{ fontSize: 40, margin: "0 0 26px" }}>AI가 만든 것</h2>
            <div style={{ font: `26px ${theme.mono}`,
              background: theme.wash, color: theme.accent, padding: "15px 22px", borderRadius: 12 }}>
              App.swift
            </div>
            <div style={{ margin: "16px 0 0 8px", font: `22px ${theme.mono}`, color: theme.muted }}>fixtures/</div>
            <div style={{ marginTop: 12, marginLeft: 23, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {screens.map(({ file }) => (
                <span key={file} style={{ font: `24px ${theme.mono}`, padding: "10px 14px", background: theme.canvas, borderRadius: 9 }}>
                  {file}
                </span>
              ))}
            </div>
          </section>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ padding: "48px 96px 32px", alignItems: "center" }}>
      <h1 style={{ fontSize: 68, letterSpacing: "-0.05em", margin: "0 0 24px",
        opacity: frame < goal ? reveal(frame, grid, 12) : 1 }}>하나의 렌더러, 네 가지 화면</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 38, width: "100%" }}>
        {screens.map(({ file, name, shot }, i) => {
          const start = grid + Math.round((goal - grid) * i * 0.16);
          const progress = reveal(frame, start, Math.max(1, Math.round((goal - grid) * 0.10)));
          return (
            <div key={file} style={{ display: "grid", justifyItems: "center", gap: 16, opacity: progress,
              transform: `translateY(${12 * (1 - progress)}px)` }}>
              <Simulator screenshot={shot} height={690} />
              <div style={{ fontSize: 29, fontWeight: 700 }}>{name}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20, display: "grid", justifyItems: "center", gap: 12, color: theme.accent }}>
        <div style={{ opacity: reveal(frame, decide, 14), padding: "8px 18px", borderRadius: 12,
          background: theme.wash, fontSize: 26, fontWeight: 700 }}>무엇을 어떻게</div>
        <div style={{ opacity: reveal(frame, repo, 14), font: `28px ${theme.mono}` }}>a2ui-project/a2ui</div>
      </div>
    </AbsoluteFill>
  );
}
