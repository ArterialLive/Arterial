"use client";

import { useEffect, useMemo, useState } from "react";
import { BRAND, TOKEN, explorerAddress, shortAddress } from "@/config/brand";
import { CardHead, LiveTag } from "@/components/ui";

type Row = { address: string; balance: number };
type Data = { live: boolean; holders?: number; rows?: Row[]; error?: string };

const PAGE = 25;

/** "Who is entered": token holders and the odds their balance buys. */
export function HolderTable() {
  const [data, setData] = useState<Data | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!TOKEN.isLive) return;
    fetch("/api/holders", { cache: "no-store" })
      .then((r) => r.json() as Promise<Data>)
      .then(setData)
      .catch(() => setData({ live: true, error: "Could not load holders." }));
  }, []);

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const eligible = rows.reduce((s, r) => s + r.balance, 0) || 1;
  const filtered = rows.filter((r) => !q || r.address.toLowerCase().includes(q.trim().toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  if (!TOKEN.isLive) {
    return (
      <section className="card">
        <CardHead title="Who is entered" right="at launch" />
        <p className="px-5 py-10 text-center text-[13.5px] leading-relaxed text-fg-60">
          Everyone holding {BRAND.symbol} is entered, weighted by balance. The token is not launched yet, so there is no one to list.
          <br />
          This table fills itself from {BRAND.symbol} holders on Robinhood Chain the moment the contract address is published.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <CardHead
        title={
          <span className="flex items-center gap-2">
            Who is entered <LiveTag />
          </span>
        }
        right={data?.holders ? `${data.holders.toLocaleString("en-US")} holders` : "…"}
        sub="Everyone holding the token, and the odds those holdings buy. Balances move, so this previews the next draw rather than recording one."
      />
      <div className="p-3">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search an address" className="field num" />
      </div>
      {data?.error && <p className="px-5 pb-6 text-[13px] text-fg-45">{data.error}</p>}
      {!data && <p className="px-5 pb-6 text-[13px] text-fg-45">Reading holders…</p>}
      <ul className="num divide-y divide-line-2 text-[12.5px]">
        {filtered.slice(page * PAGE, page * PAGE + PAGE).map((r) => {
          const odds = (r.balance / eligible) * 100;
          return (
            <li key={r.address} className="flex items-center gap-3 px-4 py-2">
              <span className="w-6 text-fg-35">{rows.indexOf(r) + 1}</span>
              <a href={explorerAddress(r.address)} target="_blank" rel="noreferrer" className="flex-1 truncate hover:text-pulse">
                {shortAddress(r.address, 6, 4)}
              </a>
              <span className="hidden h-1 w-20 overflow-hidden rounded-full bg-tint-2 sm:block">
                <span className="block h-full bg-ink" style={{ width: `${Math.min(100, odds * 4)}%` }} />
              </span>
              <span className="w-20 text-right text-fg-60">{r.balance >= 1e6 ? `${(r.balance / 1e6).toFixed(2)}M` : r.balance.toLocaleString("en-US")}</span>
              <span className="w-14 text-right">{odds.toFixed(2)}%</span>
            </li>
          );
        })}
      </ul>
      {filtered.length > PAGE && (
        <div className="num flex items-center justify-between border-t border-line-2 px-4 py-3 text-[12px] text-fg-45">
          <span>
            {page * PAGE + 1}–{Math.min(filtered.length, page * PAGE + PAGE)} of {filtered.length}
          </span>
          <span className="flex gap-2">
            <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="chip disabled:opacity-30">
              ←
            </button>
            <button type="button" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="chip disabled:opacity-30">
              →
            </button>
          </span>
        </div>
      )}
    </section>
  );
}
