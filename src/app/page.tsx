import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { CopyCaPill } from "@/components/CopyCa";
import { ChainLine } from "@/components/LiveChain";
import { CoinBoard } from "@/components/home/CoinBoard";
import { Avatar, LaneChip } from "@/components/cards/cards";
import { Eth, SampleTag } from "@/components/ui";
import { COLLECTIONS, collectionHref } from "@/content/seed";
import { fmtInt } from "@/lib/format";

export default function Home() {
  const ranked = [...COLLECTIONS].sort((a, b) => b.feesEth - a.feesEth);
  const [lead, ...rest] = ranked;
  return (
    <>
      <section className="wrap pb-14 pt-14 text-center sm:pt-20">
        <h1 className="h-display mx-auto max-w-[720px]">
          Memecoin fees flowing live
          <br className="hidden sm:block" /> to NFT collections
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-relaxed text-fg-60">
          Every coin is tied to one NFT collection. 80% of its creator fees pour into a vault that can only buy that
          collection&apos;s floor, and the NFTs flow back to the people holding the coin. Launches on{" "}
          <span className="chip align-middle">
            <span className="size-1.5 rounded-full bg-pulse" />
            {CHAIN.name}
          </span>
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Link href="/launch" className="btn btn-solid btn-lg">
            Launch a coin
          </Link>
          <Link href="/docs" className="btn btn-lg">
            How it works
          </Link>
        </div>
        <div className="mt-5 flex justify-center">
          <CopyCaPill />
        </div>
        <ChainLine className="mt-5" />
      </section>

      <div className="wrap-wide">
        <div className="mb-4 flex items-center gap-2 text-[12px] text-fg-45">
          <SampleTag /> Coins and collections below are a sample catalogue until the launcher is deployed.
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          <CoinBoard />
          <aside>
            <div className="flex items-center justify-between">
              <h2 className="h-section">Top collections</h2>
              <Link href="/explore?venue=collections" className="link text-[12.5px]">
                All {COLLECTIONS.length} →
              </Link>
            </div>
            <Link href={collectionHref(lead)} className="card mt-3 block overflow-hidden transition-colors hover:border-fg-35">
              <div className="h-16 bg-gradient-to-br from-tint-2 to-transparent" style={{ backgroundColor: "var(--card-2)" }} />
              <div className="-mt-8 px-4 pb-4">
                <Avatar src={lead.image} size={56} rounded="rounded-2xl" />
                <p className="mt-2 text-[15px] font-medium">{lead.name}</p>
                <p className="num text-[11.5px] text-fg-45">{lead.slug}</p>
                <div className="mt-2">
                  <LaneChip lane={lead.lane} />
                </div>
                <p className="num mt-3 text-[12.5px]">
                  {lead.coinTickers.length} <span className="text-fg-45">coins</span>{" "}
                  <Eth value={lead.feesEth} className="ml-2" /> <span className="text-fg-45">received</span>
                </p>
                <p className="num mt-1 text-[12.5px]">
                  {fmtInt(lead.swept)} <span className="text-fg-45">NFTs swept</span>
                </p>
              </div>
            </Link>
            <ul className="mt-2 space-y-1.5">
              {rest.slice(0, 9).map((c) => (
                <li key={c.slug}>
                  <Link href={collectionHref(c)} className="card flex items-center gap-2.5 px-2.5 py-2 text-[13px] transition-colors hover:border-fg-35">
                    <Avatar src={c.image} size={24} rounded="rounded-full" />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <Eth value={c.feesEth} className="text-[11.5px] text-fg-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
      <p className="sr-only">{BRAND.description}</p>
    </>
  );
}
