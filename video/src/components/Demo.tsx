import { AbsoluteFill } from "remotion";
import golf from "../../../fixtures/golf.json";
import screen from "../../../ios/screenshots/golf.png";
import swift from "../../../ios/App/App.swift";
import { theme } from "../theme";
import { IdeMock } from "./IdeMock";
import { CodeBlock } from "./CodeBlock";
import { JsonHighlight } from "./JsonHighlight";
import { Diagram } from "./Diagram";
import { Simulator } from "./Simulator";

export function Demo() {
  return (
    <AbsoluteFill
      style={{
        background: theme.paper,
        color: theme.ink,
        padding: "80px 96px",
        fontFamily: theme.sans,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <section style={{ width: 1180 }}>
        <h1
          style={{ fontSize: 66, margin: "0 0 32px", letterSpacing: "-.04em" }}
        >
          골프 예약 화면의 구성
        </h1>
        <IdeMock files={["App.swift", "golf.json"]} active="golf.json">
          <JsonHighlight
            data={golf}
            path="/messages/0/createSurface/components/3/value"
            context={1}
          />
        </IdeMock>
        <div style={{ margin: "32px 0" }}>
          <CodeBlock
            code={swift.split("\n").slice(0, 4).join("\n")}
            typeFrom={4}
            highlightLines={[2]}
          />
        </div>
        <Diagram
          nodes={[
            { label: "예약 JSON", from: 0 },
            { label: "MessageProcessor", from: 8 },
            { label: "SwiftUI", from: 16 },
          ]}
        />
      </section>
      <Simulator screenshot={screen} height={870} />
    </AbsoluteFill>
  );
}
