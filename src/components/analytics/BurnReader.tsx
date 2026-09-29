"use client";

import { useEffect, useState } from "react";
import { BRAND, TOKEN } from "@/config/brand";
import { rpc } from "@/lib/rpc";

const DEAD = "000000000000000000000000000000000000dEaD".toLowerCase();

/**
 * Reads the token's total supply and the balance of the burn address straight
 * from the chain. Before the token exists there is nothing to read.
 */
export function BurnReader() {
  const [state, setState] = useState<{ burned: number; supply: number } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!TOKEN.isLive) return;
    Promise.all([
      rpc<string>("eth_call", [{ to: BRAND.ca, data: "0x18160ddd" }, "latest"]),
      rpc<string>("eth_call", [{ to: BRAND.ca, data: `0x70a08231${DEAD.padStart(64, "0")}` }, "latest"]),
    ])
      .then(([supply, burned]) => setState({ supply: Number(BigInt(supply) / 10n ** 18n), burned: Number(BigInt(burned) / 10n ** 18n) }))
      .catch(() => setFailed(true));
  }, []);

  const tile = (label: string, value: string, sub: string) => (
    <div className="card p-4">
      <p className="text-[12.5px] text-fg-60">{label}</p>
      <p className="num mt-1.5 text-[24px]">{value}</p>
      <p className="mt-1 text-[11.5px] text-fg-45">{sub}</p>
    </div>
  );

  if (!TOKEN.isLive)
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tile("Burned", "—", `${BRAND.symbol} not launched`)}
        {tile("Share of supply", "—", "read on chain at launch")}
        {tile("Burns", "0", "transactions")}
        {tile("Spent buying it back", "—", "treasury ETH")}
      </div>
    );
  const pctBurned = state ? (state.burned / Math.max(1, state.supply)) * 100 : 0;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tile("Burned", state ? `${(state.burned / 1e6).toFixed(2)}M` : failed ? "—" : "…", BRAND.ticker)}
      {tile("Share of supply", state ? `${pctBurned.toFixed(2)}%` : failed ? "—" : "…", state ? `of ${(state.supply / 1e6).toFixed(0)}M total` : "live read")}
      {tile("Burns", "—", "counted once the keeper runs")}
      {tile("Spent buying it back", "—", "treasury ETH")}
    </div>
  );
}
