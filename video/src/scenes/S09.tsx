import { AbsoluteFill, Freeze, Sequence, getStaticFiles, useCurrentFrame } from "remotion";
import schedule from "../../../fixtures/schedule.json";
import clinic from "../../../fixtures/clinic.json";
import flight from "../../../fixtures/flight.json";
import app from "../../../ios/App/App.swift";
import scheduleShot from "../../../ios/screenshots/schedule.png";
import golfShot from "../../../ios/screenshots/golf.png";
import clinicShot from "../../../ios/screenshots/clinic.png";
import flightShot from "../../../ios/screenshots/flight.png";
import { CodeBlock } from "../components/CodeBlock";
import { IdeMock } from "../components/IdeMock";
import { Simulator } from "../components/Simulator";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const specs = [
  { file: "schedule.json", fixture: schedule, requirements: "제목 · 종일 · 시작/종료 · 반복 · 알림 · 메모" },
  { file: "clinic.json", fixture: clinic, requirements: "진료과 · 담당의 · 일시 · 환자 · 연락처 · 증상 · 동의" },
  { file: "flight.json", fixture: flight, requirements: "왕복/편도 · 출발/도착 · 일자 · 승객 · 좌석 등급" },
];
const requiredFields = specs.map(({ fixture }) =>
  fixture.messages[0].createSurface.components.flatMap((component) => {
    if (!("label" in component) || !component.label || !("@checks" in component)) return [];
    const required = component["@checks"]?.find(({ condition }) => "@call" in condition && condition["@call"] === "required");
    if (!required || !("args" in required.condition)) return [];
    const field = {
      id: component.id,
      label: component.label,
      "@checks": [{ condition: required.condition }],
    };
    return [JSON.stringify(field, null, 2)
      .replace(/"args": \{\s*"value": \{\s*"@path": ("[^"]+")\s*\}\s*\}/, '"args": { "value": { "@path": $1 } }')];
  }),
);
const cases = app.split("\n").find((line) => line.startsWith("let cases =")) ?? "";
const phone = clinic.messages[0].createSurface.components.find(({ id }) => id === "phone");
const phoneCheck = phone?.["@checks"]?.[0];
const pattern = phoneCheck?.condition && "args" in phoneCheck.condition
  ? (phoneCheck.condition.args as { pattern?: string } | undefined)?.pattern : "";
const regex = JSON.stringify({ "@call": "regex", args: { pattern } }, null, 2);
const footage = "s09_all";
const screenShots = [scheduleShot, golfShot, clinicShot, flightShot];

function TourClip({ start, end, duration }: { start: number; end: number; duration: number }) {
  return <Simulator footage={footage} height={874} startFrom={start}
    playbackRate={(end - start) / duration} />;
}

export default function S09({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const request = sentenceFrame(1);
  const swift = wordFrame("목록", 2);
  const tour = sentenceFrame(3);
  const enter = sentenceFrame(5);
  const warning = Math.max(enter + 1, wordFrame("경고", 6));
  const declaration = Math.max(warning + 1, wordFrame("정규", 6));
  const tourSpan = tour - swift;
  const showSwift = frame >= swift;
  const generated = request + Math.round((swift - request) * 0.42);
  const activeTab = Math.min(2, Math.max(0, Math.floor(3 * (frame - generated) / Math.max(1, swift - generated))));
  const typedLength = Math.floor(3 * reveal(frame, request, Math.max(1, generated - request)));
  const hasFootage = getStaticFiles().some(({ name }) => name === `footage/${footage}.mp4`);
  const typeDigits = enter + Math.round((warning - enter) * 0.43);
  const closeKeyboard = enter + Math.round((warning - enter) * 0.79);
  // Trim the waits for the keyboard and after typing.
  const clips = [
    { cue: tour, next: enter, start: 4, end: 178 },
    { cue: enter, next: typeDigits, start: 178, end: 270 },
    { cue: typeDigits, next: closeKeyboard, start: 472, end: 555 },
    { cue: closeKeyboard, next: warning, start: 596, end: 632 },
  ];
  const tourScreen = Math.min(3, Math.max(0, Math.floor(4 * (frame - tour) / Math.max(1, enter - tour))));

  if (frame < tour) {
    return (
      <AbsoluteFill style={{ padding: "98px 96px", justifyContent: "flex-start" }}>
        <IdeMock
          files={["질문", "golf.json", ...(frame >= generated ? specs.map(({ file }) => file) : []), ...(showSwift ? ["App.swift"] : [])]}
          active={showSwift ? "App.swift" : frame >= generated ? specs[activeTab].file : "질문"}>
          <div style={{ padding: "48px 38px", minHeight: 675 }}>
            <h1 style={{ fontSize: 57, margin: "0 0 35px", letterSpacing: "-0.045em" }}>
              {showSwift ? "세그먼트 목록" : frame >= generated ? "필수 입력 필드" : "예약 화면 세 가지 추가"}
            </h1>
            {showSwift ? (
              <CodeBlock code={cases} highlightLines={[1]} highlightFrom={swift}
                fontSize={32} typeFrom={swift} charsPerFrame={cases.length / Math.max(1, tourSpan * 0.16)} />
            ) : frame >= generated ? (
              <>
                <CodeBlock lang="json" code={requiredFields[activeTab][0]} fontSize={25}
                  highlightLines={[7]} />
                {requiredFields[activeTab].length > 1 ? (
                  <div style={{ fontSize: 24, color: theme.muted, margin: "18px 12px 0" }}>
                    {specs[activeTab].fixture.name} · 필수 입력 항목 {requiredFields[activeTab].length}개
                  </div>
                ) : null}
              </>
            ) : (
              <div style={{ display: "grid", gap: 18 }}>
                {specs.map(({ file, requirements }, index) => (
                  <div key={file} style={{ opacity: index <= typedLength ? reveal(frame, request) : 0,
                    background: theme.canvas, borderRadius: 12, padding: "17px 22px", display: "flex",
                    gap: 26, alignItems: "center" }}>
                    <span style={{ font: `24px ${theme.mono}`, minWidth: 207, color: theme.accent }}>{file}</span>
                    <span style={{ fontSize: 27 }}>{requirements}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </IdeMock>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ padding: "70px 96px", flexDirection: "row", alignItems: "center", gap: 105 }}>
      <div style={{ width: 610, height: 940, display: "grid", placeItems: "center",
        background: theme.canvas, borderRadius: 32, flexShrink: 0 }}>
        {hasFootage ? (
          <>
            {clips.map(({ cue, next, start, end }) => next > cue ? (
              <Sequence key={start} from={cue} durationInFrames={next - cue} layout="none">
                <TourClip start={start} end={end} duration={next - cue} />
              </Sequence>
            ) : null)}
            {frame >= warning ? <Freeze frame={0}><Simulator footage={footage} startFrom={638} height={874} /></Freeze> : null}
          </>
        ) : <Simulator screenshot={frame >= enter ? clinicShot : screenShots[tourScreen]} height={874} />}
      </div>
      <section style={{ flex: 1, minWidth: 0, alignSelf: "flex-start", paddingTop: 220, minHeight: 660 }}>
        <div style={{ color: theme.accent, font: `26px ${theme.mono}` }}>{frame < enter ? "App.swift" : "clinic.json"}</div>
        <h1 style={{ fontSize: 71, margin: "18px 0 34px", letterSpacing: "-0.05em" }}>
          {frame < enter ? "네 가지 화면" : "연락처 검증"}
        </h1>
        {frame < enter ? (
          <div style={{ fontSize: 33, color: theme.muted }}>일정 · 골프 · 진료 · 항공권</div>
        ) : (
          <div style={{ border: `2px solid ${theme.edge}`, borderRadius: 18, padding: "26px 30px", background: theme.canvas }}>
            <div style={{ fontSize: 30, color: frame >= warning ? theme.warning : theme.ink, fontWeight: 650 }}>
              {frame >= warning ? phoneCheck?.message : "연락처 입력"}
            </div>
            {frame >= declaration ? <div style={{ marginTop: 19 }}>
              <CodeBlock lang="json" code={regex} fontSize={25} highlightLines={[4]} highlightFrom={declaration} />
            </div> : null}
          </div>
        )}
      </section>
    </AbsoluteFill>
  );
}
