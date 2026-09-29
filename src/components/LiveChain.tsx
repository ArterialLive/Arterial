"use client";

import { useSyncExternalStore } from "react";
import { CHAIN } from "@/config/brand";

/*
 * Live Robinhood Chain facts, read through this site's /api/rpc relay, plus
 * ETH/USD from the Chainlink feed on the same chain (/api/price). One shared
 * poller feeds every component, so many readers cost one request.
 */

type Facts = { block: number | null; gasGwei: number | null; ok: boolean | null; ethUsd: number | null };

const EMPTY: Facts = { block: null, gasGwei: null, ok: null, ethUsd: null };
let facts: Facts = EMPTY;
const listeners = new Set<() => void>();
let timer: number | null = null;
let ticks = 0;

function emit() {
  listeners.forEach((l) => l());
}

async function pollChain() {
  try {
    const res = await fetch("/api/rpc", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([
        { jsonrpc: "2.0", id: 0, method: "eth_blockNumber", params: [] },
        { jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] },
      ]),
      cache: "no-store",
    });
    const body = (await res.json()) as { result?: string }[];
    if (!res.ok || !Array.isArray(body)) throw new Error("rpc");
    facts = {
      ...facts,
      block: body[0]?.result ? Number(BigInt(body[0].result)) : null,
      gasGwei: body[1]?.result ? Number(BigInt(body[1].result)) / 1e9 : null,
      ok: true,
    };
  } catch {
    facts = { ...facts, ok: false };
  }
  emit();
}

async function pollPrice() {
  try {
    const res = await fetch("/api/price", { cache: "no-store" });
    const body = (await res.json()) as { usd: number | null };
    if (typeof body.usd === "number") {
      facts = { ...facts, ethUsd: body.usd };
      emit();
    }
  } catch {
    // Keep the last price; dollar figures simply stay hidden until one arrives.
  }
}

function tick() {
  pollChain();
  if (ticks % 10 === 0) pollPrice();
  ticks++;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === null) {
    tick();
    timer = window.setInterval(tick, 6000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

export function useChainFacts() {
  return useSyncExternalStore(subscribe, () => facts, () => EMPTY);
}

export function useBlockNumber() {
  return useChainFacts().block;
}

export function useEthUsd() {
  return useChainFacts().ethUsd;
}

/** Converts an ETH amount to a USD string once the live price is known. */
export function UsdOf({ eth, className = "" }: { eth: number; className?: string }) {
  const usd = useEthUsd();
  if (usd === null) return null;
  const v = eth * usd;
  const text = v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v.toFixed(v < 10 ? 2 : 0)}`;
  return <span className={className}>{text}</span>;
}

/** One-line live chain readout: block, gas and ETH price. */
export function ChainLine({ className = "" }: { className?: string }) {
  const { block, gasGwei, ok, ethUsd } = useChainFacts();
  return (
    <div className={`num flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-fg-45 ${className}`}>
      <span className="flex items-center gap-1.5">
        <span key={block ?? 0} className={`beat size-1.5 rounded-full ${ok === false ? "bg-warn" : "bg-pulse"}`} />
        {CHAIN.name}
      </span>
      <span>block {block ? `#${block.toLocaleString("en-US")}` : "…"}</span>
      <span>gas {gasGwei !== null ? `${gasGwei < 0.01 ? gasGwei.toFixed(4) : gasGwei.toFixed(3)} gwei` : "…"}</span>
      <span>ETH {ethUsd !== null ? `$${ethUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "…"}</span>
      {ok === false && <span>chain unreachable, retrying</span>}
    </div>
  );
}
