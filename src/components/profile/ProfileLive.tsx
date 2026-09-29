"use client";

import { useEffect, useState } from "react";
import { BRAND, CHAIN, TOKEN } from "@/config/brand";
import { LiveTag } from "@/components/ui";
import { formatEth, rpc } from "@/lib/rpc";

type Facts = { eth: string; nonce: number; contract: boolean; token: string | null };

/** Live chain facts for any address: ETH balance, transactions sent, token balance once live. */
export function ProfileLive({ address }: { address: string }) {
  const [facts, setFacts] = useState<Facts | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const calls: Promise<string>[] = [
      rpc<string>("eth_getBalance", [address, "latest"]),
      rpc<string>("eth_getTransactionCount", [address, "latest"]),
      rpc<string>("eth_getCode", [address, "latest"]),
    ];
    if (TOKEN.isLive) calls.push(rpc<string>("eth_call", [{ to: BRAND.ca, data: `0x70a08231${address.slice(2).toLowerCase().padStart(64, "0")}` }, "latest"]));
    Promise.all(calls)
      .then(([bal, nonce, code, token]) => {
        if (cancelled) return;
        setFacts({ eth: formatEth(bal), nonce: Number(BigInt(nonce)), contract: code !== "0x", token: token ? formatEth(token, 2) : null });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [address]);

  const cell = (label: string, value: string, sub?: string) => (
    <div className="card p-4">
      <p className="text-[12.5px] text-fg-60">{label}</p>
      <p className="num mt-1.5 truncate text-[22px]">{value}</p>
      {sub && <p className="mt-1 text-[11.5px] text-fg-45">{sub}</p>}
    </div>
  );
  const v = (s: string) => (facts ? s : failed ? "—" : "…");

  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-[12px] text-fg-45">
        <LiveTag /> Read from {CHAIN.name} just now{failed ? ", but the chain could not be reached." : "."}
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cell("ETH balance", v(`${facts?.eth} ETH`))}
        {cell("Transactions sent", v(String(facts?.nonce)), "account nonce")}
        {cell("Account type", v(facts?.contract ? "Contract" : "Wallet"))}
        {cell(`${BRAND.symbol} held`, TOKEN.isLive ? v(`${facts?.token ?? "0"}`) : "—", TOKEN.isLive ? undefined : "token not launched")}
      </div>
    </div>
  );
}
