import { AbsoluteFill, Img } from "remotion";
// A2UI 로고: vendor/a2ui/docs/assets/A2UI_dark.svg (Apache-2.0)
import logo from "../../docs/thumbnail/a2ui-logo.svg";
import { theme } from "./theme";

// "잔머리는 삶의 지혜" 재생목록 썸네일 양식: 파란 상단 띠 + 흰 본문 + 회색 영문 부제
const Bulb = () => (
  <svg width="92" height="92" viewBox="0 0 64 64">
    <path d="M32 6c-11 0-19 8.4-19 18.6 0 6.6 3.4 11 6.6 14.4 2.2 2.4 3.4 4.6 3.4 7v2h18v-2c0-2.4 1.2-4.6 3.4-7 3.2-3.4 6.6-7.8 6.6-14.4C51 14.4 43 6 32 6z" fill="#fff" />
    <rect x="23" y="51" width="18" height="4" rx="2" fill="#fff" />
    <rect x="25" y="57" width="14" height="4" rx="2" fill="#fff" />
  </svg>
);

const copy = {
  ko: { lines: ["iOS 서버 드리븐 UI", "이제 공짜"], sub: "앱 배포 없이 화면 바꾸기", titleSize: 120, subSize: 66 },
  en: { lines: ["Server-Driven UI", "for iOS, Now Free"], sub: "No app update needed", titleSize: 106, subSize: 64 },
};

const KoSeries = () => (
  <>
    <b style={{ fontWeight: 900 }}>잔머리</b>
    <span style={{ fontWeight: 400, opacity: 0.85 }}>는 삶의 </span>
    <b style={{ fontWeight: 900 }}>지혜</b>
  </>
);
const EnSeries = () => (
  <>
    <span style={{ fontWeight: 800 }}>Tricks</span>
    <span style={{ fontWeight: 300, opacity: 0.85 }}> make </span>
    <span style={{ fontWeight: 800 }}>wisdom</span>
  </>
);

// lang=en 이면 재생목록 이름의 영어·한국어 위치를 바꾸고 본문을 영어로 쓴다
export function Thumbnail({ lang = "ko" }: { lang?: "ko" | "en" }) {
  const c = copy[lang];
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff", fontFamily: theme.sans }}>
      <div
        style={{
          height: 214,
          background: "linear-gradient(180deg, #5d9fd6 0%, #3a7cb8 55%, #2b6497 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 56px 0 44px",
          color: "#fff",
        }}
      >
        <Bulb />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 82, letterSpacing: -2, lineHeight: 1.05 }}>
            {lang === "ko" ? <KoSeries /> : <EnSeries />}
          </div>
          <div style={{ fontSize: 42, marginTop: 10, letterSpacing: -0.5 }}>
            {lang === "ko" ? <EnSeries /> : <KoSeries />}
          </div>
        </div>
      </div>
      <div style={{ padding: "50px 56px 0", color: "#111" }}>
        <div style={{ fontSize: c.titleSize, fontWeight: 900, letterSpacing: lang === "ko" ? -4.5 : -3, lineHeight: 1.16 }}>
          {c.lines[0]}
          <br />
          {c.lines[1]}
        </div>
        <div style={{ marginTop: 24, fontSize: c.subSize, fontWeight: 800, color: "#a3a8ad", letterSpacing: -1.5 }}>
          {c.sub}
        </div>
      </div>
      {/* 오른쪽 아래는 유튜브 재생시간 표시에 가려지므로 로고 밑에 둔다 */}
      <div style={{ position: "absolute", right: 70, top: 290, width: 250, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={logo} style={{ width: 250, height: 250 }} />
        <div style={{ marginTop: 4, fontSize: 38, fontWeight: 700, color: "#6b7177", letterSpacing: -0.5 }}>feat. A2UI</div>
      </div>
    </AbsoluteFill>
  );
}
