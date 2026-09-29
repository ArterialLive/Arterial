import Link from "next/link";
import type { ReactNode } from "react";
import { Bar, Eth } from "@/components/ui";
import { UsdOf } from "@/components/LiveChain";
import {
  COINS,
  type Coin,
  type Collection,
  type Nft,
  agoLabel,
  coinByTicker,
  coinHref,
  collectionBySlug,
  collectionHref,
  laneLabel,
} from "@/content/seed";
import { fmtEth, fmtInt, fmtUsd, pct } from "@/lib/format";

export function Avatar({ src, size = 28, rounded = "rounded-lg" }: { src: string; size?: number; rounded?: string }) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      style={{ width: size, height: size, imageRendering: "pixelated" }}
      className={`shrink-0 border border-line-2 bg-tint ${rounded}`}
    />
  );
}

export function PolicyBadge({ policy }: { policy: Coin["policy"] }) {
  return policy === "airdrop" ? (
    <span className="badge border border-money/35 bg-money/10 text-money">Airdrop</span>
  ) : (
    <span className="badge border border-pulse/40 bg-pulse-soft text-pulse">Burn</span>
  );
}

export function LaneChip({ lane }: { lane: Collection["lane"] }) {
  return (
    <span className="badge border border-line text-fg-60">
      <span className={`size-1.5 rounded-full ${lane === "robinhood" ? "bg-money" : "bg-fg-45"}`} />
      {laneLabel(lane)}
    </span>
  );
}

/** Home grid card: art, market numbers, the collection it sweeps. */
export function CoinTile({ coin }: { coin: Coin }) {
  const col = collectionBySlug(coin.collection);
  return (
    <Link href={coinHref(coin)} className="card group block p-2 transition-colors hover:border-fg-35">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-tint">
        <img src={coin.image} alt="" loading="lazy" style={{ imageRendering: "pixelated" }} className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        {coin.graduated && <span className="badge absolute bottom-2 left-2 bg-black/55 text-money backdrop-blur">graduated</span>}
        {coin.ageDays < 2 && <span className="badge absolute right-2 top-2 bg-black/55 text-white backdrop-blur">new</span>}
      </div>
      <div className="px-1 pb-1 pt-2.5">
        <p className="truncate text-[13.5px] font-medium">
          {coin.name} <span className="num text-[11px] text-fg-45">{coin.ticker}</span>
        </p>
        <p className="num mt-0.5 text-[12.5px]">
          {fmtUsd(coin.mc)} <span className="text-[10.5px] text-fg-45">MC</span>{" "}
          <span className="text-fg-60">{fmtUsd(coin.vol)}</span> <span className="text-[10.5px] text-fg-45">vol</span>
        </p>
        <p className="mt-1 truncate text-[11.5px] text-fg-45">
          flows to <span className="text-fg-70">{col?.name}</span>
        </p>
      </div>
    </Link>
  );
}

/** Explore card: art on top, a small table of numbers below. */
export function CoinCard({ coin }: { coin: Coin }) {
  const col = collectionBySlug(coin.collection);
  const rows: [string, ReactNode][] = [
    ["Market cap", fmtUsd(coin.mc)],
    ["24h volume", fmtUsd(coin.vol)],
    ["Fees routed", <Eth key="f" value={coin.feesEth} />],
    ["NFTs funded", coin.nftsFunded ? fmtInt(coin.nftsFunded) : "—"],
  ];
  return (
    <Link href={coinHref(coin)} className="card group block overflow-hidden transition-colors hover:border-fg-35">
      <div className="relative aspect-[16/10] overflow-hidden bg-tint">
        <img src={coin.image} alt="" loading="lazy" style={{ imageRendering: "pixelated" }} className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/55 py-0.5 pl-0.5 pr-2 text-[11px] text-white backdrop-blur">
          {col && <Avatar src={col.image} size={18} rounded="rounded-full" />}
          {col?.name}
        </span>
        {coin.graduated && <span className="badge absolute right-2 top-2 bg-black/55 text-money backdrop-blur">graduated</span>}
      </div>
      <div className="p-3.5">
        <p className="flex items-baseline gap-2">
          <span className="text-[14px] font-semibold">{coin.ticker}</span>
          <span className="truncate text-[12px] text-fg-45">{coin.name}</span>
        </p>
        <dl className="mt-2.5 space-y-1.5 text-[12.5px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-2">
              <dt className="text-fg-45">{k}</dt>
              <dd className="num">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Link>
  );
}

/** Explore › collections card: 2x2 numbers, saving progress, paired coins. */
export function CollectionCard({ c }: { c: Collection }) {
  const coins = c.coinTickers.map((t) => coinByTicker(t)).filter(Boolean) as Coin[];
  const saved = pct(c.budgetEth, c.floor);
  return (
    <Link href={collectionHref(c)} className="card block p-4 transition-colors hover:border-fg-35">
      <div className="flex items-center gap-3">
        <Avatar src={c.image} size={40} rounded="rounded-xl" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium">{c.name}</p>
          <p className="num truncate text-[11.5px] text-fg-45">{c.slug}</p>
        </div>
      </div>
      <div className="mt-3">
        <LaneChip lane={c.lane} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          ["Floor", `${fmtEth(c.floor, c.floor < 0.1 ? 4 : 3)} ETH`],
          ["Coins", fmtInt(coins.length)],
          ["Swept", fmtInt(c.swept)],
          ["Fees", fmtEth(c.feesEth)],
        ].map(([k, v]) => (
          <div key={k} className="card-flat px-3 py-2">
            <p className="text-[11px] text-fg-45">{k}</p>
            <p className="num mt-0.5 text-[14px]">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <div className="num mb-1.5 flex items-center justify-between text-[11px] text-fg-45">
          <span>
            {fmtEth(c.budgetEth)} of {fmtEth(c.floor)} saved
          </span>
          <span className={saved >= 100 ? "text-money" : ""}>{Math.round(saved)}%</span>
        </div>
        <Bar value={saved} tone={saved >= 100 ? "money" : undefined} />
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-line-2 pt-3">
        <div className="flex -space-x-1.5">
          {coins.slice(0, 3).map((x) => (
            <Avatar key={x.ticker} src={x.image} size={20} rounded="rounded-full" />
          ))}
        </div>
        <p className="num truncate text-[11px] text-fg-45">{coins.map((x) => x.ticker).join(", ") || "no coins yet"}</p>
      </div>
    </Link>
  );
}

const STATUS: Record<Nft["status"], { label: string; cls: string }> = {
  vault: { label: "in the vault", cls: "bg-black/55 text-white" },
  given: { label: "given away", cls: "bg-black/55 text-money" },
  onway: { label: "on its way", cls: "bg-black/55 text-warn" },
  burned: { label: "burned", cls: "bg-black/55 text-pulse" },
};

export function NftCard({ nft }: { nft: Nft }) {
  const col = collectionBySlug(nft.collection);
  const coin = coinByTicker(nft.coin);
  const s = STATUS[nft.status];
  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-square bg-tint">
        <img src={nft.image} alt={`${col?.name} #${nft.tokenId}`} loading="lazy" style={{ imageRendering: "pixelated" }} className="size-full object-cover" />
        <span className="badge absolute left-2 top-2 bg-black/55 text-white/80">{agoLabel(nft.hoursAgo)}</span>
        <span className={`badge absolute bottom-2 right-2 backdrop-blur ${s.cls}`}>{s.label}</span>
      </div>
      <div className="p-2.5 text-[12px]">
        <div className="num flex items-center justify-between">
          <span>#{nft.tokenId}</span>
          <span>{fmtEth(nft.priceEth, 3)} ETH</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-fg-45">
          <span className="truncate">{col?.name}</span>
          <UsdOf eth={nft.priceEth} className="num shrink-0" />
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
          {coin ? (
            <Link href={coinHref(coin)} className="link truncate">
              paid by {coin.ticker} →
            </Link>
          ) : (
            <span className="text-fg-45">shared fees</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Coins sorted the way the home grid shows them by default. */
export const topCoins = () => [...COINS].sort((a, b) => b.mc - a.mc);
