import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, PolicyBadge } from "@/components/cards/cards";
import { PriceChart } from "@/components/coin/PriceChart";
import { OddsChecker } from "@/components/coin/OddsChecker";
import { UsdOf } from "@/components/LiveChain";
import { Bar, CardHead, Eth, SampleTag } from "@/components/ui";
import { CopyText } from "@/components/CopyText";
import { BRAND, shortAddress } from "@/config/brand";
import { COINS, NFTS, agoLabel, coinByAddress, collectionBySlug, collectionHref, priceSeries } from "@/content/seed";
import { fmtEth, fmtInt, pct } from "@/lib/format";

export function generateStaticParams() {
  return COINS.map((c) => ({ address: c.address }));
}

export async function generateMetadata({ params }: { params: Promise<{ address: string }> }): Promise<Metadata> {
  const coin = coinByAddress((await params).address);
  return { title: coin ? `${coin.name} (${coin.ticker})` : "Coin" };
}

export default async function CoinPage({ params }: { params: Promise<{ address: string }> }) {
  const coin = coinByAddress((await params).address);
  if (!coin) notFound();
  const col = collectionBySlug(coin.collection)!;
  const nfts = NFTS.filter((n) => n.coin === coin.ticker);
  const winners = nfts.filter((n) => n.winner);
  const spent = nfts.reduce((s, n) => s + n.priceEth, 0);
  const vaultShare = coin.feesEth * 0.8;
  const leftToSpend = Math.max(0, vaultShare - spent);
  const siblings = COINS.filter((c) => c.collection === coin.collection);
  const siblingFees = siblings.reduce((s, c) => s + c.feesEth, 0) || 1;
  const holdersShare = (coin.feesEth / siblingFees) * 100;
  const saved = pct(col.budgetEth, col.floor);
  const eligible = Math.round(coin.mc * 7400);

  // Fee harvests are not stored per event in the sample; show a steady cadence.
  const harvests = Array.from({ length: 4 }, (_, i) => ({ hours: 1 + i * 6, eth: (coin.feesEth / (coin.ageDays * 4 + 4)) * (1 - i * 0.12) }));
  const activity = [
    ...harvests.map((h) => ({ at: h.hours, title: "Fees harvested", body: `${fmtEth(h.eth)} ETH claimed · ${fmtEth(h.eth * 0.8)} to the vault` })),
    ...nfts.slice(0, 8).flatMap((n) => [
      { at: n.hoursAgo, title: "Bought with this coin's fees", body: `#${n.tokenId} for ${fmtEth(n.priceEth)} ETH` },
      ...(n.winner ? [{ at: Math.max(0, n.hoursAgo - 1), title: "Won by a holder", body: `#${n.tokenId} to ${shortAddress(n.winner)}` }] : []),
      ...(n.status === "burned" ? [{ at: Math.max(0, n.hoursAgo - 1), title: "Burned", body: `#${n.tokenId} sent to the dead address` }] : []),
    ]),
  ].sort((a, b) => a.at - b.at);

  return (
    <div className="wrap-wide pt-8">
      <Link href="/explore" className="link text-[13px]">
        ← Explore
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-4">
          <Avatar src={coin.image} size={60} rounded="rounded-2xl" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[30px] font-medium leading-tight tracking-[-0.01em] sm:text-[38px]">{coin.name}</h1>
              <span className="num text-[15px] text-fg-45">{coin.ticker}</span>
              <Link href={collectionHref(col)} className="chip">
                flows to {col.name}
              </Link>
              <PolicyBadge policy={coin.policy} />
              <SampleTag />
            </div>
            <div className="num mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-fg-60">
              <span>{coin.graduated ? "graduated to a locked pool" : "on the bonding curve"}</span>
              <span>creator tax {(coin.taxBps / 100).toFixed(2)}%</span>
              <span className="flex items-center gap-1">
                token <CopyText value={coin.address} label={shortAddress(coin.address)} />
              </span>
            </div>
          </div>
        </div>
        <div className="text-right max-sm:text-left">
          <p className="text-[12px] text-fg-60">
            claimable in escrow <Eth value={coin.feesEth * 0.004} className="text-ink" />
          </p>
          <button type="button" disabled className="btn btn-solid btn-lg mt-2" title="Harvesting opens when the contracts are live">
            Harvest opens at launch
          </button>
          <p className="mt-2 max-w-[260px] text-[11.5px] leading-relaxed text-fg-45 max-sm:max-w-none">
            Anyone will be able to push escrowed fees to the vault. A keeper also does it on a loop.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_300px]">
        <section className="card order-3 self-start lg:order-1">
          <CardHead title="Winners" right={<span className="text-money">● live feed</span>} sub="Every prize this coin's fees bought that went to a holder." />
          <ul className="space-y-2 p-3">
            {winners.slice(0, 6).map((n) => (
              <li key={n.key} className="card-flat flex gap-3 p-2">
                <img src={n.image} alt="" loading="lazy" style={{ imageRendering: "pixelated" }} className="size-[68px] shrink-0 rounded-lg" />
                <div className="min-w-0 text-[11.5px]">
                  <p className="flex items-center justify-between gap-2 text-[13px]">
                    #{n.tokenId} <span className="text-[11px] text-fg-45">{agoLabel(n.hoursAgo)}</span>
                  </p>
                  <p className="text-fg-45">{col.name}</p>
                  <p className="num">
                    {fmtEth(n.priceEth)} ETH <UsdOf eth={n.priceEth} className="text-money" />
                  </p>
                  <p className="num truncate text-fg-60">won by {shortAddress(n.winner!, 6, 4)}</p>
                  <p className={n.status === "onway" ? "text-warn" : "text-money"}>{n.status === "onway" ? "On its way" : "Delivered"}</p>
                </div>
              </li>
            ))}
            {winners.length === 0 && (
              <li className="px-2 py-6 text-center text-[12.5px] text-fg-45">
                {coin.policy === "burn" ? "This coin burns what it buys, so there are no winners." : "No draws yet. The first one opens when the vault buys."}
              </li>
            )}
          </ul>
        </section>

        <div className="order-1 space-y-4 lg:order-2">
          <section className="card">
            <CardHead title="Price" right="sample path" />
            <div className="p-4">
              <PriceChart series={priceSeries(coin)} />
            </div>
          </section>
          <section className="card">
            <CardHead title="NFT policy" />
            <div className="p-4 text-[13.5px]">
              <div className="flex flex-wrap items-center gap-2">
                <PolicyBadge policy={coin.policy} />
                <span className="font-medium">{coin.policy === "airdrop" ? "Airdrop to holders" : "Burn every NFT"}</span>
                <span className="chip">locked at launch</span>
              </div>
              <p className="mt-3 leading-relaxed text-fg-70">
                {coin.policy === "airdrop"
                  ? "Each NFT goes to one holder, drawn at random with odds that grow with the size of their bag."
                  : "Each NFT is sent to a dead address, so the collection's supply shrinks with every buy."}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-fg-45">
                Picked by the creator at launch and fixed for good. It covers every NFT the {col.name} vault buys with this
                coin&apos;s trading fees; the vault is shared, so each purchase is charged to the coin whose fees paid for it.
              </p>
            </div>
          </section>
          <section className="card">
            <CardHead title="Activity" right={`${activity.length} events`} />
            <ul className="divide-y divide-line-2">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start justify-between gap-3 px-4 py-2.5 text-[13px]">
                  <div className="min-w-0">
                    <p>{a.title}</p>
                    <p className="num truncate text-[11.5px] text-fg-45">{a.body}</p>
                  </div>
                  <span className="num shrink-0 text-[11px] text-fg-45">{agoLabel(a.at)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="order-2 space-y-4 lg:order-3">
          <section className="card">
            <CardHead title="Next sweep" right={col.name} />
            <div className="p-4">
              <div className="flex items-baseline justify-between">
                <span className="num text-[28px]">{Math.round(saved)}%</span>
                <span className="num text-[12px] text-fg-60">
                  {fmtEth(Math.max(0, col.floor - col.budgetEth))} ETH to go
                </span>
              </div>
              <div className="mt-2">
                <Bar value={saved} tone={saved >= 100 ? "money" : "pulse"} />
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-fg-60">
                <span className="num">{fmtEth(col.budgetEth)}</span> ETH saved of about <span className="num">{fmtEth(col.floor)}</span> ETH,
                the most the vault may pay per NFT right now. Every coin paired with {col.name} fills the same vault.
              </p>
            </div>
          </section>
          <section className="card">
            <CardHead title="Your odds" />
            <div className="p-4">
              <OddsChecker ticker={coin.ticker} eligible={eligible} holdersShare={holdersShare} />
            </div>
          </section>
          <section className="card">
            <CardHead title="What its fees bought" />
            <dl className="divide-y divide-line-2 text-[13px]">
              {[
                ["NFTs charged to this coin", fmtInt(nfts.length), "Floor NFTs paid for from this coin's share of the vault."],
                ["Spent so far", `${fmtEth(spent)} ETH`, "What this coin's fees have paid for NFTs to date."],
                ["Left to spend", `${fmtEth(leftToSpend)} ETH`, "This coin's fees in the vault that have not bought anything yet."],
                ["Given away to holders", fmtInt(winners.length), "Drawn and sent to a holder."],
                ["Waiting in the vault", fmtInt(nfts.filter((n) => n.status === "vault").length), "Bought, not yet drawn."],
                ["Holders' share of each draw", `${holdersShare.toFixed(1)}%`, "This coin's cut of the fees in the shared vault."],
              ].map(([k, v, hint]) => (
                <div key={k} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <dt>{k}</dt>
                    <dd className="num">{v}</dd>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-fg-45">{hint}</p>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
      <p className="mt-6 text-[12px] text-fg-45">
        This coin is part of the sample catalogue shown before the {BRAND.name} launcher is deployed. Its address exists on no chain.
      </p>
    </div>
  );
}
