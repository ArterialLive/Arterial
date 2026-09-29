"use client";

import { useMemo, useState } from "react";
import { COINS } from "@/content/seed";
import { CoinCard } from "@/components/cards/cards";

type Sort = "newest" | "vol" | "mc" | "fees";

/** Explore › coins: sort, lane filter, graduated-only, and inactive coins tucked away. */
export function CoinExplorer({ initialSort = "vol" }: { initialSort?: Sort }) {
  const [sort, setSort] = useState<Sort>(initialSort);
  const [policy, setPolicy] = useState<"all" | "airdrop" | "burn">("all");
  const [graduatedOnly, setGraduatedOnly] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const inactive = (c: (typeof COINS)[0]) => c.vol < 1000;
  const inactiveCount = COINS.filter(inactive).length;

  const list = useMemo(() => {
    const by: Record<Sort, (a: (typeof COINS)[0], b: (typeof COINS)[0]) => number> = {
      newest: (a, b) => a.ageDays - b.ageDays,
      vol: (a, b) => b.vol - a.vol,
      mc: (a, b) => b.mc - a.mc,
      fees: (a, b) => b.feesEth - a.feesEth,
    };
    return COINS.filter((c) => (policy === "all" ? true : c.policy === policy))
      .filter((c) => (graduatedOnly ? c.graduated : true))
      .filter((c) => (showInactive ? true : !inactive(c)))
      .sort(by[sort]);
  }, [sort, policy, graduatedOnly, showInactive]);

  const chip = (on: boolean) => `chip ${on ? "chip-on" : ""}`;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["newest", "Newest"],
            ["vol", "24h volume"],
            ["mc", "Market cap"],
            ["fees", "Fees routed"],
          ] as [Sort, string][]
        ).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setSort(k)} className={chip(sort === k)}>
            {label}
          </button>
        ))}
        <span className="mx-1 hidden h-4 w-px bg-line sm:block" />
        {(
          [
            ["all", "All policies"],
            ["airdrop", "Airdrop"],
            ["burn", "Burn"],
          ] as ["all" | "airdrop" | "burn", string][]
        ).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setPolicy(k)} className={chip(policy === k)}>
            {label}
          </button>
        ))}
        <button type="button" onClick={() => setGraduatedOnly((v) => !v)} className={chip(graduatedOnly)}>
          Graduated only
        </button>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => setShowInactive((v) => !v)} className={chip(showInactive)}>
          Show quiet coins ({inactiveCount})
        </button>
        <p className="num text-[11.5px] text-fg-45">{list.length} coins · sample catalogue</p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((c) => (
          <CoinCard key={c.address} coin={c} />
        ))}
      </div>
    </div>
  );
}
