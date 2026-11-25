import { Img, OffthreadVideo, staticFile } from "remotion";
import { theme } from "../theme";
type Media =
  | { footage: string; screenshot?: never }
  | { screenshot: string; footage?: never };
export function Simulator({
  footage,
  screenshot,
  height = 860,
  startFrom = 0,
  playbackRate = 1,
}: Media & { height?: number; startFrom?: number; playbackRate?: number }) {
  const fit = {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
    display: "block",
  };
  return (
    <div
      style={{
        height,
        aspectRatio: "1179/2556",
        border: "9px solid " + theme.ink,
        borderRadius: height * 0.055,
        boxSizing: "content-box",
        overflow: "hidden",
        background: theme.paper,
      }}
    >
      {footage !== undefined ? (
        <OffthreadVideo
          src={staticFile("footage/" + footage + ".mp4")}
          muted
          trimBefore={startFrom}
          playbackRate={playbackRate}
          style={fit}
        />
      ) : (
        <Img src={screenshot!} style={fit} />
      )}
    </div>
  );
}
