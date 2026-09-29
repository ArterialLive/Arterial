"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BRAND, CHAIN, explorerAddress, shortAddress } from "@/config/brand";
import { useWallet } from "@/components/wallet/WalletProvider";
import { CheckIcon, CloseIcon, CopyIcon } from "@/components/icons";
import { useBlockNumber } from "@/components/LiveChain";

/** Header button: opens the wallet sheet, shows the short address once connected. */
export function WalletButton({ className = "", full = false, label = "Connect wallet" }: { className?: string; full?: boolean; label?: string }) {
  const { address, onRobinhoodChain } = useWallet();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`btn ${full ? "w-full" : ""} ${className}`}>
        {address ? (
          <>
            <span className={`size-2 rounded-full ${onRobinhoodChain ? "bg-money" : "bg-warn"}`} />
            <span className="num">{shortAddress(address, 5, 4)}</span>
          </>
        ) : (
          label
        )}
      </button>
      {open && <WalletSheet onClose={() => setOpen(false)} />}
    </>
  );
}

/** The same sheet, opened from any other control. */
export function useWalletSheet() {
  const [open, setOpen] = useState(false);
  return {
    open: () => setOpen(true),
    sheet: open ? <WalletSheet onClose={() => setOpen(false)} /> : null,
  };
}

function WalletSheet({ onClose }: { onClose: () => void }) {
  const wallet = useWallet();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
  // Portalled to <body>: the sticky header uses backdrop-filter, which would
  // otherwise trap this fixed overlay inside the header box.
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onMouseDown={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Wallet"
        onMouseDown={(e) => e.stopPropagation()}
        className="card relative w-full max-w-[420px] p-6 text-ink shadow-2xl max-sm:p-5"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-fg-45 hover:text-ink">
          <CloseIcon className="size-5" />
        </button>
        {wallet.address ? <Connected onClose={onClose} /> : <Picker />}
        {wallet.error && (
          <p className="mt-4 rounded-xl border border-err/30 bg-err/10 px-3 py-2 text-[13px] text-ink" role="alert">
            {wallet.error}{" "}
            <button type="button" onClick={wallet.clearError} className="font-semibold underline">
              Dismiss
            </button>
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}

function Picker() {
  const { wallets, connect, connecting } = useWallet();
  return (
    <div>
      <p className="text-[19px] font-semibold">Connect a wallet</p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-fg-60">
        {BRAND.name} lives on {CHAIN.name} (chain {CHAIN.id}). Pick a browser wallet and it will be asked to switch to the network, or add it.
      </p>
      <ul className="mt-5 space-y-2">
        {wallets.map((w) => (
          <li key={w.rdns}>
            <button
              type="button"
              disabled={connecting || Boolean(w.unsupported)}
              onClick={() => connect(w)}
              className="flex w-full items-center gap-3 rounded-xl border border-line bg-tint px-3.5 py-3 text-left text-[14.5px] font-medium transition-colors hover:bg-tint-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {w.icon ? <img src={w.icon} alt="" className="size-7 rounded-lg" /> : <span className="size-7 rounded-lg bg-tint-2" />}
              <span className="flex-1">{w.name}</span>
              <span className="text-[12px] text-fg-45">{w.unsupported ? "Not supported" : connecting ? "Waiting…" : "Connect"}</span>
            </button>
          </li>
        ))}
      </ul>
      {wallets.length === 0 && (
        <div className="card-flat mt-5 px-4 py-4 text-[14px] leading-relaxed text-fg-70">
          No browser wallet found on this page. Install MetaMask, Rabby or another EVM wallet, then reload.
        </div>
      )}
      <p className="mt-4 text-[12px] leading-relaxed text-fg-45">
        Connecting only shares your address. Nothing is signed and nothing is sent until you approve it in the wallet.
      </p>
    </div>
  );
}

function Connected({ onClose }: { onClose: () => void }) {
  const { address, walletName, balance, onRobinhoodChain, switchNetwork, switching, disconnect } = useWallet();
  const block = useBlockNumber();
  const [copied, setCopied] = useState(false);
  if (!address) return null;
  return (
    <div>
      <p className="kicker">{walletName ?? "Wallet"} connected</p>
      <div className="mt-2 flex items-center gap-2">
        <a href={explorerAddress(address)} target="_blank" rel="noreferrer" className="num text-[18px] hover:text-pulse">
          {shortAddress(address, 8, 6)}
        </a>
        <button
          type="button"
          aria-label="Copy address"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(address);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
            } catch {}
          }}
          className="grid size-7 place-items-center rounded-full bg-tint-2 hover:bg-line"
        >
          {copied ? <CheckIcon className="size-3.5 text-money" /> : <CopyIcon className="size-3.5" />}
        </button>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-2 text-[13px]">
        <div className="card-flat p-3">
          <dt className="text-fg-45">Balance</dt>
          <dd className="num mt-1 text-[16px]">{balance === null ? "…" : `${balance} ${CHAIN.nativeSymbol}`}</dd>
        </div>
        <div className="card-flat p-3">
          <dt className="text-fg-45">Network</dt>
          <dd className={`mt-1 text-[15px] font-medium ${onRobinhoodChain ? "text-money" : "text-warn"}`}>
            {onRobinhoodChain ? CHAIN.name : "Wrong network"}
          </dd>
        </div>
      </dl>
      <p className="num mt-3 text-[12px] text-fg-45">
        {block ? `${CHAIN.name} block #${block.toLocaleString("en-US")}` : `Reading ${CHAIN.name}…`}
      </p>
      {!onRobinhoodChain && (
        <button type="button" onClick={switchNetwork} disabled={switching} className="btn btn-solid btn-lg mt-4 w-full">
          {switching ? "Check your wallet…" : `Switch to ${CHAIN.name}`}
        </button>
      )}
      <div className="mt-5 border-l-2 border-pulse pl-3 text-[13px] leading-relaxed text-fg-70">
        Launching, harvesting and claiming open when the {BRAND.name} contracts go live. Your wallet stays connected so you are ready when they do.
      </div>
      <div className="mt-5 flex items-center justify-between">
        <Link href={`/profile/${address}`} onClick={onClose} className="btn">
          View profile
        </Link>
        <button type="button" onClick={disconnect} className="text-[13px] font-medium text-fg-60 underline underline-offset-4 hover:text-ink">
          Disconnect
        </button>
      </div>
    </div>
  );
}
