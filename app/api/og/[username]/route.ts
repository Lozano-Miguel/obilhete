import { ImageResponse } from "@vercel/og";
import React from "react";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: { username: string } },
) {
  const { username } = params;

  return new ImageResponse(
    React.createElement(
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
          color: "white",
          fontFamily: "sans-serif",
        },
      },
      React.createElement(
        "div",
        { style: { fontSize: "48px", color: "#e8c547" } },
        "O Bilhete",
      ),
      React.createElement(
        "div",
        { style: { fontSize: "32px", marginTop: "16px" } },
        username,
      ),
    ),
    {
    width: 1200,
    height: 630,
  });
}

