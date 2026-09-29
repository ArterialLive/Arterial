import type { Metadata } from "next";
import { PageHead, SampleTag } from "@/components/ui";
import { CollectionExplorer } from "@/components/explore/CollectionExplorer";

export const metadata: Metadata = { title: "Collections" };

export default function CollectionsPage() {
  return (
    <div className="wrap">
      <PageHead title="Collections" sub="Every NFT collection a coin can be paired with, the vault that buys it, and how close that vault is to its next floor." />
      <div className="mb-5 flex items-center gap-2 text-[12px] text-fg-45">
        <SampleTag /> Illustrative listings until the collection registry is deployed.
      </div>
      <CollectionExplorer />
    </div>
  );
}
