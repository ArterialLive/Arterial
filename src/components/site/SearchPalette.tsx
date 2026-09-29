"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { COINS, coinHref, collectionBySlug } from "@/content/seed";
import { Avatar } from "@/components/cards/cards";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { fmtUsd } from "@/lib/format";

type Sort = "relevance" | "mc" | "vol" | "newest" | "oldest";
type Age = "all" | "24h" | "7d";

const SORTS: [Sort, string][] = [
  ["relevance", "Relevance"],
  ["mc", "Market cap"],
  ["vol", "24h volume"],
  ["newest", "Newest"],
  ["oldest", "Oldest"],
];
const AGES: [Age, string][] = [
  ["all", "All"],
  ["24h", "24h"],
  ["7d", "7d"],
];

/** Cmd+K coin finder. Portalled to <body> so the blurred header cannot clip it. */
export function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("relevance");
  const [age, setAge] = useState<Age>("all");
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = COINS.filter((c) => {
      if (age === "24h" && c.ageDays > 1) return false;
      if (age === "7d" && c.ageDays > 7) return false;
      if (!needle) return true;
      const col = collectionBySlug(c.collection);
      return [c.name, c.ticker, c.address, col?.name ?? ""].some((v) => v.toLowerCase().includes(needle));
    });
    const by: Record<Sort, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
      relevance: (a, b) => b.mc + b.vol - (a.mc + a.vol),
      mc: (a, b) => b.mc - a.mc,
      vol: (a, b) => b.vol - a.vol,
      newest: (a, b) => a.ageDays - b.ageDays,
      oldest: (a, b) => b.ageDays - a.ageDays,
    };
    list = [...list].sort(by[sort]);
    return list;
  }, [q, sort, age]);

  const go = (i: number) => {
    const coin = results[i];
    if (!coin) return;
    onClose();
    router.push(coinHref(coin));
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 px-4 pt-[8vh]" onMouseDown={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search coins"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setCursor((c) => Math.min(results.length - 1, c + 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setCursor((c) => Math.max(0, c - 1));
          }
          if (e.key === "Enter") go(cursor);
        }}
        className="card flex max-h-[76vh] w-full max-w-[540px] flex-col overflow-hidden shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-line-2 px-4 py-3">
          <SearchIcon className="size-4 text-fg-45" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setCursor(0);
            }}
            placeholder="Search name, ticker, collection or address"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-fg-35"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="text-fg-45 hover:text-ink">
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="space-y-2 border-b border-line-2 px-4 py-3 text-[12px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-12 text-fg-45">Sort</span>
            {SORTS.map(([k, label]) => (
              <button key={k} type="button" onClick={() => setSort(k)} className={`chip ${sort === k ? "chip-on" : ""}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-12 text-fg-45">Age</span>
            {AGES.map(([k, label]) => (
              <button key={k} type="button" onClick={() => setAge(k)} className={`chip ${age === k ? "chip-on" : ""}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto p-2">
          {results.map((c, i) => (
            <li key={c.address}>
              <button
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left ${i === cursor ? "bg-tint-2" : ""}`}
              >
                <Avatar src={c.image} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{c.name}</span>
                  <span className="num block truncate text-[11px] text-fg-45">
                    ${c.ticker} · {fmtUsd(c.mc)} MC · {fmtUsd(c.vol)} 24h vol
                  </span>
                </span>
                <span className="text-[11px] text-fg-45">{collectionBySlug(c.collection)?.name}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-fg-45">No coin matches that.</li>}
        </ul>
        <div className="num flex items-center justify-between border-t border-line-2 px-4 py-2 text-[11px] text-fg-45">
          <span>
            {results.length} of {COINS.length} sample coins
          </span>
          <span className="hidden sm:inline">↑↓ to move · Enter to open · Esc to close</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
