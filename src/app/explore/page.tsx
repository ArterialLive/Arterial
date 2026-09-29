import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, SampleTag, TabLinks } from "@/components/ui";
import { Trending } from "@/components/explore/Trending";
import { CoinExplorer } from "@/components/explore/CoinExplorer";
import { CollectionExplorer } from "@/components/explore/CollectionExplorer";
import { BRAND, CHAIN } from "@/config/brand";

export const metadata: Metadata = { title: "Explore" };

type Venue = "coins" | "collections" | "solana";

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ venue?: string; sort?: string }> }) {
  const params = await searchParams;
  const venue: Venue = params.venue === "collections" ? "collections" : params.venue === "solana" ? "solana" : "coins";
  const sort = params.sort === "vol" || params.sort === "mc" || params.sort === "fees" || params.sort === "newest" ? params.sort : "vol";
  return (
    <div className="wrap">
      <PageHead
        title="Explore"
        sub={`Every coin launched through ${BRAND.name}, the collection its fees flow to, and what those fees have bought so far.`}
      />
      <TabLinks
        active={venue}
        tabs={[
          { key: "solana", label: "Solana", sub: "later", href: "/explore?venue=solana" },
          { key: "coins", label: "Coins", sub: CHAIN.name, href: "/explore" },
          { key: "collections", label: "Collections", sub: "& vaults", href: "/explore?venue=collections" },
        ]}
      />
      <div className="mt-3 flex items-center gap-2 text-[12px] text-fg-45">
        <SampleTag /> Illustrative catalogue until the {BRAND.name} launcher is deployed.
      </div>

      {venue === "coins" && (
        <>
          <div className="mt-7">
            <Trending />
          </div>
          <div className="mt-9">
            <CoinExplorer initialSort={sort} />
          </div>
        </>
      )}

      {venue === "collections" && (
        <div className="mt-7">
          <CollectionExplorer />
        </div>
      )}

      {venue === "solana" && (
        <div className="card mt-7 px-6 py-12 text-center">
          <p className="text-[17px] font-medium">A Solana lane is on the list, not on the chain.</p>
          <p className="mx-auto mt-2 max-w-[460px] text-[14px] leading-relaxed text-fg-60">
            {BRAND.name} starts on {CHAIN.name} only. A second lane for Solana launchpads would need its own vault program, so it
            waits until the first one has earned trust. Nothing to browse here yet.
          </p>
          <Link href="/explore" className="btn mt-6">
            Back to {CHAIN.name} coins
          </Link>
        </div>
      )}
    </div>
  );
}
