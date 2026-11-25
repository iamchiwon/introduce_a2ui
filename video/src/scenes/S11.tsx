import { useEffect, useState } from "react";
import { AbsoluteFill, Img, useCurrentFrame, useDelayRender } from "remotion";
import golf from "../../../fixtures/golf.json";
import actionShot from "../../../ios/screenshots/golf_action.png";
import catalog from "../../../vendor/a2ui/catalogs/basic/v1/catalog.json";
import swiftPackage from "../../../vendor/a2ui/Package.swift";
import { CodeBlock } from "../components/CodeBlock";
import { Diagram } from "../components/Diagram";
import { reveal, theme } from "../theme";
import type { SceneProps } from "../timing";

const names = ["Text", "TextField", "ChoicePicker", "CheckBox", "Slider", "Button"];
const catalogTypes = names.filter((name) => name in catalog.components);
const components = golf.messages[0].createSurface.components;
const summary = components.find(({ id }) => id === "summary");
const formatString = summary?.text && typeof summary.text !== "string" ? summary.text.args?.value : "";
const licenseURL = new URL("../../../vendor/a2ui/LICENSE", import.meta.url).href;
const packageName = swiftPackage.split("\n").find((line) => line.startsWith("  name:"))?.split('"')[1];

function LicenseHeader() {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [header, setHeader] = useState("");
  const [handle] = useState(() => delayRender("Read the A2UI license header"));
  useEffect(() => {
    fetch(licenseURL)
      .then(async (response) => {
        if (!response.ok) throw new Error(`LICENSE HTTP ${response.status}`);
        const content = await response.text();
        setHeader(content.trimStart().split("\n").slice(0, 3).map((line) => line.trim()).join("\n"));
        continueRender(handle);
      }).catch(cancelRender);
  }, [cancelRender, continueRender, handle]);
  return <CodeBlock lang="text" code={header} fontSize={28} highlightLines={[2]} />;
}

export default function S11({ sentenceFrame, wordFrame }: SceneProps) {
  const frame = useCurrentFrame();
  const available = wordFrame("카탈로그", 1);
  const design = wordFrame("디자인", 2);
  const brackets = wordFrame("대괄호", 3);
  const versions = sentenceFrame(4);
  const apache = sentenceFrame(6);
  const fork = wordFrame("포크", 7);
  const swapURL = wordFrame("주소", 7);

  return (
    <AbsoluteFill style={{ padding: "80px 96px", justifyContent: "center" }}>
      {frame >= apache ? (
        <>
          <div style={{ color: theme.accent, font: `26px ${theme.mono}` }}>a2ui-project/a2ui</div>
          <h1 style={{ margin: "16px 0 32px", fontSize: 77, letterSpacing: "-0.05em" }}>Apache License 2.0</h1>
          <div style={{ background: theme.canvas, border: `2px solid ${theme.edge}`, borderRadius: 24,
            padding: "28px 34px", marginBottom: 32 }}>
            <div style={{ color: theme.accent, font: `24px ${theme.mono}`, marginBottom: 16 }}>LICENSE</div>
            <LicenseHeader />
          </div>
          <Diagram nodes={[
            { label: "원본 저장소", from: apache },
            { label: "포크", from: fork },
            { label: "패키지 주소 교체", from: Math.max(fork + 1, swapURL) },
          ]} />
        </>
      ) : frame >= brackets ? (
        <>
          <div style={{ color: theme.accent, font: `26px ${theme.mono}` }}>golf.json</div>
          <h1 style={{ margin: "16px 0 35px", fontSize: 72, letterSpacing: "-0.05em" }}>배열 값이 요약에 그대로 표시</h1>
          <div style={{ display: "flex", gap: 28, alignItems: "stretch" }}>
            <div style={{ width: 887, border: `2px solid ${theme.edge}`, borderRadius: 20, overflow: "hidden",
              alignSelf: "flex-start" }}>
              <div style={{ position: "relative", height: 150, overflow: "hidden", background: theme.canvas }}>
                <Img src={actionShot} style={{ position: "absolute", top: -1130, left: 0, width: "100%" }} />
                <div style={{ position: "absolute", top: 57, left: 225, width: 130, height: 32, borderRadius: 7,
                  border: `2px solid ${theme.accent}`, opacity: reveal(frame, brackets) }} />
              </div>
              <div style={{ padding: "20px 24px", background: theme.paper }}>
                <CodeBlock lang="json" code={JSON.stringify({ formatString }, null, 2)} fontSize={23} highlightLines={[2]} />
              </div>
            </div>
            {frame >= versions ? (
              <div style={{ flex: 1, opacity: reveal(frame, versions), background: theme.canvas,
                borderRadius: 20, padding: "24px 28px" }}>
                {[["A2UI 프로토콜", catalog.protocolVersion], [packageName, "0.x"]].map(([label, value]) => (
                  <div key={value} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 20, padding: "16px 0", borderBottom: `1px solid ${theme.edge}`, fontSize: 26 }}>
                    <span>{label}</span><strong style={{ color: theme.accent, fontFamily: theme.mono }}>{value}</strong>
                  </div>
                ))}
                <div style={{ fontSize: 23, color: theme.muted, paddingTop: 21 }}>
                  CLI 빌드에서는 <code>-destination</code>으로 시뮬레이터 지정
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div style={{ color: theme.accent, font: `26px ${theme.mono}` }}>BasicCatalogSwiftUI</div>
          <h1 style={{ margin: "16px 0 38px", fontSize: 76, letterSpacing: "-0.05em" }}>iOS 기본 카탈로그</h1>
          <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginBottom: 40 }}>
            {catalogTypes.map((name, i) => (
              <span key={name} style={{ opacity: reveal(frame, available + 3 * i), padding: "14px 18px", borderRadius: 10,
                background: theme.canvas, border: `1px solid ${theme.edge}`, font: `23px ${theme.mono}` }}>{name}</span>
            ))}
          </div>
          <Diagram nodes={[
            { label: "카탈로그 타입", from: available },
            { label: "SwiftUI 구현", from: design },
            { label: "앱 디자인 시스템", from: Math.max(design + 1, wordFrame("구현", 2)) },
          ]} />
        </>
      )}
    </AbsoluteFill>
  );
}
