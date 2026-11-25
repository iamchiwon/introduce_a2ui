import { AbsoluteFill, useCurrentFrame } from "remotion";
import golf from "../../../fixtures/golf.json";
import golfShot from "../../../ios/screenshots/golf.png";
import actionShot from "../../../ios/screenshots/golf_action.png";
import { CodeBlock } from "../components/CodeBlock";
import { Diagram } from "../components/Diagram";
import { IdeMock } from "../components/IdeMock";
import { JsonHighlight } from "../components/JsonHighlight";
import { Simulator } from "../components/Simulator";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const prompt = `A2UI v1.0 basic catalog로 골프 예약 입력 화면 JSON을 만들어줘.
fixtures/golf.json, 형식은 {"name","description","messages":[...]}이고
createSurface 하나에 components와 dataModel을 같이 넣어줘.
- 골프장 선택(필수), 라운드 날짜, 티타임(chips), 인원 슬라이더 1~4,
  카트/캐디 체크박스, 요청사항, 요약 문구(formatString), 예약하기 버튼
- 필수값은 @checks로 검증하고, 버튼 action.event의 context로 입력값 전부 보내줘
스펙: https://github.com/a2ui-project/a2ui 의 specification/v1_0, catalogs/basic/v1`;

const parts = golf.messages[0].createSurface.components;
const pointer = (id: string, field: string) =>
  `/messages/0/createSurface/components/${parts.findIndex((part) => part.id === id)}/${field}`;
const event = parts.find((part) => part.id === "submit")?.action?.event;
const compactEvent = `{
  "name": "${event?.name}",
  "context": {
${Object.entries(event?.context ?? {}).map(([key, value]) => `    "${key}": ${JSON.stringify(value)}`).join(",\n")}
  }
}`;
const resources = ["fixtures/", "golf.json", "Bundle Resources"];
const fieldBounds = {
  course: { top: "22%", height: "20%" },
  players: { top: "66%", height: "8%" },
  cart: { top: "47%", height: "6%" },
  tee: { top: "54%", height: "13%" },
  warning: { top: "43%", height: "4%" },
  submit: { top: "63%", height: "8%" },
};

export default function S05({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const writing = sentenceFrame(2);
  const generated = sentenceFrame(3);
  const fields = sentenceFrame(4);
  const fieldSpan = sentenceFrame(5) - fields;
  const choice = fields;
  const slider = Math.max(fields + Math.round(fieldSpan / 3), wordFrame("슬라이더", 4));
  const checkBox = Math.max(slider + 1, fields + Math.round(fieldSpan * 2 / 3), wordFrame("체크박스", 4));
  const path = wordFrame("데이터", 5);
  const validation = sentenceFrame(7);
  const action = sentenceFrame(8);
  const bundle = sentenceFrame(9);
  const ranges = [
    { label: "골프장 · 선택지", id: "course", key: "component", from: choice },
    { label: "인원 · 슬라이더", id: "players", key: "component", from: slider },
    { label: "카트 사용 · 체크박스", id: "cart", key: "component", from: checkBox },
    { label: "티타임 · 데이터 경로", id: "tee", key: "value/@path", from: path },
    { label: "골프장 · 필수값 검증", id: "course", key: "@checks", from: validation },
  ] as const;
  const current = ranges.filter((range) => frame >= range.from).at(-1);
  const showScreenshot = frame >= generated && frame < bundle;
  const showAction = frame >= action;
  const field = showAction ? "submit" : current?.key === "@checks" ? "warning" : current?.id;
  const bounds = field ? fieldBounds[field] : undefined;
  const active = frame < generated ? "질문" : frame >= bundle ? "번들 리소스" : "golf.json";

  return (
    <AbsoluteFill style={{ padding: "82px 100px", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: showScreenshot ? "minmax(0,1fr) 390px" : "minmax(0,1fr)", alignItems: "center", gap: 36 }}>
        <IdeMock files={frame < generated ? ["질문"] : resources.slice(0, 2).concat(active === "번들 리소스" ? [active] : [])} active={active}>
          <div style={{ minHeight: 530, padding: "18px 14px" }}>
            {frame < generated ? (
              <>
                <h1 style={{ fontSize: 48, margin: "0 0 30px 12px" }}>골프 예약 화면 요청</h1>
                <CodeBlock code={prompt} lang="text" typeFrom={writing} charsPerFrame={prompt.length / Math.max(1, (generated - writing) * 0.72)} fontSize={25} />
              </>
            ) : frame >= bundle ? (
              <>
                <h1 style={{ fontSize: 48, margin: "0 0 34px" }}>앱 번들</h1>
                <Diagram nodes={resources.map((label, index) => ({ label, from: bundle + 10 * index }))} />
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 40, margin: "0 0 24px 12px" }}>
                  {showAction ? "예약하기 · action.event" : current?.label ?? golf.name}
                </h1>
                {showAction ? (
                  <CodeBlock code={compactEvent} lang="json" fontSize={23} highlightLines={[3, 4, 5, 6, 7, 8, 9, 10, 11]} highlightFrom={action} />
                ) : (
                  <JsonHighlight data={golf}
                    path={current ? pointer(current.id, current.key) : "/name"}
                    context={current?.key === "@checks" ? 0 : 2}
                    highlightFrom={current?.from ?? generated} fontSize={23} />
                )}
              </>
            )}
          </div>
        </IdeMock>
        {showScreenshot ? (
          <div style={{ position: "relative", width: "fit-content", opacity: reveal(frame, generated),
            transform: `translateY(${(1 - reveal(frame, generated)) * 12}px)` }}>
            <Simulator screenshot={current?.id === "cart" || showAction ? actionShot : golfShot} height={792} />
            {bounds ? <div style={{ position: "absolute", left: "6%", right: "6%", ...bounds,
              boxSizing: "border-box", border: `3px solid ${theme.accent}`, borderRadius: 10,
              opacity: reveal(frame, showAction ? action : current?.from) }} /> : null}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
