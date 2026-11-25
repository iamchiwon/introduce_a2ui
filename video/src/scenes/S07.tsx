import { useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame, useDelayRender } from "remotion";
import golfShot from "../../../ios/screenshots/golf.png";
import { Diagram } from "../components/Diagram";
import { IdeMock } from "../components/IdeMock";
import { Simulator } from "../components/Simulator";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const projectURL = new URL("../../../ios/project.yml", import.meta.url).href;

export default function S07({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [project, setProject] = useState("A2UIRenderer");
  const [projectHandle] = useState(() => delayRender("Read iOS project name"));
  useEffect(() => {
    fetch(projectURL)
      .then(async (response) => {
        if (!response.ok) throw new Error(`project.yml HTTP ${response.status}`);
        const yaml = await response.text();
        const name = yaml.match(/^name:\s*(.+)$/m)?.[1];
        if (name) setProject(name);
        continueRender(projectHandle);
      }).catch(cancelRender);
  }, [cancelRender, continueRender, projectHandle]);
  const build = wordFrame("실행", 0);
  const error = sentenceFrame(1);
  const run = Math.round((build + error) / 2);
  const send = wordFrame("메시지", 1);
  const fix = Math.round((sentenceFrame(2) + sentenceFrame(3)) / 2);
  const retry = wordFrame("다시", 3);
  const check = wordFrame("확인", 3);

  return (
    <AbsoluteFill style={{ padding: "72px 96px", justifyContent: "center" }}>
      {frame < check ? (
        <IdeMock title={project} files={["App.swift", "golf.json"]} active="App.swift">
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
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 160px 0 80px", gap: 80 }}>
          <section>
            <div style={{ color: theme.accent, font: `26px ${theme.mono}` }}>golf.json</div>
            <h1 style={{ fontSize: 78, margin: "18px 0", letterSpacing: "-0.05em" }}>골프 예약 화면</h1>
            <Diagram nodes={[{ label: "시뮬레이터 실행", from: retry }]} />
          </section>
          <div style={{ opacity: reveal(frame, check, 8) }}>
            <Simulator screenshot={golfShot} height={884} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}
