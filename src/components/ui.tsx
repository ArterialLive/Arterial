import Link from "next/link";
import type { ReactNode } from "react";
import { EthGlyph, ExternalIcon } from "@/components/icons";
import { fmtEth } from "@/lib/format";

/** Title block that opens every inner page. */
export function PageHead({ title, sub, children }: { title: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="pb-6 pt-10 sm:pt-14">
      <h1 className="h-page">{title}</h1>
      {sub && <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-fg-60">{sub}</p>}
      {children}
    </div>
  );
}

/** ETH amount with the diamond glyph. */
export function Eth({ value, digits = 4, className = "" }: { value: number; digits?: number; className?: string }) {
  return (
    <span className={`num inline-flex items-center gap-1 ${className}`}>
      <EthGlyph className="h-[0.85em] w-[0.55em] shrink-0 text-fg-60" />
      {fmtEth(value, digits)}
    </span>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "money" | "pulse" }) {
  return (
    <div className="card p-4">
      <p className="text-[12.5px] text-fg-60">{label}</p>
      <p className={`num mt-1.5 text-[24px] leading-tight ${tone === "money" ? "text-money" : tone === "pulse" ? "text-pulse" : ""}`}>{value}</p>
      {sub && <p className="mt-1 text-[11.5px] text-fg-45">{sub}</p>}
    </div>
  );
}

/** Marks a block as illustrative until the protocol contracts exist. */
export function SampleTag({ className = "" }: { className?: string }) {
  return (
    <span
      title="Illustrative data. The Arterial contracts are not deployed yet."
      className={`badge border border-warn/40 bg-warn/10 text-warn ${className}`}
    >
      sample
    </span>
  );
}

export function LiveTag({ className = "" }: { className?: string }) {
  return (
    <span title="Read from Robinhood Chain right now" className={`badge border border-money/40 bg-money/10 text-money ${className}`}>
      <span className="size-1.5 rounded-full bg-money" /> live
    </span>
  );
}

export function Bar({ value, tone }: { value: number; tone?: "money" | "pulse" }) {
  return (
    <div className="bar">
      <span
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        className={tone === "money" ? "!bg-money" : tone === "pulse" ? "!bg-pulse" : ""}
      />
    </div>
  );
}

/** Link-based tab strip; each tab is a real URL so views can be shared. */
export function TabLinks({ tabs, active }: { tabs: { key: string; label: string; sub?: string; href: string }[]; active: string }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {tabs.map((t) => (
        <Link key={t.key} href={t.href} scroll={false} className={`chip ${t.key === active ? "chip-on" : ""}`}>
          {t.label}
          {t.sub && <span className="chip-sub">{t.sub}</span>}
        </Link>
      ))}
    </div>
  );
}

export function Ext({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`link inline-flex items-center gap-0.5 ${className}`}>
      {children}
      <ExternalIcon className="size-3.5" />
    </a>
  );
}

export function CardHead({ title, right, sub }: { title: ReactNode; right?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="border-b border-line-2 px-4 py-3.5 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-medium">{title}</h2>
        {right && <div className="num shrink-0 text-[12px] text-fg-45">{right}</div>}
      </div>
      {sub && <p className="mt-1.5 text-[13px] leading-relaxed text-fg-60">{sub}</p>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card px-5 py-10 text-center text-[14px] text-fg-60">{children}</div>;
}
