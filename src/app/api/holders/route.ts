import { NextResponse } from "next/server";
import { BRAND, CHAIN, TOKEN } from "@/config/brand";

export const dynamic = "force-dynamic";

/*
 * Top holders of the project token, from the public Blockscout API (no key).
 * Before launch there is no token, so the answer is simply "not live".
 */
const EXCLUDED = new Set(["0x000000000000000000000000000000000000dead", "0x0000000000000000000000000000000000000000"]);

type Holder = { address: { hash: string; is_contract?: boolean }; value: string };

export async function GET() {
  if (!TOKEN.isLive) return NextResponse.json({ live: false });
  try {
    const base = `${CHAIN.explorer}/api/v2/tokens/${BRAND.ca}`;
    const [info, holders] = await Promise.all([
      fetch(base, { cache: "no-store", signal: AbortSignal.timeout(8000) }).then((r) => r.json() as Promise<{ holders_count?: string; holders?: string; total_supply?: string; decimals?: string }>),
      fetch(`${base}/holders`, { cache: "no-store", signal: AbortSignal.timeout(8000) }).then((r) => r.json() as Promise<{ items?: Holder[] }>),
    ]);
    const decimals = Number(info.decimals ?? 18);
    const rows = (holders.items ?? [])
      .filter((h) => !EXCLUDED.has(h.address.hash.toLowerCase()) && !h.address.is_contract)
      .map((h) => ({ address: h.address.hash, balance: Number(BigInt(h.value) / 10n ** BigInt(Math.max(0, decimals - 2))) / 100 }));
    return NextResponse.json({
      live: true,
      holders: Number(info.holders_count ?? info.holders ?? rows.length),
      supply: info.total_supply ? Number(BigInt(info.total_supply) / 10n ** BigInt(decimals)) : null,
      rows,
    });
  } catch {
    return NextResponse.json({ live: true, error: "The explorer could not be reached." }, { status: 200 });
  }
}
