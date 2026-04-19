"use client";

import type { DecadeStat } from "@/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          padding: "8px 12px",
        }}
      >
        <p style={{ color: "#ffffff", margin: 0, fontSize: "13px" }}>{label}</p>
        <p style={{ color: "#e8c547", margin: 0, fontSize: "13px" }}>
          {payload[0].value} filmes
        </p>
      </div>
    );
  }
  return null;
}

export function DecadeChart({ data }: { data: DecadeStat[] }) {
  return (
    <div className="h-72 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 text-sm font-medium">Décadas</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="decade" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="rgba(255,255,255,0.85)"
            fill="rgba(255,255,255,0.18)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

