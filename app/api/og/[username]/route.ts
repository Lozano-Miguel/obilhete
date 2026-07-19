import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";

const e = React.createElement;

function ticketMark(size: number) {
  return e(
    "svg",
    { width: size, height: size, viewBox: "0 0 32 32", fill: "none" },
    e(
      "g",
      { transform: "rotate(-10 16 16)" },
      e("path", {
        d: "M6 8 H26 A3 3 0 0 1 29 11 V13.5 A2.5 2.5 0 0 0 29 18.5 V21 A3 3 0 0 1 26 24 H6 A3 3 0 0 1 3 21 V18.5 A2.5 2.5 0 0 0 3 13.5 V11 A3 3 0 0 1 6 8 Z",
        fill: "#e8c547",
      }),
      e("path", {
        d: "M21 11 V21",
        stroke: "#0a0a0a",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeDasharray: "2 2.5",
      }),
    ),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  return new ImageResponse(
    e(
      "div",
      {
        style: {
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        },
      },
      e(
        "div",
        {
          style: {
            position: "absolute",
            top: "48px",
            left: "56px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          },
        },
        ticketMark(44),
        e(
          "div",
          { style: { fontSize: "30px", fontWeight: 700, color: "#ffffff" } },
          "O Bilhete",
        ),
      ),
      e(
        "div",
        {
          style: {
            fontSize: "76px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          },
        },
        `@${username}`,
      ),
      e(
        "div",
        { style: { marginTop: "20px", fontSize: "36px", color: "#e8c547" } },
        "O meu retrato cinéfilo",
      ),
      e(
        "div",
        {
          style: {
            position: "absolute",
            bottom: "44px",
            fontSize: "24px",
            color: "#888888",
          },
        },
        "Descobre o teu em obilhete.pt",
      ),
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
