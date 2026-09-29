import type { Metadata } from "next";
import { ClaimsBoard } from "@/components/claims/ClaimsBoard";
import { PageHead } from "@/components/ui";

export const metadata: Metadata = { title: "Claims" };

export default function ClaimsPage() {
  return (
    <div className="wrap">
      <PageHead title="Claims" sub="Every NFT you have won, and anything left to do to receive it. Most prizes need nothing from you at all." />
      <ClaimsBoard />
    </div>
  );
}
