import { AbsoluteFill, useCurrentFrame } from "remotion";
import pkg from "../../../vendor/a2ui/Package.swift";
import { IdeMock } from "../components/IdeMock";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const projectName = "A2UIBooking";
const minimumIOS = pkg.match(/\.iOS\(\.v(\d+)\)/)?.[1] + ".0";

export default function S03({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const platform = sentenceFrame(1);
  const swiftUI = wordFrame("SwiftUI", 1);
  const name = sentenceFrame(2);
  const target = sentenceFrame(3);
  const run = sentenceFrame(4);
  const hello = wordFrame("헬로", 4);
  const active = frame >= run ? "미리보기" : frame >= target ? "프로젝트 설정" : "새 프로젝트";
  const fields = [
    { label: "템플릿", value: "iOS App", from: platform },
    { label: "인터페이스", value: "SwiftUI", from: swiftUI },
    { label: "프로젝트 이름", value: projectName, from: name },
    { label: "최소 배포 버전", value: `iOS ${minimumIOS}`, from: target },
  ];

  return (
    <AbsoluteFill style={{ padding: "90px 104px", justifyContent: "center" }}>
      <IdeMock title={frame >= name ? projectName : "프로젝트"} files={["새 프로젝트", "프로젝트 설정", "미리보기"]} active={active}>
        <div style={{ minHeight: 540, padding: "30px 46px" }}>
          {frame < run ? (
            <>
              <h1 style={{ fontSize: 56, margin: "0 0 28px", letterSpacing: "-0.04em" }}>{active}</h1>
              {fields.map(({ label, value, from }) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "250px 1fr", alignItems: "center",
                  padding: "17px 24px", marginBottom: 12, borderRadius: 10, opacity: reveal(frame, from),
                  background: frame >= target && from === target ? theme.wash : theme.canvas }}>
                  <span style={{ fontSize: 29, color: theme.muted }}>{label}</span>
                  <span style={{ font: `31px ${theme.mono}`, color: from === target ? theme.accent : theme.ink }}>{value}</span>
                </div>
              ))}
            </>
          ) : (
            <section style={{ border: `2px solid ${theme.edge}`, borderRadius: 20, overflow: "hidden" }}>
              <div style={{ padding: "16px 30px", background: theme.canvas, color: theme.accent, fontWeight: 700, fontSize: 25 }}>
                {frame < hello ? "실행 중" : "실행 완료"}
              </div>
              <div style={{ height: 355, display: "grid", placeItems: "center", fontSize: 46, opacity: reveal(frame, hello) }}>
                Hello, world!
              </div>
            </section>
          )}
        </div>
      </IdeMock>
    </AbsoluteFill>
  );
}
