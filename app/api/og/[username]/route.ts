import { ImageResponse } from "@vercel/og";
import React from "react";
import { getCachedProfile } from "@/lib/cache";
import type { CachedProfile } from "@/types";

export const runtime = "nodejs";

function topKey(record: Record<string, number>): string {
  return (
    Object.entries(record).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Desconhecido"
  );
}

function buildOgCard(data: {
  displayName: string;
  username: string;
  personalityTag?: string;
  totalFilms?: number;
  favouriteDecade?: string;
  favouriteCountry?: string;
  favouriteGenre?: string;
}) {
  const {
    displayName,
    username,
    personalityTag,
    totalFilms,
    favouriteDecade,
    favouriteCountry,
    favouriteGenre,
  } = data;

  const statPills = [
    `${totalFilms ?? 0} filmes assistidos`,
    `Década favorita: ${favouriteDecade ?? "Desconhecido"}`,
    `País favorito: ${favouriteCountry ?? "Desconhecido"}`,
    `Género favorito: ${favouriteGenre ?? "Desconhecido"}`,
  ];

  return React.createElement(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#0a0a0a",
        color: "#ffffff",
        padding: "56px 60px",
        fontFamily: "sans-serif",
      },
    },
    React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        opacity: 0.08,
        backgroundImage:
          "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.18) 0 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.12) 0 1px, transparent 1px)",
        backgroundSize: "12px 12px, 18px 18px",
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(135deg, rgba(232,197,71,0.06) 0%, rgba(10,10,10,0) 40%, rgba(17,17,17,0.4) 100%)",
      },
    }),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          position: "relative",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.24em",
            color: "#e8c547",
            fontWeight: 700,
          },
        },
        "O BILHETE",
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              maxWidth: "56%",
            },
          },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1,
                color: "#ffffff",
              },
            },
            displayName,
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                marginTop: 16,
                fontSize: 28,
                color: "#888888",
              },
            },
            `@${username}`,
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                marginTop: 22,
                fontSize: 24,
                color: "#e8c547",
                fontStyle: "italic",
              },
            },
            personalityTag ?? "Conhece o teu gosto.",
          ),
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              width: "40%",
            },
          },
          ...statPills.map((pill) =>
            React.createElement(
              "div",
              {
                key: pill,
                style: {
                  display: "flex",
                  alignItems: "center",
                  minHeight: 96,
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#111111",
                  padding: "20px 22px",
                  fontSize: 24,
                  color: "#f5f5f5",
                  lineHeight: 1.3,
                },
              },
              pill,
            ),
          ),
        ),
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "center",
            fontSize: 18,
            color: "#888888",
            letterSpacing: "0.08em",
          },
        },
        "obilhete.pt",
      ),
    ),
  );
}

function genericData(username: string) {
  const clean = username.replace(/^@+/, "").trim() || "obilhete";
  return {
    displayName: "O Bilhete",
    username: clean,
    personalityTag: "Descobre o teu perfil cinefilo",
    totalFilms: 0,
    favouriteDecade: "Desconhecido",
    favouriteCountry: "Desconhecido",
    favouriteGenre: "Desconhecido",
  };
}

function cachedData(profile: CachedProfile) {
  return {
    displayName: profile.profile.displayName || profile.username,
    username: profile.username,
    personalityTag: profile.stats.personalityTag,
    totalFilms: profile.stats.totalFilms,
    favouriteDecade: topKey(profile.stats.decadeBreakdown),
    favouriteCountry: topKey(profile.stats.countryBreakdown),
    favouriteGenre: topKey(profile.stats.genreBreakdown),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw).replace(/^@+/, "").toLowerCase();
  const cached = await getCachedProfile(username);

  return new ImageResponse(buildOgCard(cached ? cachedData(cached) : genericData(username)), {
    width: 1200,
    height: 630,
  });
}

