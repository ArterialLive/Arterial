"use client";

import { useMemo, useState } from "react";
import { COINS } from "@/content/seed";
import { CoinTile } from "@/components/cards/cards";
import { SearchIcon } from "@/components/icons";

type Sort = "mc" | "vol" | "fees" | "newest";
type Filter = "all" | "graduated" | "curve";

const PAGE = 12;

/** Home "Top coins" grid: filter, sort, search and a small pager. */
export function CoinBoard() {
  const [sort, setSort] = useState<Sort>("mc");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const by: Record<Sort, (a: (typeof COINS)[0], b: (typeof COINS)[0]) => number> = {
      mc: (a, b) => b.mc - a.mc,
      vol: (a, b) => b.vol - a.vol,
      fees: (a, b) => b.feesEth - a.feesEth,
      newest: (a, b) => a.ageDays - b.ageDays,
    };
    return COINS.filter((c) => (filter === "graduated" ? c.graduated : filter === "curve" ? !c.graduated : true))
      .filter((c) => !needle || [c.name, c.ticker, c.address].some((v) => v.toLowerCase().includes(needle)))
      .sort(by[sort]);
  }, [sort, filter, q]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const current = Math.min(page, pages - 1);
  const shown = list.slice(current * PAGE, current * PAGE + PAGE);

  const chip = (on: boolean) => `chip ${on ? "chip-on" : ""}`;

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="h-section mr-2">Top coins</h2>
        {(
          [
            ["all", "All"],
            ["graduated", "Graduated"],
            ["curve", "On the curve"],
          ] as [Filter, string][]
        ).map(([k, label]) => (
          <button key={k} type="button" className={chip(filter === k)} onClick={() => { setFilter(k); setPage(0); }}>
            {label}
          </button>
        ))}
        <span className="mx-1 hidden h-4 w-px bg-line sm:block" />
        {(
          [
            ["newest", "Newest"],
            ["vol", "24h volume"],
            ["mc", "Market cap"],
            ["fees", "Fees routed"],
          ] as [Sort, string][]
        ).map(([k, label]) => (
          <button key={k} type="button" className={chip(sort === k)} onClick={() => { setSort(k); setPage(0); }}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="num flex shrink-0 items-center gap-2 text-[12px] text-fg-45">
          <button type="button" aria-label="Previous page" disabled={current === 0} onClick={() => setPage(current - 1)} className="px-1 hover:text-ink disabled:opacity-30">
            «
          </button>
          <span>
            {current + 1} / {pages}
          </span>
          <button type="button" aria-label="Next page" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="px-1 hover:text-ink disabled:opacity-30">
            »
          </button>
        </div>
        <label className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-35" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search name, ticker or address" className="field pl-10" />
        </label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((c) => (
          <CoinTile key={c.address} coin={c} />
        ))}
      </div>
      {shown.length === 0 && <p className="card mt-4 px-4 py-8 text-center text-[13px] text-fg-45">Nothing matches that search.</p>}
    </section>
  );
}
