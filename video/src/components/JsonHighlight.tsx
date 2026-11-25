import { useMemo } from "react";
import { stringify } from "json-source-map";
import { CodeBlock } from "./CodeBlock";
export function JsonHighlight({
  data,
  path,
  context = 2,
  highlightFrom = 0,
  fontSize,
}: {
  data: object;
  path: string;
  context?: number;
  highlightFrom?: number;
  fontSize?: number;
}) {
  const { json, pointers } = useMemo(() => stringify(data, null, 2), [data]);
  const target = pointers[path];
  if (!target) throw new Error("Unknown JSON Pointer: " + path);
  const first = (target.key ?? target.value).line;
  const last = target.valueEnd.line;
  const start = Math.max(0, first - context);
  return (
    <CodeBlock
      lang="json"
      code={json
        .split("\n")
        .slice(start, last + context + 1)
        .join("\n")}
      highlightLines={Array.from(
        { length: last - first + 1 },
        (_, i) => first - start + 1 + i,
      )}
      highlightFrom={highlightFrom}
      fontSize={fontSize}
    />
  );
}
