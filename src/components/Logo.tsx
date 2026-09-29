import { BRAND } from "@/config/brand";

/** The Arterial mark: three fee streams merging into one vault node. Same shapes as scripts/brand-mark.mjs. */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 7 C13 22 32 20 32 34" />
        <path d="M32 5 L32 34" />
        <path d="M51 7 C51 22 32 20 32 34" />
      </g>
      <circle cx="32" cy="46" r="11" fill="currentColor" />
      <circle cx="32" cy="46" r="4.2" fill="var(--bg)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <Mark className="size-[26px] text-pulse" />
      <span className="text-[19px] font-semibold tracking-[-0.02em] text-ink">{BRAND.name.toLowerCase()}</span>
    </span>
  );
}
