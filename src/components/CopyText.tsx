"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

/** Inline value with a copy button. */
export function CopyText({ value, label, className = "" }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        } catch {}
      }}
      title={`Copy ${value}`}
      className={`num inline-flex items-center gap-1 text-fg-60 hover:text-ink ${className}`}
    >
      {label ?? value}
      {copied ? <CheckIcon className="size-3 text-money" /> : <CopyIcon className="size-3" />}
    </button>
  );
}
