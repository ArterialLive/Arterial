/**
 * Browser-side chain reads, relayed through this app's server (/api/rpc).
 * Transactions never pass here: the wallet sends those itself.
 */
export async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch("/api/rpc", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  const body = (await response.json()) as { result?: T; error?: string };
  if (!response.ok || body.error) throw new Error(body.error ?? `RPC ${response.status}`);
  return body.result as T;
}

/** Formats a hex wei amount as ETH with a few significant decimals. */
export function formatEth(hexWei: string, digits = 4) {
  const wei = BigInt(hexWei);
  const whole = wei / 10n ** 18n;
  const fraction = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, digits);
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole.toString();
}

