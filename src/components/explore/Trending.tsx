import Link from "next/link";
import { Avatar } from "@/components/cards/cards";
import { COINS, coinHref } from "@/content/seed";
import { fmtUsd } from "@/lib/format";

/** Slow marquee of the busiest coins; the list is doubled so the loop is seamless. */
export function Trending() {
  const hot = [...COINS].sort((a, b) => b.vol - a.vol).slice(0, 8);
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-medium">Trending</h2>
        <Link href="/explore?sort=vol" className="link text-[12.5px]">
          View all →
        </Link>
      </div>
      <div className="relative mt-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee flex w-max gap-2.5">
          {[...hot, ...hot].map((c, i) => (
            <Link key={`${c.ticker}-${i}`} href={coinHref(c)} aria-hidden={i >= hot.length} tabIndex={i >= hot.length ? -1 : undefined} className="card flex w-[200px] shrink-0 flex-col gap-2 p-3 transition-colors hover:border-fg-35">
              <span className="flex items-center gap-2">
                <Avatar src={c.image} size={28} rounded="rounded-full" />
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold">{c.ticker}</span>
                  <span className="block truncate text-[11px] text-fg-45">{c.name}</span>
                </span>
              </span>
              <span className="num flex items-end justify-between">
                <span>
                  <span className="block text-[16px]">{fmtUsd(c.mc)}</span>
                  <span className="text-[10px] text-fg-45">MC</span>
                </span>
                <span className="text-right">
                  <span className="block text-[12px] text-fg-70">{fmtUsd(c.vol)}</span>
                  <span className="text-[10px] text-fg-45">24H VOL</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
