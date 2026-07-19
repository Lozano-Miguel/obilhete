import { ImageResponse } from "next/og";

export const alt = "O Bilhete — Descobre o que ver a seguir";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <g transform="rotate(-10 16 16)">
            <path
              d="M6 8 H26 A3 3 0 0 1 29 11 V13.5 A2.5 2.5 0 0 0 29 18.5 V21 A3 3 0 0 1 26 24 H6 A3 3 0 0 1 3 21 V18.5 A2.5 2.5 0 0 0 3 13.5 V11 A3 3 0 0 1 6 8 Z"
              fill="#e8c547"
            />
            <path
              d="M21 11 V21"
              stroke="#0a0a0a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="2 2.5"
            />
          </g>
        </svg>
        <div
          style={{
            marginTop: "36px",
            fontSize: "84px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.03em",
          }}
        >
          O Bilhete
        </div>
        <div
          style={{
            marginTop: "16px",
            fontSize: "38px",
            color: "#e8c547",
          }}
        >
          Descobre o que ver a seguir.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "44px",
            fontSize: "24px",
            color: "#888888",
          }}
        >
          O teu perfil do Letterboxd, analisado
        </div>
      </div>
    ),
    size,
  );
}
