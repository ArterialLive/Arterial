import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="29 September 2026">
      <p>{BRAND.name} collects as little as it can.</p>
      <h2>No accounts</h2>
      <p>There is no sign-up, email or password. Connecting a wallet shares only its public address with this page.</p>
      <h2>Stored in your browser</h2>
      <p>Your theme choice and the last connected wallet are kept in your browser&apos;s local storage so the site remembers them. Clearing site data removes them.</p>
      <h2>Chain reads</h2>
      <p>To read balances and blocks, the site relays read-only requests to a Robinhood Chain RPC endpoint. Addresses you look up are part of those requests and are public chain data anyway.</p>
      <h2>No trackers</h2>
      <p>The site runs no advertising or analytics trackers.</p>
      <h2>Contact</h2>
      <p>Write to {BRAND.email}.</p>
    </LegalPage>
  );
}
