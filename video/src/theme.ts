import { Easing, interpolate } from "remotion";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "@fontsource/ibm-plex-mono/400.css";

export const theme = {
  paper: "#ffffff",
  canvas: "#f6f8fa",
  ink: "#182c38",
  muted: "#506775",
  edge: "#d7e1e6",
  accent: "#006c67",
  wash: "#e0f4ee",
  warning: "#a94d15",
  sans: '"Pretendard Variable", sans-serif',
  mono: '"IBM Plex Mono", "Pretendard Variable", monospace',
  space: { sm: 12, md: 24, lg: 48, margin: 96 },
  easing: Easing.bezier(0.2, 0.75, 0.2, 1),
};
export const reveal = (frame: number, start = 0, duration = 12) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: theme.easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
