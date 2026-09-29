/** Number formatting shared by every page. */

export function fmtEth(v: number, digits = 4) {
  if (!Number.isFinite(v)) return "—";
  if (v > 0 && v < 10 ** -digits) return `<${(10 ** -digits).toFixed(digits)}`;
  return v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtUsd(v: number) {
  if (!Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

export function fmtUsdFull(v: number) {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function fmtInt(v: number) {
  return Math.round(v).toLocaleString("en-US");
}

export function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.max(0, Math.min(100, (part / whole) * 100));
}
