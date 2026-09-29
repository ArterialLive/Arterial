"use client";

import { useMemo, useState } from "react";
import { BRAND, CHAIN } from "@/config/brand";
import { COLLECTIONS, collectionBySlug, laneLabel } from "@/content/seed";
import { useWallet } from "@/components/wallet/WalletProvider";
import { useWalletSheet } from "@/components/wallet/WalletButton";
import { Avatar } from "@/components/cards/cards";
import { Bar, Eth } from "@/components/ui";
import { SearchIcon } from "@/components/icons";
import { fmtEth, pct } from "@/lib/format";

type Policy = "airdrop" | "burn";

const STEPS = [
  { title: "Token", sub: "Name, ticker, links" },
  { title: "Collection", sub: "Where fees flow" },
  { title: "NFT policy", sub: "What holders get" },
  { title: "Review", sub: "Check and launch" },
];

/** Share of the 1% trading fee that reaches the coin's router; the curve keeps the rest. */
const ROUTER_SHARE = 0.7;
const TRADE_FEE = 0.01;
const SUPPLY = 1_000_000_000;

export function LaunchWizard({ initialCollection }: { initialCollection: string | null }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState({ website: "", x: "", telegram: "" });
  const [collection, setCollection] = useState<string | null>(initialCollection && collectionBySlug(initialCollection) ? initialCollection : null);
  const [policy, setPolicy] = useState<Policy>("airdrop");
  const [taxBps, setTaxBps] = useState(100);
  const [colQuery, setColQuery] = useState("");
  const wallet = useWallet();
  const sheet = useWalletSheet();

  const col = collection ? collectionBySlug(collection) : null;
  const shownImage = image ?? (/^https?:\/\//.test(imageUrl) ? imageUrl : null);

  const tokenOk = name.trim().length >= 2 && /^[A-Z0-9]{2,10}$/.test(symbol) && Boolean(shownImage);
  const ready = [tokenOk, Boolean(col), true, tokenOk && Boolean(col)];

  const perEth = useMemo(() => {
    const router = TRADE_FEE * ROUTER_SHARE + taxBps / 10_000;
    return { vault: router * 0.8, treasury: router * 0.2, curve: TRADE_FEE * (1 - ROUTER_SHARE) };
  }, [taxBps]);
  const perTotal = perEth.vault + perEth.treasury + perEth.curve;

  const cols = COLLECTIONS.filter((c) => !colQuery || c.name.toLowerCase().includes(colQuery.toLowerCase()));

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const label = "mb-1.5 block text-[13px] text-fg-70";

  return (
    <div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((s, i) => {
          const reachable = i === 0 || ready.slice(0, i).every(Boolean);
          return (
            <li key={s.title}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => setStep(i)}
                className={`flex w-full items-start gap-2.5 rounded-2xl border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                  step === i ? "border-fg-60 bg-tint" : "border-line-2 hover:bg-tint"
                }`}
              >
                <span className={`num grid size-5 shrink-0 place-items-center rounded-full text-[10px] ${step === i ? "bg-ink text-on-ink" : "border border-line text-fg-45"}`}>
                  0{i + 1}
                </span>
                <span>
                  <span className="block text-[13.5px] font-medium">{s.title}</span>
                  <span className="block text-[11.5px] text-fg-45">{s.sub}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <section className="card p-5 sm:p-6">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-medium">Token</h2>
                <p className="text-[13px] text-fg-45">What the coin is called and where people find it.</p>
              </div>
              <p className="rounded-xl border border-line-2 bg-tint px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-60">
                <span className="num text-ink">{CHAIN.name}</span> · 80% of the coin&apos;s creator fees go to a vault that can only buy its
                paired collection&apos;s floor, 20% to the treasury.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_150px]">
                <label>
                  <span className={label}>Token name</span>
                  <input value={name} maxLength={32} onChange={(e) => setName(e.target.value)} placeholder="Token name" className="field" />
                </label>
                <label>
                  <span className={label}>Symbol</span>
                  <input
                    value={symbol}
                    maxLength={10}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    placeholder="SYMBOL"
                    className="field num"
                  />
                </label>
              </div>
              <div>
                <span className={label}>Token image · required</span>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line px-4 py-6 text-center transition-colors hover:bg-tint">
                  {shownImage ? (
                    <img src={shownImage} alt="Token preview" className="size-20 rounded-xl object-cover" />
                  ) : (
                    <>
                      <span className="text-[13.5px] font-medium">Drop an image, or click to choose</span>
                      <span className="text-[11.5px] text-fg-45">PNG, JPG, WebP, GIF or SVG, up to 5 MB. Stays in this browser for now.</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
                </label>
                <input value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImage(null); }} placeholder="…or paste an image URL" className="field num mt-2" />
              </div>
              <label className="block">
                <span className={label}>Description</span>
                <textarea value={description} maxLength={400} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What this coin is for, and which collection it feeds." className="field" />
              </label>
              <div>
                <span className={label}>Links · optional</span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(["website", "x", "telegram"] as const).map((k) => (
                    <input key={k} value={links[k]} onChange={(e) => setLinks({ ...links, [k]: e.target.value })} placeholder={k === "x" ? "X profile" : k[0].toUpperCase() + k.slice(1)} className="field" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[18px] font-medium">Collection</h2>
                <p className="text-[13px] text-fg-45">The one collection this coin&apos;s fees will buy, forever. The pairing cannot be changed later.</p>
              </div>
              <label className="relative block">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-35" />
                <input value={colQuery} onChange={(e) => setColQuery(e.target.value)} placeholder="Search listed collections" className="field pl-10" />
              </label>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {cols.map((c) => {
                  const on = collection === c.slug;
                  const saved = pct(c.budgetEth, c.floor);
                  return (
                    <li key={c.slug}>
                      <button
                        type="button"
                        onClick={() => setCollection(c.slug)}
                        className={`w-full rounded-2xl border p-3 text-left transition-colors ${on ? "border-pulse bg-pulse-soft" : "border-line-2 hover:bg-tint"}`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Avatar src={c.image} size={34} rounded="rounded-xl" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13.5px] font-medium">{c.name}</span>
                            <span className="num block text-[11px] text-fg-45">
                              floor {fmtEth(c.floor)} ETH · {c.coinTickers.length} coins · {laneLabel(c.lane)}
                            </span>
                          </span>
                        </span>
                        <span className="mt-2.5 block">
                          <Bar value={saved} tone={saved >= 100 ? "money" : undefined} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[11.5px] text-fg-45">Listed collections are a sample until the registry contract is deployed.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-medium">NFT policy</h2>
                <p className="text-[13px] text-fg-45">What happens to every NFT this coin&apos;s fees buy. Locked at launch.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(
                  [
                    ["airdrop", "Airdrop to holders", "Each NFT goes to one holder, drawn at random. A bigger bag means better odds. Nothing to enter or claim on Robinhood Chain."],
                    ["burn", "Burn", "Each NFT is sent to a dead address. The collection's circulating supply shrinks with every buy."],
                  ] as [Policy, string, string][]
                ).map(([k, title, body]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPolicy(k)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${policy === k ? "border-pulse bg-pulse-soft" : "border-line-2 hover:bg-tint"}`}
                  >
                    <span className="block text-[14.5px] font-medium">{title}</span>
                    <span className="mt-1.5 block text-[12.5px] leading-relaxed text-fg-60">{body}</span>
                  </button>
                ))}
              </div>
              <label className="block">
                <span className={`${label} flex items-center justify-between`}>
                  Creator tax <span className="num text-ink">{(taxBps / 100).toFixed(2)}%</span>
                </span>
                <input type="range" min={0} max={1000} step={25} value={taxBps} onChange={(e) => setTaxBps(Number(e.target.value))} className="w-full accent-[var(--pulse)]" />
                <span className="mt-1 block text-[11.5px] text-fg-45">
                  0 to 10%, on top of the base fee. It flows through the same 80 / 20 split; none of it goes to you directly. Your upside as a creator is the coin.
                </span>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-medium">Review</h2>
                <p className="text-[13px] text-fg-45">One transaction deploys the coin, its fee router and the pairing.</p>
              </div>
              <dl className="divide-y divide-line-2 rounded-2xl border border-line-2 text-[13px]">
                {[
                  ["Name", name || "—"],
                  ["Symbol", symbol ? `$${symbol}` : "—"],
                  ["Collection", col?.name ?? "—"],
                  ["NFT policy", policy === "airdrop" ? "Airdrop to holders" : "Burn"],
                  ["Creator tax", `${(taxBps / 100).toFixed(2)}%`],
                  ["Supply", SUPPLY.toLocaleString("en-US")],
                  ["Network", `${CHAIN.name} (${CHAIN.id})`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 px-4 py-2.5">
                    <dt className="text-fg-60">{k}</dt>
                    <dd className="num text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-2xl border border-line-2 bg-tint p-4 text-[13px] leading-relaxed">
                <p className="font-medium">Launching opens with the {BRAND.name} launcher contract.</p>
                <p className="mt-1 text-fg-60">
                  Everything above is checked and kept on this page, but no transaction is sent until the launcher is deployed and
                  audited. {wallet.address ? "Your wallet is connected and ready." : "Connect a wallet now so you are ready."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!wallet.address && (
                    <button type="button" onClick={sheet.open} className="btn">
                      Connect wallet
                    </button>
                  )}
                  {wallet.address && !wallet.onRobinhoodChain && (
                    <button type="button" onClick={wallet.switchNetwork} className="btn">
                      Switch to {CHAIN.name}
                    </button>
                  )}
                  <button type="button" disabled className="btn btn-solid">
                    Launch opens soon
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center justify-between border-t border-line-2 pt-4">
            <button type="button" onClick={() => setStep(Math.max(0, step - 1))} className="btn" disabled={step === 0}>
              ← Back
            </button>
            {step < 3 && (
              <button type="button" onClick={() => setStep(step + 1)} disabled={!ready[step]} className="btn btn-solid">
                Continue →
              </button>
            )}
          </div>
          {step === 0 && !tokenOk && <p className="mt-2 text-right text-[11.5px] text-fg-45">Name, a 2–10 character symbol and an image are needed to continue.</p>}
          {step === 1 && !col && <p className="mt-2 text-right text-[11.5px] text-fg-45">Pick a collection to continue.</p>}
        </section>

        <aside className="card self-start lg:sticky lg:top-[72px]">
          <div className="flex items-center gap-3 p-4">
            {shownImage ? (
              <img src={shownImage} alt="" className="size-11 rounded-full object-cover" />
            ) : (
              <span className="grid size-11 place-items-center rounded-full bg-tint-2 text-[15px] font-medium">{(symbol || "T")[0]}</span>
            )}
            <div className="min-w-0">
              <p className="num truncate text-[15px] font-medium">{symbol || "TICKER"}</p>
              <p className="truncate text-[12.5px] text-fg-45">{name || "Unnamed coin"}</p>
            </div>
          </div>
          <dl className="space-y-2 border-t border-line-2 p-4 text-[13px]">
            {[
              ["Flows to", col?.name ?? <span key="n" className="text-fg-45">not chosen</span>],
              ["NFT policy", <span key="p" className="chip">{policy === "airdrop" ? "Airdrop" : "Burn"}</span>],
              ["Creator tax", `${(taxBps / 100).toFixed(2)}%`],
              ["Supply", SUPPLY.toLocaleString("en-US")],
            ].map(([k, v], i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <dt className="text-fg-60">{k}</dt>
                <dd className="num text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-line-2 p-4">
            <p className="kicker flex justify-between">
              <span>Per 1 ETH traded</span>
              <span>estimate</span>
            </p>
            <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-tint-2">
              <span className="bg-pulse" style={{ width: `${(perEth.vault / perTotal) * 100}%` }} />
              <span className="bg-fg-45" style={{ width: `${(perEth.treasury / perTotal) * 100}%` }} />
              <span className="bg-fg-20" style={{ width: `${(perEth.curve / perTotal) * 100}%` }} />
            </div>
            <ul className="mt-3 space-y-1.5 text-[12.5px]">
              {[
                ["bg-pulse", "Collection vault", perEth.vault],
                ["bg-fg-45", `${BRAND.name} treasury`, perEth.treasury],
                ["bg-fg-20", "Curve / pool", perEth.curve],
              ].map(([dot, k, v]) => (
                <li key={k as string} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${dot}`} />
                    {k}
                  </span>
                  <Eth value={v as number} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-fg-45">
              A 1% trading fee, of which 70% reaches your coin&apos;s router, plus your {(taxBps / 100).toFixed(2)}% tax. The router splits 80 / 20.
              Gas and any launch-block anti-snipe tax are not included.
            </p>
          </div>
        </aside>
      </div>
      {sheet.sheet}
    </div>
  );
}
