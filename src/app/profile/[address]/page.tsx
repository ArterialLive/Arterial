import type { Metadata } from "next";
import Link from "next/link";
import { CopyText } from "@/components/CopyText";
import { ProfileLive } from "@/components/profile/ProfileLive";
import { Avatar } from "@/components/cards/cards";
import { CardHead, Ext } from "@/components/ui";
import { explorerAddress, isAddress, shortAddress } from "@/config/brand";
import { COINS, NFTS, coinHref, collectionBySlug } from "@/content/seed";

export async function generateMetadata({ params }: { params: Promise<{ address: string }> }): Promise<Metadata> {
  const { address } = await params;
  return { title: isAddress(address) ? `Profile ${shortAddress(address)}` : "Profile" };
}

export default async function AddressProfile({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  if (!isAddress(address)) {
    return (
      <div className="wrap pt-14">
        <h1 className="h-page">Not an address</h1>
        <p className="mt-2 text-[14px] text-fg-60">A profile needs a 0x address with 40 hex characters.</p>
        <Link href="/profile" className="btn mt-6">
          Look up another wallet
        </Link>
      </div>
    );
  }
  const lower = address.toLowerCase();
  const won = NFTS.filter((n) => n.winner?.toLowerCase() === lower);
  const launched = COINS.filter((c) => c.creator.toLowerCase() === lower);

  return (
    <div className="wrap pt-8">
      <Link href="/profile" className="link text-[13px]">
        ← Profile
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 pb-6">
        <div>
          <h1 className="num text-[26px] sm:text-[32px]">{shortAddress(address, 8, 6)}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[12.5px]">
            <CopyText value={address} label="copy address" />
            <Ext href={explorerAddress(address)}>explorer</Ext>
          </div>
        </div>
      </div>
      <ProfileLive address={address} />
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <section className="card">
          <CardHead title="Coins held" right="0" />
          <p className="px-4 py-8 text-center text-[13px] text-fg-45">No launched coins yet. The catalogue on this site is a sample and exists on no chain.</p>
        </section>
        <section className="card">
          <CardHead title="NFTs won" right={String(won.length)} />
          {won.length ? (
            <ul className="divide-y divide-line-2">
              {won.map((n) => (
                <li key={n.key} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                  <img src={n.image} alt="" style={{ imageRendering: "pixelated" }} className="size-9 rounded-md" />
                  {collectionBySlug(n.collection)?.name} #{n.tokenId}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-[13px] text-fg-45">Nothing won yet.</p>
          )}
        </section>
        <section className="card">
          <CardHead title="Coins launched" right={String(launched.length)} />
          {launched.length ? (
            <ul className="divide-y divide-line-2">
              {launched.map((c) => (
                <li key={c.ticker}>
                  <Link href={coinHref(c)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] hover:bg-tint">
                    <Avatar src={c.image} size={26} rounded="rounded-full" />
                    {c.name} <span className="num text-fg-45">{c.ticker}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-[13px] text-fg-45">No coins launched from this address.</p>
          )}
        </section>
      </div>
    </div>
  );
}
