"use client";

import { useMemo, useState } from "react";
import { COLLECTIONS, NFTS, type NftStatus } from "@/content/seed";
import { NftCard } from "@/components/cards/cards";

type Sort = "newest" | "oldest" | "high" | "low";

const STATUSES: [NftStatus | "all", string][] = [
  ["all", "All"],
  ["vault", "In the vault"],
  ["given", "Given away"],
  ["onway", "On its way"],
  ["burned", "Burned"],
];

export function GalleryGrid() {
  const [collection, setCollection] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [status, setStatus] = useState<NftStatus | "all">("all");
  const [limit, setLimit] = useState(30);

  const base = useMemo(() => NFTS.filter((n) => collection === "all" || n.collection === collection), [collection]);
  const count = (s: NftStatus | "all") => (s === "all" ? base.length : base.filter((n) => n.status === s).length);

  const list = useMemo(() => {
    const by: Record<Sort, (a: (typeof NFTS)[0], b: (typeof NFTS)[0]) => number> = {
      newest: (a, b) => a.hoursAgo - b.hoursAgo,
      oldest: (a, b) => b.hoursAgo - a.hoursAgo,
      high: (a, b) => b.priceEth - a.priceEth,
      low: (a, b) => a.priceEth - b.priceEth,
    };
    return base.filter((n) => status === "all" || n.status === status).sort(by[sort]);
  }, [base, status, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <select value={collection} onChange={(e) => { setCollection(e.target.value); setLimit(30); }} aria-label="Collection" className="chip cursor-pointer bg-transparent pr-2 text-ink">
          <option value="all" className="bg-card">All collections ({NFTS.length})</option>
          {COLLECTIONS.filter((c) => c.swept).map((c) => (
            <option key={c.slug} value={c.slug} className="bg-card">
              {c.name} ({NFTS.filter((n) => n.collection === c.slug).length})
            </option>
          ))}
        </select>
        <span className="mx-1 hidden h-4 w-px bg-line sm:block" />
        {(
          [
            ["newest", "Newest"],
            ["oldest", "Oldest"],
            ["high", "Most expensive"],
            ["low", "Cheapest"],
          ] as [Sort, string][]
        ).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setSort(k)} className={`chip ${sort === k ? "chip-on" : ""}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {STATUSES.map(([k, label]) => (
          <button key={k} type="button" onClick={() => { setStatus(k); setLimit(30); }} className={`chip ${status === k ? "chip-on" : ""}`}>
            {label} <span className="chip-sub">{count(k)}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {list.slice(0, limit).map((n) => (
          <NftCard key={n.key} nft={n} />
        ))}
      </div>
      {list.length === 0 && <p className="card mt-4 px-4 py-10 text-center text-[13px] text-fg-45">Nothing in this view.</p>}
      {list.length > limit && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setLimit(limit + 30)} className="btn btn-lg">
            Show more ({list.length - limit} left)
          </button>
        </div>
      )}
    </div>
  );
}
