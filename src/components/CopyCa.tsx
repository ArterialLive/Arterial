"use client";

import { useState } from "react";
import { BRAND, TOKEN, explorerToken, shortAddress } from "@/config/brand";
import { CheckIcon, CopyIcon, GithubIcon, XIcon } from "@/components/icons";

/**
 * Copies the contract address. While `BRAND.ca` is not a valid 0x address the
 * token is not launched: the control stays visible, calm and disabled. Setting
 * a real address in src/config/brand.ts turns every copy on at once.
 */
function useCopyCa() {
  const [copied, setCopied] = useState(false);
  const live = TOKEN.isLive;
  const copy = async () => {
    if (!live) return;
    try {
      await navigator.clipboard.writeText(BRAND.ca);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the address stays visible to select by hand.
    }
  };
  return { live, copied, copy };
}

/**
 * Compact pill for the navbar, the mobile menu and the home hero.
 * `className` carries the display utility (default inline-flex) so callers can hide it per breakpoint.
 */
export function CopyCaPill({ className = "inline-flex" }: { className?: string }) {
  const { live, copied, copy } = useCopyCa();
  return (
    <button
      type="button"
      onClick={copy}
      disabled={!live}
      title={live ? `Copy ${BRAND.symbol} contract address` : `${BRAND.symbol} contract address is published at launch`}
      aria-label={live ? `Copy ${BRAND.symbol} contract address` : `${BRAND.symbol} contract address, published at launch`}
      className={`items-center gap-2 rounded-full border border-line bg-tint px-3 py-[6px] text-[12.5px] transition-colors hover:bg-tint-2 disabled:cursor-default disabled:hover:bg-tint ${className}`}
    >
      <span className="font-semibold text-ink">{BRAND.symbol}</span>
      <span className="num text-fg-60">{live ? shortAddress(BRAND.ca, 6, 4) : "CA soon"}</span>
      {live &&
        (copied ? <CheckIcon className="size-3.5 text-money" /> : <CopyIcon className="size-3.5 text-fg-45" />)}
    </button>
  );
}

/** Token block for the footer. */
export function CaBlock() {
  const { live, copied, copy } = useCopyCa();
  return (
    <div className="w-full max-w-[320px]">
      <p className="kicker">{BRAND.symbol} contract</p>
      <div className="mt-3 flex items-center gap-2 rounded-full border border-line bg-field py-1 pl-4 pr-1">
        <span className="num min-w-0 flex-1 truncate text-[12.5px] text-fg-70">
          {live ? shortAddress(BRAND.ca, 10, 8) : "Published at launch"}
        </span>
        <button
          type="button"
          onClick={copy}
          disabled={!live}
          aria-label={live ? "Copy contract address" : "Contract address published at launch"}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-tint-2 text-ink transition-colors hover:bg-line disabled:opacity-40 disabled:hover:bg-tint-2"
        >
          {copied ? <CheckIcon className="size-4 text-money" /> : <CopyIcon className="size-4" />}
        </button>
      </div>
      <p className="mt-2 text-[12px] text-fg-45">
        {live ? "Robinhood Chain · tap to copy" : "Robinhood Chain · the address appears here on launch day"}
      </p>
      <div className="mt-3 flex items-center gap-4 text-[13px]">
        {live && (
          <a href={explorerToken(BRAND.ca)} target="_blank" rel="noreferrer" className="link">
            Explorer
          </a>
        )}
        <a href={BRAND.x} target="_blank" rel="noreferrer" className="link flex items-center gap-1.5">
          <XIcon className="size-3.5" /> {BRAND.xHandle}
        </a>
        {BRAND.github && (
          <a href={BRAND.github} target="_blank" rel="noreferrer" className="link flex items-center gap-1.5">
            <GithubIcon className="size-4" /> GitHub
          </a>
        )}
      </div>
    </div>
  );
}
