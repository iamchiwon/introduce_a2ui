import { AbsoluteFill, Freeze, Sequence, getStaticFiles, useCurrentFrame } from "remotion";
import clinic from "../../../fixtures/clinic.json";
import { CodeBlock } from "../components/CodeBlock";
import { Diagram } from "../components/Diagram";
import { Simulator } from "../components/Simulator";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const components = clinic.messages[0].createSurface.components;
const dept = components.find(({ id }) => id === "dept");
const options = dept && "options" in dept ? dept.options : [];
const original = components.find(({ id }) => id === "submit_label");
const buttonText = original && "text" in original ? original.text : "";
const addedOption = { value: "eye", label: "안과" };
const revisedText = "진료 예약하기";
const optionLine = ({ value, label }: { value: string; label: string }) =>
  `  { "value": ${JSON.stringify(value)}, "label": ${JSON.stringify(label)} }`;
const originalOptions = (options ?? []).map(optionLine);
const footageFiles = ["s10_before", "s10_after"] as const;
const phoneHeight = 740;
const buttonFrame = 126;

function ClinicClip({ footage, start, end, length }: {
  footage: string; start: number; end: number; length: number;
}) {
  return <Simulator footage={footage} height={phoneHeight} startFrom={start}
    playbackRate={(end - start) / length} />;
}

function DiffCard({ label, code, highlightLines }: { label: string; code: string; highlightLines: number[] }) {
  return (
    <div style={{ border: `2px solid ${theme.edge}`, borderRadius: 23, overflow: "hidden" }}>
      <div style={{ background: theme.canvas, padding: "20px 28px", fontSize: 26, fontWeight: 750 }}>{label}</div>
      <div style={{ padding: "24px 18px" }}>
        <CodeBlock lang="json" code={code} highlightLines={highlightLines} fontSize={25} />
      </div>
    </div>
  );
}

export default function S10({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const spec = wordFrame("규격", 1);
  const eye = wordFrame("안과", 2);
  const button = wordFrame("버튼", 2);
  const run = sentenceFrame(4);
  const bundle = wordFrame("번들", 5);
  const api = wordFrame("서버", 5);
  const driven = wordFrame("드리", 5, 1);
  const renderer = wordFrame("스위프트", 8, 1);
  const platforms = sentenceFrame(10);
  const comparisonSpan = bundle - run;
  const scroll = run + Math.round(comparisonSpan * 0.37);
  const hold = run + Math.round(comparisonSpan * 0.59);
  const zoom = reveal(frame, hold, 12);
  const clips = [
    { cue: run, next: scroll, start: 14, end: 75 },
    { cue: scroll, next: hold, start: 75, end: buttonFrame },
  ];
  const hasFootage = footageFiles.every((file) =>
    getStaticFiles().some(({ name }) => name === `footage/${file}.mp4`),
  );

  if (frame >= bundle) {
    return (
      <AbsoluteFill style={{ padding: "72px 96px", justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: theme.accent, font: `27px ${theme.mono}` }}>clinic.json</div>
        <h1 style={{ margin: "20px 0 55px", fontSize: 79, letterSpacing: "-0.055em" }}>JSON을 가져오는 곳</h1>
        <Diagram nodes={[
          { label: frame >= api ? "서버 API" : "앱 번들", from: frame >= api ? api : bundle },
          { label: "A2UI JSON", from: bundle },
          { label: "SwiftUI 렌더러", from: bundle },
        ]} />
        <div style={{ display: "flex", gap: 14, minHeight: 70, marginTop: 38 }}>
          <div style={{ opacity: reveal(frame, Math.max(api, driven), 15), color: theme.accent,
            background: theme.wash, fontSize: 30, borderRadius: 15, padding: "18px 28px" }}>
            서버 드리븐 UI
          </div>
          {frame >= renderer && frame < platforms ? (
            <div style={{ color: theme.accent, font: `26px ${theme.mono}`, padding: "18px 16px",
              opacity: reveal(frame, renderer) }}>A2UISwiftUI</div>
          ) : null}
          {frame >= platforms ? (
            <div style={{ opacity: reveal(frame, platforms, 15), color: theme.accent,
              background: theme.wash, fontSize: 30, borderRadius: 15, padding: "18px 28px" }}>
              같은 JSON으로 웹 · Android
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    );
  }

  const showComparison = frame >= run && hasFootage;
  const showButton = frame >= button;
  const clipLabel = (before: boolean) => before ? "변경 전" : "변경 후";
  const displayedOptions = (after: boolean) =>
    ['"options": [', ...originalOptions, ...(after ? [optionLine(addedOption)] : [])]
      .map((line, i, lines) => i >= 1 && i < lines.length - 1 ? line + "," : line).concat("]").join("\n");

  return (
    <AbsoluteFill style={{ padding: "66px 96px 50px", justifyContent: "flex-start" }}>
      <header style={{ minHeight: 139 }}>
        <div style={{ color: theme.accent, font: `27px ${theme.mono}`, marginBottom: 14,
          opacity: frame < spec ? 1 : reveal(frame, spec, 9) * 0.32 + 0.68 }}>A2UI · clinic.json</div>
        <h1 style={{ margin: 0, fontSize: 59, letterSpacing: "-0.05em" }}>
          {showComparison ? "시뮬레이터에서 확인" : "진료 예약 JSON 변경"}
        </h1>
      </header>
      {showComparison ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 80 }}>
          {footageFiles.map((footage, i) => (
            <div key={footage} style={{ display: "grid", justifyItems: "center", gap: 10,
              width: 620, background: theme.canvas, borderRadius: 25, padding: "12px 0" }}>
              <div style={{ fontSize: 28, fontWeight: 750, color: i ? theme.accent : theme.muted }}>{clipLabel(i === 0)}</div>
              <div style={{ width: "100%", height: phoneHeight + 18, display: "grid", placeItems: "center", overflow: "hidden" }}>
                {clips.map(({ cue, next, start, end }) => next > cue ? (
                  <Sequence key={start} from={cue} durationInFrames={next - cue} layout="none">
                    <ClinicClip footage={footage} start={start} end={end} length={next - cue} />
                  </Sequence>
                ) : null)}
                {frame >= hold ? (
                  <div style={{ transform: `scale(${1 + 1.05 * zoom})`, transformOrigin: "35% 67%" }}>
                    <Freeze frame={0}><Simulator footage={footage} startFrom={buttonFrame} height={phoneHeight} /></Freeze>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <DiffCard label="변경 전" code={showButton ? JSON.stringify({ text: buttonText }, null, 2) : displayedOptions(false)}
            highlightLines={[]} />
          <div style={{ opacity: reveal(frame, eye) }}>
            <DiffCard label="변경 후" code={showButton ? JSON.stringify({ text: revisedText }, null, 2) : displayedOptions(true)}
              highlightLines={showButton ? [2] : [originalOptions.length + 2]} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}
