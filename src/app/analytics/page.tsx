import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/cards/cards";
import { BurnReader } from "@/components/analytics/BurnReader";
import { Money, PriceNote } from "@/components/analytics/Money";
import { SweepChart } from "@/components/analytics/SweepChart";
import { UsdOf } from "@/components/LiveChain";
import { Bar, CardHead, Eth, PageHead, SampleTag, Stat, TabLinks } from "@/components/ui";
import { BRAND, CHAIN, TOKEN } from "@/config/brand";
import { COLLECTIONS, NFTS, agoLabel, coinByTicker, coinHref, collectionBySlug, collectionHref, sweepSeries, totals } from "@/content/seed";
import { fmtEth, fmtInt, pct } from "@/lib/format";

export const metadata: Metadata = { title: "Analytics" };

type View = "chain" | "overall" | "buybacks" | "payments";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: raw } = await searchParams;
  const view: View = raw === "chain" || raw === "buybacks" || raw === "payments" ? raw : "overall";
  const t = totals();
  return (
    <div className="wrap">
      <PageHead title="Analytics" sub="Platform-wide numbers, meant to be read straight from the contracts. Until they are deployed, the figures below are a labelled sample." />
      <TabLinks
        active={view}
        tabs={[
          { key: "chain", label: "Robinhood", sub: "Chain", href: "/analytics?view=chain" },
          { key: "overall", label: "Overall", sub: "all vaults", href: "/analytics" },
          { key: "buybacks", label: "Buybacks", sub: "& burns", href: "/analytics?view=buybacks" },
          { key: "payments", label: "Payments", sub: "receipts", href: "/analytics?view=payments" },
        ]}
      />
      <div className="mt-3 flex items-center gap-2 text-[12px] text-fg-45">
        {view === "buybacks" ? (
          <>Read from {CHAIN.name} once {BRAND.symbol} is live.</>
        ) : (
          <>
            <SampleTag /> Sample protocol data; dollar values use the live ETH price.
          </>
        )}
      </div>

      <div className="mt-6">
        {view === "overall" && <Overall t={t} />}
        {view === "chain" && <Chain t={t} />}
        {view === "buybacks" && <Buybacks />}
        {view === "payments" && <Payments t={t} />}
      </div>
    </div>
  );
}

type T = ReturnType<typeof totals>;

function Overall({ t }: { t: T }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Coins launched" value={fmtInt(t.coins)} sub={`on ${CHAIN.name}`} />
        <Stat label="Graduated" value={fmtInt(t.graduated)} sub={`of ${t.coins} launched`} />
        <Stat label="NFTs bought" value={fmtInt(t.nfts)} sub="by vaults, with fees" />
        <Stat label="Collections" value={fmtInt(t.collections)} sub="paired with a vault" />
      </div>
      <section className="card">
        <CardHead
          title="Protocol revenue"
          sub="Every creator fee the platform has earned, split the way the router splits it: 80% into the vault that buys NFTs for that coin's holders, 20% to the treasury. The vault's share has no way out except an NFT purchase."
        />
        <div className="grid grid-cols-1 divide-line-2 max-md:divide-y md:grid-cols-3 md:divide-x">
          <div className="p-4 sm:p-5">
            <p className="text-[12.5px] text-fg-60">
              To vaults <span className="num text-fg-45">80%</span>
            </p>
            <div className="mt-2">
              <Money eth={t.toVaultsEth} tone="money" />
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-[12.5px] text-fg-60">
              To treasury <span className="num text-fg-45">20%</span>
            </p>
            <div className="mt-2">
              <Money eth={t.toTreasuryEth} />
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-[12.5px] text-fg-60">Total earned</p>
            <div className="mt-2">
              <Money eth={t.feesEth} />
            </div>
          </div>
        </div>
        <p className="border-t border-line-2 px-4 py-3 text-[11.5px] text-fg-45 sm:px-5">
          <PriceNote />
        </p>
      </section>
      <section className="card">
        <CardHead
          title="Spent on NFTs"
          right={`${fmtInt(t.nfts)} bought · ${fmtInt(t.given)} given away`}
          sub="A vault buys when it can afford a floor, not merely when it has money. Most of what reaches a vault waits there until the next floor is covered, and it cannot go anywhere else."
        />
        <div className="grid grid-cols-1 divide-line-2 max-md:divide-y md:grid-cols-3 md:divide-x">
          <div className="p-4 sm:p-5">
            <p className="text-[12.5px] text-fg-60">Spent buying so far</p>
            <div className="mt-2">
              <Money eth={t.spentEth} />
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-[12.5px] text-fg-60">Waiting in vaults</p>
            <div className="mt-2">
              <Money eth={t.waitingEth} tone="money" />
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-[12.5px] text-fg-60">Bought so far</p>
            <p className="num mt-2 text-[26px] leading-tight">{fmtInt(t.nfts)} NFTs</p>
            <p className="mt-1 text-[11.5px] text-fg-45">
              {fmtInt(t.burned)} burned · {fmtInt(t.inVault)} waiting for a draw
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Chain({ t }: { t: T }) {
  const discount = NFTS.reduce((s, n) => s + (1 - n.priceEth / (collectionBySlug(n.collection)?.floor ?? n.priceEth)), 0) / Math.max(1, NFTS.length);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="ETH swept" value={<Eth value={t.spentEth} />} />
        <Stat label="NFTs swept" value={fmtInt(t.nfts)} />
        <Stat label="Fees to vaults" value={<Eth value={t.toVaultsEth} />} sub="80% share" />
        <Stat label="Protocol fees" value={<Eth value={t.toTreasuryEth} />} sub="20% share" />
        <Stat label="Coins launched" value={fmtInt(t.coins)} />
        <Stat label="Collections" value={fmtInt(t.collections)} />
        <Stat label="Draws settled" value={fmtInt(t.given)} />
        <Stat label="Avg discount vs cap" value={`${(discount * 100).toFixed(1)}%`} sub="floor cap minus price paid" />
      </div>
      <section className="card p-4 sm:p-5">
        <p className="mb-3 text-[15px] font-medium">Cumulative ETH swept</p>
        <SweepChart series={sweepSeries()} />
      </section>
      <section className="card">
        <CardHead title="By collection" right={`${COLLECTIONS.length} listed`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[12.5px]">
            <thead>
              <tr className="kicker text-left">
                {["Collection", "Floor", "Fees", "Budget", "Swept", "Spent", "Coins"].map((h, i) => (
                  <th key={h} className={`px-4 py-2 font-normal ${i ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="num divide-y divide-line-2">
              {[...COLLECTIONS]
                .sort((a, b) => b.feesEth - a.feesEth)
                .map((c) => (
                  <tr key={c.slug}>
                    <td className="px-4 py-2.5">
                      <Link href={collectionHref(c)} className="flex items-center gap-2 font-sans hover:text-pulse">
                        <Avatar src={c.image} size={22} rounded="rounded-full" />
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right">{fmtEth(c.floor, 3)}</td>
                    <td className="px-4 py-2.5 text-right">{fmtEth(c.feesEth)}</td>
                    <td className="px-4 py-2.5 text-right">{fmtEth(c.budgetEth)}</td>
                    <td className="px-4 py-2.5 text-right">{fmtInt(c.swept)}</td>
                    <td className="px-4 py-2.5 text-right">{fmtEth(c.spentEth)}</td>
                    <td className="px-4 py-2.5 text-right">{c.coinTickers.length}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Buybacks() {
  return (
    <div className="space-y-4">
      <BurnReader />
      <section className="card">
        <CardHead title="How this works" right={TOKEN.isLive ? "live" : "at launch"} />
        <div className="space-y-3 p-4 text-[13.5px] leading-relaxed text-fg-70 sm:p-5">
          <p>
            Part of the treasury&apos;s 20% goes back into {BRAND.symbol}. A keeper buys a fixed amount on the open market every few
            hours, the same way anyone would, and sends what it receives to the dead address.
          </p>
          <p>
            The loop spends from a wallet of its own, topped up in small amounts, so the most it could ever lose is what is sitting in
            that wallet. Every buy and every burn is a public transaction you can check on {CHAIN.explorerName}.
          </p>
          <p className="text-fg-45">
            Nothing has been bought or burned yet: {BRAND.symbol} {TOKEN.isLive ? "is live, and the counters above read the chain directly." : "is not launched. The counters above switch to live chain reads the moment the contract address is published."}
          </p>
        </div>
      </section>
    </div>
  );
}

function Payments({ t }: { t: T }) {
  const saving = [...COLLECTIONS].sort((a, b) => pct(b.budgetEth, b.floor) - pct(a.budgetEth, a.floor));
  const delivered = NFTS.filter((n) => n.status === "given").length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="NFTs bought" value={fmtInt(t.nfts)} />
        <Stat label="ETH spent" value={<Eth value={t.spentEth} />} />
        <Stat label="Fees routed to vaults" value={<Eth value={t.toVaultsEth} />} />
        <Stat label="NFTs delivered" value={fmtInt(delivered)} />
      </div>
      <section>
        <h2 className="text-[15px] font-medium">Saving for the next floor</h2>
        <p className="mt-1 text-[12.5px] text-fg-45">Fees already in each vault, against what one NFT costs today. A vault can only spend this on its own collection.</p>
        <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {saving.map((c) => {
            const p = pct(c.budgetEth, c.floor);
            return (
              <Link key={c.slug} href={collectionHref(c)} className="card flex items-center gap-3 p-3 transition-colors hover:border-fg-35">
                <Avatar src={c.image} size={38} rounded="rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="truncate">{c.name}</span>
                    <span className="num text-[11px] text-fg-45">{Math.round(p)}%</span>
                  </div>
                  <div className="mt-1.5">
                    <Bar value={p} tone={p >= 100 ? "money" : undefined} />
                  </div>
                  <p className="num mt-1.5 text-[11px] text-fg-45">
                    {fmtEth(c.budgetEth)} of {fmtEth(c.floor)} ETH{c.lane === "ethereum" ? " · bought off-chain" : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="card">
        <CardHead title="Receipts" right="latest 25" sub="Each purchase, the coin whose fees paid for it, and where the NFT went." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-[12.5px]">
            <thead>
              <tr className="kicker text-left">
                {["NFT", "Paid", "USD", "Coin", "Outcome", "When"].map((h, i) => (
                  <th key={h} className={`px-4 py-2 font-normal ${i && i !== 3 && i !== 4 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-2">
              {NFTS.slice(0, 25).map((n) => {
                const col = collectionBySlug(n.collection);
                const coin = coinByTicker(n.coin);
                return (
                  <tr key={n.key}>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2">
                        <img src={n.image} alt="" loading="lazy" style={{ imageRendering: "pixelated" }} className="size-7 rounded-md" />
                        <span className="truncate">
                          {col?.name} <span className="num text-fg-45">#{n.tokenId}</span>
                        </span>
                      </span>
                    </td>
                    <td className="num px-4 py-2 text-right">{fmtEth(n.priceEth)}</td>
                    <td className="num px-4 py-2 text-right text-fg-60">
                      <UsdOf eth={n.priceEth} />
                    </td>
                    <td className="px-4 py-2">{coin ? <Link href={coinHref(coin)} className="link">{coin.ticker}</Link> : "—"}</td>
                    <td className="px-4 py-2 text-fg-60">{{ vault: "in the vault", given: "given away", onway: "on its way", burned: "burned" }[n.status]}</td>
                    <td className="num px-4 py-2 text-right text-fg-45">{agoLabel(n.hoursAgo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
