import type { ReactNode } from "react";
import { theme } from "../theme";
export function IdeMock({
  files,
  active,
  children,
  title = "A2UIBooking",
}: {
  files: string[];
  active: string;
  children: ReactNode;
  title?: string;
}) {
  return (
    <section
      style={{
        border: "2px solid " + theme.edge,
        borderRadius: 20,
        overflow: "hidden",
        background: theme.paper,
        color: theme.ink,
        fontFamily: theme.sans,
      }}
    >
      <header
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid " + theme.edge,
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {title}
      </header>
      <div
        style={{ display: "grid", gridTemplateColumns: "255px minmax(0,1fr)" }}
      >
        <aside
          style={{
            background: theme.canvas,
            padding: 16,
            fontFamily: theme.sans,
            fontSize: 22,
          }}
        >
          {files.map((file) => (
            <div
              key={file}
              style={{
                padding: 12,
                borderRadius: 8,
                background: file === active ? theme.wash : undefined,
              }}
            >
              {file}
            </div>
          ))}
        </aside>
        <section style={{ minWidth: 0 }}>
          <header
            style={{
              padding: "14px 28px",
              borderBottom: "1px solid " + theme.edge,
            font: "21px " + theme.sans,
              color: theme.accent,
            }}
          >
            {active}
          </header>
          <div style={{ padding: 24 }}>{children}</div>
        </section>
      </div>
    </section>
  );
}
