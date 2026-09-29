"use client";

import { useState } from "react";
import { CHAIN, isAddress, shortAddress } from "@/config/brand";
import { NFTS, collectionBySlug } from "@/content/seed";
import { useWallet } from "@/components/wallet/WalletProvider";
import { UsdOf } from "@/components/LiveChain";
import { CardHead, SampleTag } from "@/components/ui";
import { formatEth, rpc } from "@/lib/rpc";
import { fmtEth } from "@/lib/format";

type Result = { address: string; eth: string | null; contract: boolean | null; prizes: typeof NFTS };

/** Address checker plus the list of prizes still waiting for a destination. */
export function ClaimsBoard() {
  const wallet = useWallet();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const waiting = NFTS.filter((n) => n.status === "onway").sort((a, b) => (a.hoursLeft ?? 0) - (b.hoursLeft ?? 0));

  const check = async (raw: string) => {
    const address = raw.trim();
    setValue(address);
    if (!isAddress(address)) {
      setError("Enter a 0x address with 40 hex characters.");
      setResult(null);
      return;
    }
    setError(null);
    setBusy(true);
    const prizes = NFTS.filter((n) => n.winner?.toLowerCase() === address.toLowerCase());
    try {
      const [bal, code] = await Promise.all([rpc<string>("eth_getBalance", [address, "latest"]), rpc<string>("eth_getCode", [address, "latest"])]);
      setResult({ address, eth: formatEth(bal), contract: code !== "0x", prizes });
    } catch {
      setResult({ address, eth: null, contract: null, prizes });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="card p-4 sm:p-5">
        <h2 className="text-[15px] font-medium">Check an address</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            check(value);
          }}
        >
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0x… paste any address" spellCheck={false} className="field num min-w-0 flex-1" />
          <button type="submit" disabled={busy} className="btn shrink-0">
            {busy ? "Reading…" : "Check"}
          </button>
        </form>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-fg-45">
          <span>Looking is a read: no wallet needed. Connect only when there is something to claim.</span>
          {wallet.address && (
            <button type="button" onClick={() => check(wallet.address!)} className="link underline underline-offset-2">
              Use my wallet
            </button>
          )}
        </div>
        {error && <p className="mt-3 text-[13px] text-err">{error}</p>}
        {result && (
          <div className="card-flat mt-4 p-4 text-[13px]">
            <p className="num">{shortAddress(result.address, 8, 6)}</p>
            <p className="mt-1 text-fg-60">
              {result.eth !== null ? (
                <>
                  Live on {CHAIN.name}: <span className="num text-ink">{result.eth} ETH</span>
                  {result.contract ? ", and this address is a contract" : ", a regular wallet"}.
                </>
              ) : (
                <>{CHAIN.name} could not be reached just now; the prize check below still ran.</>
              )}
            </p>
            <p className="mt-2">
              {result.prizes.length
                ? `${result.prizes.length} prize(s) won by this address.`
                : "No prizes for this address. Nothing needs doing: most prizes arrive on their own, and this one has none waiting."}
            </p>
          </div>
        )}
      </section>

      <section className="card">
        <CardHead
          title={
            <span className="flex items-center gap-2">
              Prizes waiting for their winners <SampleTag />
            </span>
          }
          right={`${waiting.length} waiting`}
          sub={
            <>
              NFTs from external lanes (Ethereum today) are delivered to the same address that won, once the winner confirms it. Anything
              not confirmed in time goes back into the draw.
            </>
          }
        />
        <ul className="space-y-2 p-3">
          {waiting.map((n) => {
            const col = collectionBySlug(n.collection);
            return (
              <li key={n.key} className="card-flat flex items-center gap-3 p-2.5">
                <img src={n.image} alt="" loading="lazy" style={{ imageRendering: "pixelated" }} className="size-11 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 text-[13px]">
                  <p className="truncate">
                    {col?.name} #{n.tokenId}
                  </p>
                  <p className="num truncate text-[11.5px] text-fg-45">won by {shortAddress(n.winner!, 6, 4)}</p>
                </div>
                <div className="shrink-0 text-right text-[11.5px]">
                  <p className="num text-[13px] text-money">
                    <UsdOf eth={n.priceEth} /> <span className="text-fg-45">{fmtEth(n.priceEth, 3)} ETH</span>
                  </p>
                  <p className="num text-warn">
                    {Math.floor((n.hoursLeft ?? 0) / 24)}d {(n.hoursLeft ?? 0) % 24}h left
                  </p>
                  <button type="button" onClick={() => check(n.winner!)} className="link">
                    is this you?
                  </button>
                </div>
              </li>
            );
          })}
          {waiting.length === 0 && <li className="px-2 py-8 text-center text-[13px] text-fg-45">Every prize has been delivered.</li>}
        </ul>
      </section>
    </div>
  );
}
