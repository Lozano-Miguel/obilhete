import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "#0a0a0a",
          color: "white",
          fontFamily: "sans-serif",
        },
      },
      React.createElement("div", { style: { fontSize: 28, opacity: 0.8 } }, "O Bilhete"),
      React.createElement(
        "div",
        { style: { fontSize: 72, fontWeight: 700, lineHeight: 1.05 } },
        `@${username}`,
      ),
      React.createElement(
        "div",
        { style: { fontSize: 28, opacity: 0.75 } },
        "Conhece o teu gosto • Recomendações personalizadas",
      ),
    ),
    { width: 1200, height: 630 },
  );
}

