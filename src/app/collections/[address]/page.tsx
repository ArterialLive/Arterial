import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, LaneChip } from "@/components/cards/cards";
import { CopyText } from "@/components/CopyText";
import { UsdOf } from "@/components/LiveChain";
import { CardHead, SampleTag } from "@/components/ui";
import { shortAddress } from "@/config/brand";
import { COINS, COLLECTIONS, NFTS, agoLabel, coinByTicker, coinHref, collectionByAddress } from "@/content/seed";
import { fmtEth, fmtInt } from "@/lib/format";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ address: c.address }));
}

export async function generateMetadata({ params }: { params: Promise<{ address: string }> }): Promise<Metadata> {
  const c = collectionByAddress((await params).address);
  return { title: c ? c.name : "Collection" };
}

const STATUS = { vault: "in the vault", given: "given away", onway: "on its way", burned: "burned" } as const;

export default async function CollectionPage({ params }: { params: Promise<{ address: string }> }) {
  const c = collectionByAddress((await params).address);
  if (!c) notFound();
  const coins = COINS.filter((x) => x.collection === c.slug);
  const fed = coins.reduce((s, x) => s + x.feesEth * 0.8, 0) || 1;
  const sweeps = NFTS.filter((n) => n.collection === c.slug);
  const held = sweeps.filter((n) => n.status === "vault");
  const canSweep = c.budgetEth / c.floor;

  const rows: [string, string | null, React.ReactNode][] = [
    ["Budget", "ETH the vault holds", `${fmtEth(c.budgetEth)} ETH`],
    ["Floor cap", "most it may pay per NFT", <span key="f" className="flex items-center justify-end gap-2">{fmtEth(c.floor)} ETH <span className="badge border border-money/40 text-money">posted</span></span>],
    ["Cap updated", null, `${c.capAgeMin}m ago`],
    ["Can sweep now", "budget ÷ floor cap", `${canSweep.toFixed(2)}×`],
    ["Total swept", null, `${fmtInt(c.swept)} NFTs`],
    ["Total spent", null, `${fmtEth(c.spentEth)} ETH`],
    ["Fees received", "from coin routers", `${fmtEth(c.feesEth)} ETH`],
    ["Donations", null, `${fmtEth(c.donationsEth)} ETH`],
  ];

  return (
    <div className="wrap pt-8">
      <Link href="/explore?venue=collections" className="link text-[13px]">
        ← Collections
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar src={c.image} size={56} rounded="rounded-2xl" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[30px] font-medium leading-tight tracking-[-0.01em] sm:text-[36px]">{c.name}</h1>
              <LaneChip lane={c.lane} />
              <SampleTag />
            </div>
            <div className="num mt-1 flex flex-wrap items-center gap-x-4 text-[12.5px] text-fg-60">
              <span>{c.slug}</span>
              <span>supply {fmtInt(c.supply)}</span>
              <span className="flex items-center gap-1">
                nft <CopyText value={c.address} label={shortAddress(c.address)} />
              </span>
            </div>
          </div>
        </div>
        <Link href={`/launch?collection=${c.slug}`} className="btn btn-solid btn-lg">
          Launch a coin for it
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="card self-start">
          <CardHead title="Vault" right={<CopyText value={c.vault} label={shortAddress(c.vault)} />} />
          <dl className="divide-y divide-line-2 text-[13px]">
            {rows.map(([k, hint, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <dt>
                  {k}
                  {hint && <span className="block text-[11px] text-fg-45">{hint}</span>}
                </dt>
                <dd className="num text-right">{v}</dd>
              </div>
            ))}
            <div className="px-4 py-3">
              <dt>Held</dt>
              {held.length ? (
                <dd className="mt-2 flex flex-wrap gap-2">
                  {held.map((n) => (
                    <img key={n.key} src={n.image} alt={`#${n.tokenId}`} style={{ imageRendering: "pixelated" }} className="size-12 rounded-lg" />
                  ))}
                </dd>
              ) : (
                <dd className="mt-1 text-[12px] text-fg-45">Nothing held. The next sweep lands here.</dd>
              )}
            </div>
          </dl>
        </section>

        <div className="space-y-4">
          <section className="card p-4">
            <div className="flex flex-wrap items-center gap-2 text-[13.5px]">
              <LaneChip lane={c.lane} />
              <span className="font-medium">{c.lane === "robinhood" ? "Bought by the vault itself" : "Bought by the keeper, off-chain"}</span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-fg-60">
              {c.lane === "robinhood"
                ? "The vault contract buys this collection itself through an allow-listed marketplace. Nothing but an NFT purchase under the floor cap can move its ETH; there is no withdraw function."
                : "This collection lives on Ethereum, which the vault cannot call. Fees still arrive on Robinhood Chain with per-coin records, and each off-chain purchase and delivery is logged with its receipt."}
            </p>
          </section>
          <section className="card">
            <CardHead title="Paired coins" right={`${coins.length} coins`} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px] text-[13px]">
                <thead>
                  <tr className="kicker text-left">
                    <th className="px-4 py-2 font-normal">Coin</th>
                    <th className="px-4 py-2 text-right font-normal">Fed to vault</th>
                    <th className="px-4 py-2 text-right font-normal">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-2">
                  {coins.map((x) => (
                    <tr key={x.ticker}>
                      <td className="px-4 py-2.5">
                        <Link href={coinHref(x)} className="flex items-center gap-2 hover:text-pulse">
                          <Avatar src={x.image} size={22} rounded="rounded-full" />
                          <span className="font-medium">{x.ticker}</span>
                        </Link>
                      </td>
                      <td className="num px-4 py-2.5 text-right">{fmtEth(x.feesEth * 0.8)} ETH</td>
                      <td className="num px-4 py-2.5 text-right">{(((x.feesEth * 0.8) / fed) * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-line-2 px-4 py-3 text-[11.5px] text-fg-45">
              Share weights draw tickets: holders of a coin that fed more of the vault hold more of each raffle.
            </p>
          </section>
        </div>
      </div>

      <section className="card mt-4">
        <CardHead title="Sweep history" right={`${sweeps.length} sweeps`} />
        <ul className="divide-y divide-line-2">
          {sweeps.slice(0, 20).map((n) => {
            const coin = coinByTicker(n.coin);
            return (
              <li key={n.key} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                <img src={n.image} alt="" loading="lazy" style={{ imageRendering: "pixelated" }} className="size-9 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className="num">
                    #{n.tokenId} · {fmtEth(n.priceEth)} ETH <UsdOf eth={n.priceEth} className="text-[11.5px] text-fg-45" />
                  </p>
                  <p className="truncate text-[11.5px] text-fg-45">
                    paid by {coin ? <Link href={coinHref(coin)} className="link">{coin.ticker}</Link> : "shared fees"} · {STATUS[n.status]}
                  </p>
                </div>
                <span className="num shrink-0 text-[11px] text-fg-45">{agoLabel(n.hoursAgo)}</span>
              </li>
            );
          })}
          {sweeps.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-fg-45">No sweeps yet. The vault buys once it can afford a floor.</li>}
        </ul>
      </section>
    </div>
  );
}
