import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme, reveal } from "../theme";
export function Title({ title, label }: { title: string; label?: string }) {
  const progress = reveal(useCurrentFrame());
  return (
    <AbsoluteFill
      style={{
        background: theme.paper,
        fontFamily: theme.sans,
        color: theme.ink,
        padding: theme.space.margin,
        justifyContent: "center",
      }}
    >
      <div style={{ borderTop: "2px solid " + theme.edge, paddingTop: 36 }}>
        {label && (
          <div style={{ font: "30px " + theme.mono, color: theme.accent }}>
            {label}
          </div>
        )}
        <h1
          style={{
            margin: "24px 0",
            fontSize: 94,
            letterSpacing: "-0.045em",
            transform: "translateY(" + (1 - progress) * 12 + "px)",
          }}
        >
          {title}
        </h1>
      </div>
    </AbsoluteFill>
  );
}
