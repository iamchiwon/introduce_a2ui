import { AbsoluteFill, Img } from "remotion";
import { theme } from "./theme";
import background from "../../docs/thumbnail/bg.png";

export function Thumbnail() {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.paper, fontFamily: theme.sans, color: theme.ink }}>
      <Img src={background} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 64, top: 205 }}>
        <div style={{ display: "inline-block", background: theme.accent, color: theme.paper, borderRadius: 12, padding: "10px 18px", fontSize: 27, fontWeight: 800, letterSpacing: -0.4 }}>A2UI 1.0 · SwiftUI</div>
        <div style={{ marginTop: 27, fontSize: 76, lineHeight: 1.18, fontWeight: 900, letterSpacing: -3.5, whiteSpace: "nowrap" }}>
          UI 코드,<br /><span style={{ color: theme.accent }}>이제 안 짭니다</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}
