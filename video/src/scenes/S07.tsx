import { AbsoluteFill, Freeze, getStaticFiles, useCurrentFrame } from "remotion";
import golfShot from "../../../ios/screenshots/golf.png";
import { Diagram } from "../components/Diagram";
import { IdeMock } from "../components/IdeMock";
import { Simulator } from "../components/Simulator";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

export default function S07({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const build = wordFrame("실행", 0);
  const error = sentenceFrame(1);
  const run = Math.round((build + error) / 2);
  const send = wordFrame("메시지", 1);
  const fix = Math.round((sentenceFrame(2) + sentenceFrame(3)) / 2);
  const retry = wordFrame("다시", 3);
  const check = wordFrame("확인", 3);

  if (frame >= check) {
    const hasFootage = getStaticFiles().some(({ name }) => name === "footage/s08_golf.mp4");
    return (
      <AbsoluteFill style={{ padding: "70px 96px", flexDirection: "row", alignItems: "center", gap: 112 }}>
        <div style={{ width: 608, height: 940, display: "grid", placeItems: "center", position: "relative",
          flexShrink: 0, background: theme.canvas, borderRadius: 32, overflow: "hidden", opacity: reveal(frame, check, 8) }}>
          {hasFootage ? (
            <Freeze frame={0}><Simulator footage="s08_golf" height={870} /></Freeze>
          ) : <Simulator screenshot={golfShot} height={870} />}
        </div>
        <section>
          <div style={{ color: theme.accent, font: `26px ${theme.mono}` }}>golf.json</div>
          <h1 style={{ fontSize: 72, margin: "16px 0 28px", letterSpacing: "-0.055em" }}>골프 예약 화면</h1>
          <Diagram nodes={[{ label: "시뮬레이터 실행", from: retry }]} />
        </section>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ padding: "72px 96px", justifyContent: "center" }}>
      <IdeMock files={["App.swift", "golf.json"]} active="App.swift">
        <div style={{ padding: "50px 42px", minHeight: 450 }}>
          <h1 style={{ margin: "0 0 42px", fontSize: 62, letterSpacing: "-0.045em" }}>빌드하고 실행</h1>
          <Diagram nodes={[{ label: "빌드", from: build }, { label: "실행", from: run }]} />
          <div style={{ opacity: reveal(frame, error), marginTop: 55 }}>
            <div style={{ color: theme.warning, fontSize: 24, fontWeight: 700, marginBottom: 17 }}>빌드 오류가 발생하면</div>
            <Diagram nodes={[
              { label: "오류 발생", from: error },
              { label: "메시지 전달", from: send },
              { label: "AI 수정", from: fix },
              { label: "재실행", from: retry },
            ]} />
          </div>
        </div>
      </IdeMock>
    </AbsoluteFill>
  );
}
