import { AbsoluteFill, useCurrentFrame } from "remotion";
import schedule from "../../../fixtures/schedule.json";
import golf from "../../../fixtures/golf.json";
import clinic from "../../../fixtures/clinic.json";
import flight from "../../../fixtures/flight.json";
import { Diagram } from "../components/Diagram";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const bookings = [schedule.name, golf.name, clinic.name, flight.name];
const checks = ["입력 → 요약 갱신", "필수값 누락 → 경고 · 버튼 비활성", "제출 → 입력값 JSON"];

export default function S02({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const note = sentenceFrame(1);
  const names = wordFrame("네", 2);
  const checklist = sentenceFrame(4);
  const stages = sentenceFrame(8);

  return (
    <AbsoluteFill style={{ padding: "90px 110px", justifyContent: "center" }}>
      <section style={{ border: `2px solid ${theme.edge}`, borderRadius: 28, overflow: "hidden", maxWidth: 1510 }}>
        <header style={{ padding: "22px 50px", background: theme.canvas, color: theme.muted, fontSize: 25, fontWeight: 700 }}>기획 메모</header>
        <div style={{ padding: 50, minHeight: 480 }}>
          <h1 style={{ fontSize: 64, margin: "0 0 36px", letterSpacing: "-0.045em" }}>
            {frame >= stages ? "작업 순서" : frame >= checklist ? "확인할 동작" : "예약 입력 화면"}
          </h1>
          {frame >= stages ? (
            <Diagram nodes={[
              { label: "프로젝트 · 패키지", from: sentenceFrame(9) },
              { label: "골프 예약 검증", from: sentenceFrame(10) },
              { label: "세 화면 추가", from: sentenceFrame(11) },
            ]} />
          ) : frame >= checklist ? (
            checks.map((label, index) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 20, padding: "19px 0",
                borderTop: `1px solid ${theme.edge}`, fontSize: 34, opacity: reveal(frame, sentenceFrame(5 + index)) }}>
                <span style={{ color: theme.accent, fontWeight: 750 }}>✓</span>{label}
              </div>
            ))
          ) : (
            <div style={{ display: "flex", gap: 14 }}>
              {bookings.map((label, index) => {
                const budget = Math.floor((frame - Math.max(note, names) - index * 8) / 2);
                return (
                  <div key={label} style={{ opacity: reveal(frame, names + index * 8), padding: "15px 20px",
                    minWidth: 162, borderRadius: 9, background: theme.wash, color: theme.accent, fontSize: 30, fontWeight: 650 }}>
                    {label.slice(0, Math.max(0, budget))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AbsoluteFill>
  );
}
