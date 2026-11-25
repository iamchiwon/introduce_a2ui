import { AbsoluteFill, useCurrentFrame } from "remotion";
import pkg from "../../../vendor/a2ui/Package.swift";
import { CodeBlock } from "../components/CodeBlock";
import { IdeMock } from "../components/IdeMock";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const url = "https://github.com/a2ui-project/a2ui";
const products = [...pkg.matchAll(/\.library\(\s*name: "(A2UISwiftCore|A2UISwiftUI|BasicCatalogSwiftUI)"/g)]
  .map((match) => match[1]);
const plugin = pkg.match(/\.plugin\(\s*name: "([^"]+)"/)?.[1];
const roles = ["코어 · 메시지와 데이터 모델", "SwiftUI 어댑터", "기본 컴포넌트"];

export default function S04({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const address = sentenceFrame(1);
  const libraries = sentenceFrame(2);
  const rolesStart = sentenceFrame(3);
  const trust = sentenceFrame(4);
  const allow = wordFrame("허용", 5);
  const done = sentenceFrame(7);
  const rolesLength = trust - rolesStart;
  const selected = [
    Math.max(rolesStart, wordFrame("코어", 3)),
    Math.max(rolesStart + Math.round(rolesLength * 0.4), wordFrame("어댑터", 3)),
    Math.max(rolesStart + Math.round(rolesLength * 0.65), wordFrame("기본", 3)),
  ];
  const active = "패키지 의존성";

  return (
    <AbsoluteFill style={{ padding: "90px 104px", justifyContent: "center" }}>
      <IdeMock files={[active]} active={active}>
        <div style={{ minHeight: 560, padding: "24px 42px" }}>
          {frame < libraries ? (
            <>
              <h1 style={{ fontSize: 55, margin: "0 0 38px" }}>패키지 추가</h1>
              <div style={{ fontSize: 25, color: theme.muted, marginBottom: 14 }}>GitHub 저장소 주소</div>
              <div style={{ border: `2px solid ${theme.edge}`, background: theme.canvas, padding: "21px 16px", borderRadius: 12 }}>
                <CodeBlock code={url} lang="text" fontSize={32} typeFrom={address} />
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 55, margin: "0 0 26px" }}>{frame >= done ? "의존성 추가 완료" : "A2UI 라이브러리"}</h1>
              {products.map((product, index) => (
                <div key={product} style={{ display: "grid", gridTemplateColumns: "60px 425px 1fr", alignItems: "center",
                  padding: "17px 22px", marginBottom: 12, borderRadius: 10,
                  background: frame >= selected[index] ? theme.wash : theme.canvas }}>
                  <span style={{ fontSize: 28, color: theme.accent }}>{frame >= selected[index] ? "✓" : "□"}</span>
                  <span style={{ font: `25px ${theme.mono}` }}>{product}</span>
                  <span style={{ fontSize: 25, color: theme.muted, opacity: reveal(frame, selected[index]) }}>{roles[index]}</span>
                </div>
              ))}
              {frame >= trust ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
                  border: `2px solid ${theme.edge}`, borderRadius: 10, padding: "24px 22px", marginTop: 28 }}>
                  <div>
                    <div style={{ font: `23px ${theme.mono}` }}>{plugin}</div>
                    <div style={{ fontSize: 22, marginTop: 8, color: theme.muted }}>스키마 코드 생성</div>
                  </div>
                  <div style={{ color: theme.accent, background: theme.wash, borderRadius: 8, padding: "12px 16px", fontSize: 23, fontWeight: 700 }}>
                    {frame >= done ? "빌드 완료" : frame >= allow ? "빌드 중" : "Trust & Enable"}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </IdeMock>
    </AbsoluteFill>
  );
}
