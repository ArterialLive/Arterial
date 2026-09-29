import { fmtUsd } from "@/lib/format";

/** Market-cap path drawn as a plain SVG line with a soft fill. */
export function PriceChart({ series }: { series: number[] }) {
  const W = 600;
  const H = 240;
  const min = Math.min(...series) * 0.92;
  const max = Math.max(...series) * 1.04;
  const x = (i: number) => (i / (series.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const line = series.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const up = series[series.length - 1] >= series[0];
  const stroke = up ? "var(--money)" : "var(--pulse)";
  const change = ((series[series.length - 1] - series[0]) / series[0]) * 100;
  return (
    <div>
      <div className="num flex items-baseline gap-3 px-1">
        <span className="text-[22px]">{fmtUsd(series[series.length - 1])}</span>
        <span className={`text-[12px] ${up ? "text-money" : "text-pulse"}`}>
          {up ? "+" : ""}
          {change.toFixed(1)}%
        </span>
        <span className="text-[11px] text-fg-45">market cap · 60 samples</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-3 h-[220px] w-full" role="img" aria-label="Sample market cap chart">
        <defs>
          <linearGradient id="pc-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={stroke} stopOpacity="0.28" />
            <stop offset="1" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--line-2)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={`${line} L${W} ${H} L0 ${H} Z`} fill="url(#pc-fill)" />
        <path d={line} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
