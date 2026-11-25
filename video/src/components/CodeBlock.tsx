import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import swift from "shiki/langs/swift.mjs";
import json from "shiki/langs/json.mjs";
import light from "shiki/themes/github-light.mjs";
import { reveal, theme } from "../theme";

const highlighter = createHighlighterCoreSync({
  langs: [swift, json],
  themes: [light],
  engine: createJavaScriptRegexEngine(),
});
export interface CodeProps {
  code: string;
  lang?: "swift" | "json" | "text";
  highlightLines?: number[];
  highlightFrom?: number;
  typeFrom?: number;
  charsPerFrame?: number;
  fontSize?: number;
}
export function CodeBlock({
  code,
  lang = "swift",
  highlightLines = [],
  highlightFrom = 0,
  typeFrom,
  charsPerFrame = 3,
  fontSize = 26,
}: CodeProps) {
  const frame = useCurrentFrame();
  const lines = useMemo(
    () =>
      highlighter.codeToTokens(code, { lang, theme: "github-light" }).tokens,
    [code, lang],
  );
  const budget =
    typeFrom === undefined
      ? Infinity
      : Math.max(0, Math.floor((frame - typeFrom) * charsPerFrame));
  return (
    <pre
      style={{
        margin: 0,
        color: theme.ink,
        font: fontSize + "px/1.55 " + theme.mono,
        overflow: "hidden",
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            minHeight: "1.55em",
            padding: "0 12px",
            backgroundColor: highlightLines.includes(i + 1)
              ? "rgba(79,191,154," + 0.21 * reveal(frame, highlightFrom) + ")"
              : undefined,
          }}
        >
          {line.map((token, j) => (
            <span key={j} style={{ color: token.color }}>
              {token.content.slice(0, Math.max(0, budget - token.offset))}
            </span>
          ))}
        </div>
      ))}
    </pre>
  );
}
