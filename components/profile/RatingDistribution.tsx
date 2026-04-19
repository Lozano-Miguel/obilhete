"use client";

import type { RatingBucket } from "@/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RatingDistribution({ data }: { data: RatingBucket[] }) {
  return (
    <div className="h-72 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 text-sm font-medium">Distribuição de ratings</div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="rating" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
            }}
          />
          <Bar dataKey="value" fill="rgba(255,255,255,0.85)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

