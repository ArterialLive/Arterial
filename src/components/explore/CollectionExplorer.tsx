"use client";

import { useMemo, useState } from "react";
import { COLLECTIONS, type Lane } from "@/content/seed";
import { CollectionCard } from "@/components/cards/cards";

type Sort = "activity" | "fees" | "swept" | "coins" | "name";

/** Explore › collections: lane filter with counts and a sort row. */
export function CollectionExplorer() {
  const [lane, setLane] = useState<"all" | Lane>("all");
  const [sort, setSort] = useState<Sort>("activity");

  const count = (l: "all" | Lane) => (l === "all" ? COLLECTIONS.length : COLLECTIONS.filter((c) => c.lane === l).length);

  const list = useMemo(() => {
    const by: Record<Sort, (a: (typeof COLLECTIONS)[0], b: (typeof COLLECTIONS)[0]) => number> = {
      activity: (a, b) => b.swept + b.coinTickers.length * 5 - (a.swept + a.coinTickers.length * 5),
      fees: (a, b) => b.feesEth - a.feesEth,
      swept: (a, b) => b.swept - a.swept,
      coins: (a, b) => b.coinTickers.length - a.coinTickers.length,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return COLLECTIONS.filter((c) => lane === "all" || c.lane === lane).sort(by[sort]);
  }, [lane, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["robinhood", "Robinhood Chain"],
              ["ethereum", "Ethereum"],
            ] as ["all" | Lane, string][]
          ).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setLane(k)} className={`chip ${lane === k ? "chip-on" : ""}`}>
              {label} <span className="chip-sub">{count(k)}</span>
            </button>
          ))}
        </div>
        <p className="num text-[11.5px] text-fg-45">{list.length} collections</p>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {(["activity", "fees", "swept", "coins", "name"] as Sort[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSort(k)}
            className={`num rounded-md px-2 py-1 text-[10.5px] uppercase tracking-wider ${sort === k ? "bg-tint-2 text-ink" : "text-fg-45 hover:text-ink"}`}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <CollectionCard key={c.slug} c={c} />
        ))}
      </div>
    </div>
  );
}
