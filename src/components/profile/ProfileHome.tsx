"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CHAIN, isAddress, shortAddress } from "@/config/brand";
import { useWallet } from "@/components/wallet/WalletProvider";
import { WalletButton } from "@/components/wallet/WalletButton";

export function ProfileHome() {
  const router = useRouter();
  const { address } = useWallet();
  const [value, setValue] = useState("");
  const [bad, setBad] = useState(false);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className="card p-4">
          <span className="chip">{CHAIN.name}</span>
          <p className="mt-3 text-[13.5px] text-fg-60">Coins you hold, NFTs you have won and coins you launched.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {address ? (
              <Link href={`/profile/${address}`} className="btn btn-solid">
                Open {shortAddress(address, 5, 4)}
              </Link>
            ) : (
              <WalletButton label="Connect EVM wallet" />
            )}
          </div>
        </section>
        <section className="card p-4 opacity-70">
          <span className="chip">Solana</span>
          <p className="mt-3 text-[13.5px] text-fg-60">A Solana lane is planned, not built. Profiles there will sit next to this one.</p>
          <button type="button" disabled className="btn mt-4">
            Later
          </button>
        </section>
      </div>
      <section className="card p-4 sm:p-5">
        <h2 className="text-[15px] font-medium">Look up a wallet</h2>
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const v = value.trim();
            if (!isAddress(v)) {
              setBad(true);
              return;
            }
            router.push(`/profile/${v}`);
          }}
        >
          <input value={value} onChange={(e) => { setValue(e.target.value); setBad(false); }} placeholder="0x… any address" spellCheck={false} className="field num" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className={`text-[12px] ${bad ? "text-err" : "text-fg-45"}`}>{bad ? "That is not a 0x address with 40 hex characters." : "Paste an address and press Enter. No wallet needed."}</p>
            <button type="submit" className="btn shrink-0">
              View profile
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
