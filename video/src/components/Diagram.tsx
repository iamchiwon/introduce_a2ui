import { Fragment } from "react";
import { useCurrentFrame } from "remotion";
import { reveal, theme } from "../theme";
export function Diagram({
  nodes,
}: {
  nodes: { label: string; from: number }[];
}) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: theme.sans,
      }}
    >
      {nodes.map(({ label, from }, i) => {
        const t = reveal(frame, from);
        return (
          <Fragment key={i}>
            {i > 0 && (
              <span style={{ opacity: t, color: theme.accent, fontSize: 36 }}>
                →
              </span>
            )}
            <div
              style={{
                opacity: t,
                transform: "translateY(" + (1 - t) * 10 + "px)",
                border: "2px solid " + theme.edge,
                borderRadius: 12,
                padding: "17px 24px",
                background: theme.paper,
                color: theme.ink,
                fontSize: 32,
                fontWeight: 650,
              }}
            >
              {label}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
