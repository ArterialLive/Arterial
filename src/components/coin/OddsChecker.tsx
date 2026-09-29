"use client";

import { useState } from "react";
import { isAddress } from "@/config/brand";
import { rpc, formatEth } from "@/lib/rpc";

/**
 * "Your odds" box. The coin itself is a sample, so there is no balance to
 * read yet; the check still validates the address and reads its real ETH
 * balance on Robinhood Chain, so the box is honest about what it knows.
 */
export function OddsChecker({ ticker, eligible, holdersShare }: { ticker: string; eligible: number; holdersShare: number }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "bad" | "busy" | "done"; eth?: string }>({ kind: "idle" });

  const check = async () => {
    const v = value.trim();
    if (!isAddress(v)) {
      setState({ kind: "bad" });
      return;
    }
    setState({ kind: "busy" });
    try {
      const hex = await rpc<string>("eth_getBalance", [v, "latest"]);
      setState({ kind: "done", eth: formatEth(hex) });
    } catch {
      setState({ kind: "done" });
    }
  };

  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
      >
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0x… any wallet" className="field num min-w-0 flex-1" spellCheck={false} />
        <button type="submit" className="btn shrink-0" disabled={state.kind === "busy"}>
          {state.kind === "busy" ? "…" : "Check"}
        </button>
      </form>
      <p className="mt-2.5 text-[12.5px] text-fg-60">
        {state.kind === "bad" && "That is not a 0x address with 40 hex characters."}
        {state.kind === "idle" && "Paste any wallet to see its chance in the next draw."}
        {state.kind === "busy" && "Reading Robinhood Chain…"}
        {state.kind === "done" && (
          <>
            This wallet holds no {ticker}: the coin is a sample and is not on chain yet.
            {state.eth !== undefined && <> Its live ETH balance on Robinhood Chain is <span className="num text-ink">{state.eth} ETH</span>.</>}
          </>
        )}
      </p>
      <p className="mt-3 text-[11.5px] leading-relaxed text-fg-45">
        How the estimate works: your {ticker} as a share of the {eligible.toLocaleString("en-US")} held by wallets that can win
        (pools, the curve and contracts are left out), times the {holdersShare.toFixed(1)}% of each draw that this coin&apos;s
        holders fund. Tickets are fixed when a draw opens.
      </p>
    </div>
  );
}
