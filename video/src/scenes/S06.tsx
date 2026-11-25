import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import app from "../../../ios/App/App.swift";
import golf from "../../../fixtures/golf.json";
import clinic from "../../../fixtures/clinic.json";
import { CodeBlock } from "../components/CodeBlock";
import { IdeMock } from "../components/IdeMock";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const prompt = `A2UI Swift 패키지(A2UICore, A2UISwiftUI, BasicCatalogSwiftUI)로
번들의 fixtures/golf.json을 읽어서 화면에 그려줘.
- BasicCatalogImplementation.makeCatalog(version: .v10) 카탈로그 사용
- MessageProcessor로 messages를 순서대로 처리하고 첫 surface를 A2UISwiftUI.Surface로 표시
- processor.outboundListener로 받은 메시지를 JSON으로 바꿔서 하단 "Agent log"에 표시
- 나중에 화면이 늘어날 수 있으니 상단에 세그먼트 Picker
참고: 저장소의 swift/swiftui/README.md, swift/sample`;

const lines = app.split("\n");
const snippets = [
  { label: "메시지 프로세서", match: "let processor = MessageProcessor(catalogs:", before: 2, after: 0 },
  { label: "JSON 파싱 및 처리", match: "processor.process(message: try MessageParser().decode", before: 2, after: 1 },
  { label: "SwiftUI Surface", match: "A2UISwiftUI.Surface(viewModel:", before: 2, after: 1 },
  { label: "Agent log", match: "processor.outboundListener =", before: 0, after: 6 },
].map(({ label, match, before, after }) => {
  const index = lines.findIndex((line) => line.includes(match));
  const excerpt = lines.slice(index - before, index + after + 1);
  const indent = Math.min(...excerpt.filter((line) => line.trim()).map((line) => line.search(/\S/)));
  const code = excerpt.map((line) => line.slice(indent)).join("\n")
    .replace(").flatMap", ")\n    .flatMap")
    .replace(/(var body: some View \{) (A2UISwiftUI\.Surface\(.+\)) \}/, "$1\n  $2\n}");
  return { label, code, highlight: before + (match.startsWith("A2UISwiftUI.") ? 2 : 1) };
});
const inputs = [
  { file: "golf.json", name: golf.name, surfaceId: golf.messages[0].createSurface.surfaceId },
  { file: "clinic.json", name: clinic.name, surfaceId: clinic.messages[0].createSurface.surfaceId },
];

export default function S06({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const writing = sentenceFrame(1);
  const hold = 2 * fps;
  const code = Math.max(sentenceFrame(3), writing + hold + 1);
  const writingFrames = Math.min(Math.round((code - writing) * 0.65), code - writing - hold);
  const detail = sentenceFrame(4);
  const length = sentenceFrame(5) - detail;
  const parsing = Math.max(detail + Math.round(length * 0.25), wordFrame("순서", 4));
  const surface = Math.max(parsing + 1, detail + Math.round(length * 0.50), wordFrame("서피스", 4));
  const listener = Math.max(surface + 1, detail + Math.round(length * 0.75), wordFrame("나가", 4));
  const sameCode = sentenceFrame(5);
  const swap = sentenceFrame(7);
  const cues = [code, parsing, surface, listener];
  const active = Math.max(0, cues.filter((cue) => frame >= cue).length - 1);
  const variant = frame >= swap ? inputs[1] : inputs[0];
  const excerpt = snippets[frame >= sameCode ? 2 : active];
  const tab = frame >= code ? "App.swift" : "질문";

  return (
    <AbsoluteFill style={{ padding: "88px 100px", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: frame >= sameCode ? "minmax(0,1fr) 300px" : "minmax(0,1fr)",
        alignItems: "center", gap: 24 }}>
        <IdeMock files={["질문", ...(frame >= code ? ["App.swift"] : [])]} active={tab}>
          <div style={{ minHeight: 490, padding: "25px 14px" }}>
            <h1 style={{ fontSize: 46, margin: "0 0 30px 12px" }}>{frame < code ? "JSON 렌더링 요청" : excerpt.label}</h1>
            {frame < code ? (
              <CodeBlock lang="text" code={prompt} typeFrom={frame < writing + writingFrames ? writing : undefined}
                charsPerFrame={prompt.length / writingFrames} fontSize={25} />
            ) : (
              <CodeBlock code={excerpt.code} lang="swift" fontSize={24}
                highlightLines={[excerpt.highlight]} highlightFrom={frame >= sameCode ? sameCode : cues[active]} />
            )}
          </div>
        </IdeMock>
        {frame >= sameCode ? (
          <section key={variant.file} style={{ opacity: reveal(frame, frame >= swap ? swap : sameCode),
            background: theme.canvas, border: `2px solid ${theme.edge}`, padding: "28px 22px", borderRadius: 17 }}>
            <div style={{ color: theme.muted, fontSize: 23, marginBottom: 16 }}>입력 파일</div>
            <div style={{ color: theme.accent, font: `26px ${theme.mono}`, marginBottom: 20 }}>{variant.file}</div>
            <div style={{ fontSize: 34, fontWeight: 700 }}>{variant.name}</div>
            <div style={{ color: theme.muted, font: `21px ${theme.mono}`, marginTop: 16 }}>surfaceId: {variant.surfaceId}</div>
          </section>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
