import { AbsoluteFill, useCurrentFrame } from "remotion";
import schema from "../../../vendor/a2ui/specification/v1_0/json/agent_to_renderer.json";
import catalog from "../../../vendor/a2ui/catalogs/basic/v1/catalog.json";
import golf from "../../../fixtures/golf.json";
import golfShot from "../../../ios/screenshots/golf.png";
import actionShot from "../../../ios/screenshots/golf_action.png";
import { CodeBlock } from "../components/CodeBlock";
import { Diagram } from "../components/Diagram";
import { Simulator } from "../components/Simulator";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const actions = [
  [schema.$defs.CreateSurfaceMessage.required[0], "화면 생성", { surfaceId: "booking", catalogId: catalog.catalogId }],
  [schema.$defs.UpdateComponentsMessage.required[0], "컴포넌트 갱신", { surfaceId: "booking", components: [{ id: "root", component: "Text", text: golf.name }] }],
  [schema.$defs.UpdateDataModelMessage.required[0], "데이터 갱신", { surfaceId: "booking", path: "/teeTime", value: ["06:30"] }],
  [schema.$defs.DeleteSurfaceMessage.required[0], "화면 삭제", { surfaceId: "booking" }],
] as const;
const examples = ["title", "course", "submit"].map((id) =>
  golf.messages[0].createSurface.components.find((item) => item.id === id)!,
);
const version = golf.messages[0].version;

export default function S01({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const versionCue = wordFrame("릴리즈", 1);
  const expand = sentenceFrame(2);
  const start = sentenceFrame(5);
  const interval = sentenceFrame(6) - start;
  const cues = [
    wordFrame("만들어라", 5),
    Math.max(start + Math.round(interval * 0.25), wordFrame("컴포넌트를", 5)),
    Math.max(start + Math.round(interval * 0.50), wordFrame("데이터를", 5)),
    Math.max(start + Math.round(interval * 0.75), wordFrame("지워라", 5)),
  ];
  const catalogCue = wordFrame("카탈로그", 7);
  const buttonCue = wordFrame("버튼", 8);
  const renderer = wordFrame("렌더러", 10);
  const action = actions[cues.filter((cue) => frame >= cue).length - 1] ?? actions[0];
  const actionCue = cues[actions.indexOf(action)];

  return (
    <AbsoluteFill style={{ padding: "86px 104px", justifyContent: "center" }}>
      {frame < start ? (
        <div style={{ borderTop: `2px solid ${theme.edge}`, paddingTop: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, color: theme.accent, font: `29px ${theme.mono}` }}>
            a2ui-project/a2ui
            <span style={{ opacity: reveal(frame, versionCue), background: theme.wash, borderRadius: 8, padding: "8px 13px" }}>v{version}</span>
          </div>
          <h1 style={{ fontSize: 132, letterSpacing: "-0.055em", margin: "22px 0 5px" }}>A2UI</h1>
          <div style={{ fontSize: 54, fontWeight: 600, color: theme.muted, opacity: reveal(frame, expand) }}>Agent to User Interface</div>
        </div>
      ) : frame < catalogCue ? (
        <>
          <h1 style={{ fontSize: 67, margin: "0 0 38px", letterSpacing: "-0.04em" }}>프로토콜 메시지</h1>
          <section style={{ maxWidth: 1140, minHeight: 465, border: `2px solid ${theme.edge}`, borderRadius: 22, padding: 30, background: theme.canvas }}>
            <div style={{ color: theme.accent, fontSize: 28, fontWeight: 700, margin: "0 12px 18px" }}>{action[1]}</div>
            <CodeBlock lang="json" fontSize={28} code={JSON.stringify({ version, [action[0]]: action[2] }, null, 2)}
              highlightLines={[3]} highlightFrom={actionCue} />
          </section>
        </>
      ) : frame < renderer ? (
        <div style={{ display: "flex", alignItems: "center", gap: 110 }}>
          <Simulator screenshot={frame >= buttonCue ? actionShot : golfShot} height={852} />
          <section style={{ flex: 1 }}>
            <h1 style={{ fontSize: 68, margin: "0 0 38px", letterSpacing: "-0.04em" }}>기본 카탈로그</h1>
            {examples.map((item, index) => (
              <div key={item.id} style={{ opacity: reveal(frame, Math.max(catalogCue, sentenceFrame(8) + 10 * index - 10)),
                display: "flex", alignItems: "center", gap: 28, padding: "20px 0", borderTop: `1px solid ${theme.edge}` }}>
                <span style={{ color: theme.accent, background: frame >= buttonCue && item.id !== "submit" ? theme.canvas : theme.wash, borderRadius: 8,
                  minWidth: 226, padding: "13px 16px", font: `26px ${theme.mono}` }}>{item.component}</span>
                <span style={{ fontSize: 34 }}>{item.label ?? (item.id === "title" ? golf.name : "예약하기")}</span>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <>
          <h1 style={{ fontSize: 68, margin: "0 0 44px", letterSpacing: "-0.04em" }}>JSON에서 SwiftUI로</h1>
          <Diagram nodes={[
            { label: "서버 / 에이전트", from: renderer },
            { label: "JSON", from: renderer + 8 },
            { label: "MessageProcessor", from: renderer + 16 },
            { label: "SwiftUI", from: renderer + 24 },
          ]} />
        </>
      )}
    </AbsoluteFill>
  );
}
