import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { UsdOf } from "@/components/LiveChain";
import { PageHead, SampleTag } from "@/components/ui";
import { COLLECTIONS, totals } from "@/content/seed";
import { fmtEth, fmtInt } from "@/lib/format";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  const t = totals();
  return (
    <div className="wrap">
      <PageHead title="Gallery" sub="Every NFT bought with memecoin fees: what it cost, which coin paid for it, and where it ended up." />
      <div className="mb-5 flex items-center gap-2 text-[12px] text-fg-45">
        <SampleTag /> Sample purchases until the vaults are deployed.
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-4">
          <p className="kicker">NFTs bought</p>
          <p className="num mt-2 text-[24px]">{fmtInt(t.nfts)}</p>
        </div>
        <div className="card p-4">
          <p className="kicker">Spent</p>
          <p className="num mt-2 flex flex-wrap items-baseline gap-x-3 text-[22px]">
            {fmtEth(t.spentEth, 2)} ETH <UsdOf eth={t.spentEth} className="text-[15px] text-money" />
          </p>
        </div>
        <div className="card p-4">
          <p className="kicker">Given away</p>
          <p className="num mt-2 text-[24px]">{fmtInt(t.given)}</p>
          <p className="mt-1 text-[11.5px] text-fg-45">{t.inVault} still in vaults</p>
        </div>
        <div className="card p-4">
          <p className="kicker">Collections</p>
          <p className="num mt-2 text-[24px]">{COLLECTIONS.filter((c) => c.swept).length}</p>
          <p className="mt-1 text-[11.5px] text-fg-45">with at least one buy</p>
        </div>
      </div>
      <div className="mt-6">
        <GalleryGrid />
      </div>
    </div>
  );
}
