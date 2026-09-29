import type { Metadata } from "next";
import { HolderTable } from "@/components/giveaways/HolderTable";
import { CardHead, PageHead, Stat } from "@/components/ui";
import { BRAND, TOKEN } from "@/config/brand";

export const metadata: Metadata = { title: "Giveaways" };

const STEPS = [
  ["An NFT arrives", "Sent to the giveaway contract. Any collection counts."],
  ["Holders are snapshotted", `${BRAND.symbol} balances summed from public transfer logs, weighted, and published.`],
  ["30 minutes to check it", "The snapshot sits in the open before any draw. The winner cannot be known yet, not even to us."],
  ["The winner is paid", "Drawn from verifiable randomness and sent automatically."],
];

export default function GiveawaysPage() {
  return (
    <div className="wrap">
      <PageHead title="Giveaways" sub={`NFTs given away to ${BRAND.symbol} holders, weighted by how much you hold. Nothing to enter.`} />
      <div className="space-y-4">
        <section className="card p-5 sm:p-6">
          <h2 className="text-[18px] font-medium">{TOKEN.isLive ? "Nothing queued right now" : "The first giveaway runs after launch"}</h2>
          <p className="mt-1.5 max-w-[520px] text-[13.5px] leading-relaxed text-fg-60">
            Every {BRAND.symbol} holder is entered automatically, weighted by balance. There is nothing to sign up for and no transaction
            to send: when an NFT lands in the giveaway contract, the draw starts on its own.
          </p>
          <ol className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="card-flat p-3.5">
                <span className="num text-[11px] text-fg-45">{i + 1}</span>
                <p className="mt-1 text-[13.5px] font-medium">{title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-fg-60">{body}</p>
              </li>
            ))}
          </ol>
        </section>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Cadence" value="6h" sub="one NFT every, once live" />
          <Stat label="Holders entered" value={TOKEN.isLive ? "live" : "—"} sub="automatically" />
          <Stat label="Given away" value="0" sub="none run yet" />
          <Stat label="Eligible supply" value="—" sub="team, pool and burn excluded" />
        </div>
        <HolderTable />
        <section className="card">
          <CardHead title="Past giveaways" right="0 total" />
          <p className="px-5 py-10 text-center text-[13.5px] text-fg-60">No giveaways yet. Each one will be listed here with its winner, its draw and a link to verify it.</p>
        </section>
        <p className="px-1 text-[12px] leading-relaxed text-fg-45">
          Every draw will come with two links: one that recomputes the holder snapshot from public transfer logs and says whether it
          matches what was committed on chain, and the snapshot file itself, whose hash the contract records. The code that does the
          recomputing is public, so none of it has to be taken on our word.
        </p>
      </div>
    </div>
  );
}
