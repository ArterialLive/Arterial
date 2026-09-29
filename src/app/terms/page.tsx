import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { BRAND, CHAIN } from "@/config/brand";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="29 September 2026">
      <p>
        {BRAND.name} ({BRAND.domain}) is an interface to smart contracts on {CHAIN.name}. By using it you accept these terms. If you
        do not, please do not use the site.
      </p>
      <h2>No advice</h2>
      <p>Nothing on this site is financial, legal or tax advice. Memecoins are volatile and can go to zero. Only use money you can afford to lose.</p>
      <h2>Sample data</h2>
      <p>Until the protocol contracts are deployed, coins, collections and numbers marked sample are illustrative and are not offers of anything.</p>
      <h2>Your wallet, your keys</h2>
      <p>The site never holds your keys or your funds. Every transaction is shown and signed in your own wallet, and you are responsible for what you approve.</p>
      <h2>Unaudited software</h2>
      <p>Contracts are provided as they are, without warranty, and are unaudited until stated otherwise. Blockchain transactions cannot be reversed.</p>
      <h2>Eligibility</h2>
      <p>You are responsible for making sure that using the site is legal where you live.</p>
      <h2>Contact</h2>
      <p>Questions reach the team at {BRAND.email} or {BRAND.xHandle} on X.</p>
    </LegalPage>
  );
}
