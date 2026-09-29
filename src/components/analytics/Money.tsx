"use client";

import { useEthUsd } from "@/components/LiveChain";
import { Eth } from "@/components/ui";
import { fmtUsd } from "@/lib/format";

/** Big USD figure (live ETH price) over the ETH amount it came from. */
export function Money({ eth, tone }: { eth: number; tone?: "money" }) {
  const usd = useEthUsd();
  return (
    <div>
      <p className={`num text-[26px] leading-tight ${tone === "money" ? "text-money" : ""}`}>{usd === null ? "…" : fmtUsd(eth * usd)}</p>
      <Eth value={eth} className="mt-1 text-[12px] text-fg-60" />
    </div>
  );
}

export function PriceNote() {
  const usd = useEthUsd();
  return (
    <>
      Dollar figures convert at the live Chainlink ETH/USD price on Robinhood Chain
      {usd !== null ? <span className="num"> (${usd.toLocaleString("en-US", { maximumFractionDigits: 0 })})</span> : " (loading)"}.
    </>
  );
}
