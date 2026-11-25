import { AbsoluteFill, Freeze, Sequence, getStaticFiles, useCurrentFrame } from "remotion";
import golf from "../../../fixtures/golf.json";
import golfShot from "../../../ios/screenshots/golf.png";
import actionShot from "../../../ios/screenshots/golf_action.png";
import { CodeBlock } from "../components/CodeBlock";
import { Diagram } from "../components/Diagram";
import { Simulator } from "../components/Simulator";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const footage = "s08_golf";
const submit = golf.messages[0].createSurface.components.find(({ id }) => id === "submit");
const eventName = submit?.action?.event?.name ?? "";
// These are the selected values displayed in the recording's Agent log.
const context = '{\n  "course": ["skyhill"],\n  "teeTime": ["06:30"],\n  "players": 3,\n  "cart": false\n}';

function GolfClip({ start, end, frames }: { start: number; end: number; frames: number }) {
  return <Simulator footage={footage} height={870} startFrom={start}
    playbackRate={(end - start) / frames} />;
}

export default function S08({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const required = sentenceFrame(1);
  const course = sentenceFrame(2);
  const players = sentenceFrame(3);
  const courseSpan = players - course;
  const summary = Math.min(players - 1, Math.max(course + Math.round(courseSpan * 0.35), wordFrame("요약", 2)));
  const book = sentenceFrame(4);
  const log = Math.max(wordFrame("golf_submit", 5), wordFrame("서브", 5));
  const flow = sentenceFrame(7);
  const validate = Math.max(flow, wordFrame("검증", 7));
  const action = Math.max(validate, wordFrame("액션", 7));
  // Source positions are 30 fps recording frames, split where the UI changes.
  const clips = [
    { cue: 0, next: required, start: 0, end: 29 },
    { cue: required, next: course, start: 29, end: 121 },
    { cue: course, next: summary, start: 121, end: 215 },
    { cue: summary, next: players, start: 215, end: 233 },
    { cue: players, next: book, start: 233, end: 313 },
    { cue: book, next: log, start: 313, end: 364 },
    { cue: log, next: flow, start: 364, end: 426 },
  ];
  const hasFootage = getStaticFiles().some(({ name }) => name === `footage/${footage}.mp4`);
  const zoom = frame < flow ? reveal(frame, book, 15) : 0;
  const title = frame >= flow ? "입력에서 액션까지"
    : frame >= book ? "예약 제출"
    : frame >= players ? "인원과 옵션"
    : frame >= course ? "골프장과 티타임"
    : "필수 입력 확인";

  return (
    <AbsoluteFill style={{ padding: "70px 96px", flexDirection: "row", alignItems: "center", gap: 112 }}>
      <div style={{ width: 608, height: 940, display: "grid", placeItems: "center", position: "relative",
        flexShrink: 0, background: theme.canvas, borderRadius: 32, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-97 * zoom}px) scale(${1 + 0.32 * zoom})`, transformOrigin: "center bottom" }}>
          {hasFootage ? (
            <>
              {clips.map(({ cue, next, start, end }) => next > cue ? (
                <Sequence key={start} from={cue} durationInFrames={next - cue} layout="none">
                  <GolfClip start={start} end={end} frames={next - cue} />
                </Sequence>
              ) : null)}
              {frame >= flow ? <Freeze frame={0}><Simulator footage={footage} startFrom={426} height={870} /></Freeze> : null}
            </>
          ) : <Simulator screenshot={frame >= book ? actionShot : golfShot} height={870} />}
        </div>
      </div>

      <section style={{ flex: 1 }}>
        <div style={{ color: theme.accent, font: `26px ${theme.mono}` }}>golf.json</div>
        <h1 style={{ fontSize: 72, margin: "16px 0 28px", letterSpacing: "-0.055em" }}>{title}</h1>
        {frame >= flow ? (
          <Diagram nodes={[
            { label: "입력", from: flow },
            { label: "검증", from: validate },
            { label: "액션", from: action },
          ]} />
        ) : frame >= book ? (
          <div style={{ border: `2px solid ${theme.edge}`, borderRadius: 22, padding: "26px 28px",
            opacity: reveal(frame, book) }}>
            <div style={{ font: `25px ${theme.mono}`, color: theme.muted }}>Agent log</div>
            <div style={{ font: `42px ${theme.mono}`, color: theme.accent, margin: "12px 0 24px" }}>{eventName}</div>
            <div style={{ opacity: reveal(frame, log, 12) }}>
              <div style={{ marginBottom: 8, font: `24px ${theme.mono}` }}>context</div>
              {hasFootage ? <CodeBlock lang="json" code={context} highlightLines={[4, 5]} highlightFrom={log} fontSize={30} /> : null}
            </div>
          </div>
        ) : (
          <div style={{ padding: "22px 28px", borderRadius: 18, background: theme.canvas,
            fontSize: 35, fontWeight: 650, color: frame < course ? theme.warning : theme.accent }}>
            {frame >= players ? "인원 · 카트 사용"
              : frame >= summary ? "요약 갱신 · 예약 활성화"
              : frame >= course ? "골프장 · 티타임"
              : "골프장 필수 · 예약 비활성화"}
          </div>
        )}
      </section>
    </AbsoluteFill>
  );
}
