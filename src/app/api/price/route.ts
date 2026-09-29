import { NextResponse } from "next/server";
import { batch } from "@/lib/chain-server";

export const dynamic = "force-dynamic";

/*
 * ETH/USD from the Chainlink price feed on Robinhood Chain, read with one
 * eth_call to latestRoundData(). No key, no third-party API. A failed read is
 * never cached, so the next request simply tries again.
 */
const FEED = "0x78F3556b67E17Df817D51Ef5a990cDaF09E8d3A9";
const LATEST_ROUND_DATA = "0xfeaf968c";
const TTL_MS = 60_000;

let cached: { usd: number; updatedAt: number; at: number } | null = null;

export async function GET() {
  if (cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json({ usd: cached.usd, updatedAt: cached.updatedAt, source: "chainlink" });
  }
  try {
    const [raw] = (await batch([{ method: "eth_call", params: [{ to: FEED, data: LATEST_ROUND_DATA }, "latest"] }])) as [string | null];
    if (!raw || raw.length < 2 + 64 * 5) throw new Error("empty");
    const word = (i: number) => BigInt(`0x${raw.slice(2 + 64 * i, 2 + 64 * (i + 1))}`);
    const usd = Number(word(1)) / 1e8;
    const updatedAt = Number(word(3));
    // A stale or nonsensical answer is treated as no answer.
    if (!(usd > 10 && usd < 1_000_000) || Date.now() / 1000 - updatedAt > 86_400) throw new Error("stale");
    cached = { usd, updatedAt, at: Date.now() };
    return NextResponse.json({ usd, updatedAt, source: "chainlink" }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ usd: null, updatedAt: null, source: "chainlink" }, { status: 200, headers: { "cache-control": "no-store" } });
  }
}
