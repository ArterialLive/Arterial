"use client";

import { useState } from "react";
import { fmtEth } from "@/lib/format";

type Point = { hoursAgo: number; total: number };
type Range = "1d" | "7d" | "all";

/** Cumulative ETH swept, with a range switch. */
export function SweepChart({ series }: { series: Point[] }) {
  const [range, setRange] = useState<Range>("all");
  const limit = range === "1d" ? 24 : range === "7d" ? 168 : Infinity;
  const pts = series.filter((p) => p.hoursAgo <= limit);
  const W = 640;
  const H = 200;
  const maxAge = Math.max(1, ...pts.map((p) => p.hoursAgo));
  const firstIdx = pts.length ? series.indexOf(pts[0]) : -1;
  const before = firstIdx > 0 ? series[firstIdx - 1].total : 0;
  const end = pts.length ? pts[pts.length - 1].total : 0;
  const lo = before;
  const hi = Math.max(end, lo + 0.0001);
  const x = (p: Point) => W - (p.hoursAgo / maxAge) * W;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * (H - 8) - 4;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(p).toFixed(1)} ${y(p.total).toFixed(1)}`).join(" ");
  const swept = end - before;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="num text-[24px]">{fmtEth(swept)} ETH</p>
          <p className="num text-[11.5px] text-fg-45">
            {pts.length} sweeps · {range === "all" ? "since the first vault" : `last ${range}`}
          </p>
        </div>
        <div className="flex gap-1">
          {(["1d", "7d", "all"] as Range[]).map((r) => (
            <button key={r} type="button" onClick={() => setRange(r)} className={`chip ${range === r ? "chip-on" : ""}`}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {pts.length > 1 ? (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-4 h-[180px] w-full" role="img" aria-label="Cumulative ETH swept">
          <defs>
            <linearGradient id="sw-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--pulse)" stopOpacity="0.25" />
              <stop offset="1" stopColor="var(--pulse)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d} L${x(pts[pts.length - 1])} ${H} L${x(pts[0])} ${H} Z`} fill="url(#sw-fill)" />
          <path d={d} fill="none" stroke="var(--pulse)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <p className="mt-6 py-10 text-center text-[13px] text-fg-45">No sweeps in this window.</p>
      )}
    </div>
  );
}
