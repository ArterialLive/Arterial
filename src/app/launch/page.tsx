import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { LaunchWizard } from "@/components/launch/LaunchWizard";

export const metadata: Metadata = { title: "Launch a coin" };

export default async function LaunchPage({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  const { collection } = await searchParams;
  return (
    <div className="wrap">
      <PageHead title="Launch a coin" sub="Four steps, one transaction. Your coin's fees buy one NFT collection at floor, and you decide where those NFTs go." />
      <LaunchWizard initialCollection={collection ?? null} />
    </div>
  );
}
