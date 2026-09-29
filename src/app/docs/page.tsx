import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, CHAIN, TOKEN, explorerToken } from "@/config/brand";
import { CopyText } from "@/components/CopyText";

export const metadata: Metadata = { title: "Docs" };

const TOC = [
  ["how", "How it works"],
  ["split", "Fee split"],
  ["policy", "What happens to the NFTs"],
  ["rule", "The vault rule"],
  ["draws", "Draws"],
  ["external", "External collections"],
  ["contracts", "Contracts & addresses"],
  ["faq", "FAQ"],
];

const STEPS = [
  ["Launch", "You launch a coin through the Arterial launcher and pick one listed NFT collection. The launcher deploys a small fee router for your coin and registers it as the coin's creator-fee recipient. That pairing never changes."],
  ["Trade", "People trade the coin on its bonding curve, and later in a locked liquidity pool once it graduates. The creator share of every trading fee, plus any creator tax you set, collects in escrow for the router."],
  ["Sweep", "Anyone can call harvest(). The router pulls its fees out of escrow and sends 80% to the collection's vault and 20% to the treasury. When the vault can afford a floor listing, anyone can call sweep(); ETH only leaves if an NFT arrives at or under the posted cap."],
  ["Settle", "Each NFT is charged to the coin whose trading fees paid for it, and that coin's launch policy decides its fate: drawn for one holder, or burned. A draw settles on public randomness, described below."],
];

const RULES: [string, string][] = [
  ["RULE", "spend ≤ floorCap × bought"],
  ["TARGET", "allow-listed marketplace only"],
  ["SPLIT", "80 / 20 vault / treasury"],
  ["CAP TTL", "1 hour, posted by the keeper"],
  ["DRAW", "future randomness round, pinned on request"],
  ["SNAPSHOT", "published 30 min before, open to challenge"],
  ["CUSTODY", "NFTs leave only by draw or burn"],
  ["WITHDRAW", "no such function, on any vault"],
  ["HARVEST", "permissionless, anyone may call it"],
  ["PAIRING", "fixed at launch, for good"],
  ["POLICY", "fixed at launch, cannot be edited"],
  ["ATTRIBUTION", "by fees earned in trades, not ETH paid in"],
];

const FAQ: [string, string][] = [
  ["Does a collection have to agree to be listed?", "No. Collections are added to the registry by its owner, and any coin may pair with a listed one. The vault buys on the open market at floor; the collection's team is not involved and receives nothing from it."],
  ["What changes when a coin graduates?", "Its liquidity moves from the bonding curve into a locked pool. Fees keep arriving at the same router, so the same 80 / 20 split keeps feeding the same vault. The keeper simply starts harvesting from the pool instead of the curve."],
  ["What can the keeper do, and what can it not?", "The keeper is an operator key. It posts floor caps (each expires after an hour), feeds listings to sweep(), and opens draws with a holder snapshot. It cannot take ETH out of a vault, cannot choose or re-roll a winner, and cannot stop a draw from settling. What remains its call is which listing to buy under the cap and which snapshot to publish, and both are on chain for anyone to check."],
  ["Can a vault be emptied?", "Not by anyone holding a key. ETH leaves only inside a sweep that provably brought NFTs in under the cap, and NFTs leave only through a settled draw or a burn. The owner can pause sweeps for a collection or rotate the keeper, but has no withdraw path. External-lane vaults are the one exception, covered above, which is why they publish an audit trail."],
  ["Can a creator change the NFT policy after launch?", "No. The policy is written into the transaction that creates the coin, and that is the record the protocol reads. There is no setter that reaches an NFT."],
  ["Can someone buy their way into a prize by paying a vault?", "Paying ETH into a coin's escrow does fund the vault, and it will buy NFTs. It buys no claim on them. Which coin an NFT belongs to is decided by the fees each coin earned from real trades, which the escrow records separately from anything paid in."],
  ["The vault is shared. Whose NFT is it?", "The coin whose earned fees covered most of the purchase. A purchase only goes through when every coin it would be charged to has the same policy, so a burn coin never destroys an NFT that an airdrop coin's holders helped pay for."],
  ["My coin shows fees but its vault is empty. Why?", "Fees wait in escrow until someone calls harvest(). Anyone can, the keeper does it on a loop, and the coin page will have a button for it once the contracts are live."],
];

export default function DocsPage() {
  return (
    <div className="wrap-wide pt-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[200px_1fr]">
        <nav className="hidden lg:block" aria-label="On this page">
          <div className="sticky top-[84px]">
            <p className="kicker">On this page</p>
            <ul className="mt-3 space-y-2 text-[13.5px]">
              {TOC.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="link">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <article className="prose-doc min-w-0 max-w-[680px]">
          <h1 className="h-page">How {BRAND.name} works</h1>
          <p className="mt-3 text-[16px]">
            A memecoin launchpad where creator fees have exactly one job: buy the floor of one NFT collection and hand those NFTs to
            the coin&apos;s holders. It runs on {CHAIN.name}, with contracts doing the parts you would otherwise have to trust a
            person for.
          </p>
          <p className="mt-3 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-[13px]">
            Status: the contracts described here are not deployed yet. This page is the design they are being built to. Numbers
            elsewhere on the site are marked <span className="text-warn">sample</span> until then.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
            {TOC.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="chip">
                {label}
              </a>
            ))}
          </div>

          <h2 id="how" className="h-section mt-12">How it works</h2>
          <ol className="mt-4 space-y-3">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="card flex gap-4 p-4">
                <span className="num text-[12px] text-fg-45">{i + 1}</span>
                <div>
                  <p className="font-medium text-ink">{title}</p>
                  <p className="mt-1 text-[14px]">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2 id="split" className="h-section mt-12">Fee split</h2>
          <p className="mt-3">Every wei that reaches a router is split the same way, permanently:</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="card p-4">
              <p className="num text-[30px] text-pulse">80%</p>
              <p className="text-[13.5px]">to the paired collection&apos;s vault</p>
            </div>
            <div className="card p-4">
              <p className="num text-[30px]">20%</p>
              <p className="text-[13.5px]">to the protocol treasury</p>
            </div>
          </div>
          <p className="mt-4">
            Each router is a minimal proxy (EIP-1167) with no owner and no upgrade path; the split is a constant in its bytecode. None
            of it goes to the coin&apos;s creator. A creator&apos;s upside is the coin itself.
          </p>
          <p className="mt-3">
            The creator tax chosen at launch (0 to 10%) sits on top of the base creator share and flows through the same split.
            Buys in the launch block pay a decaying anti-snipe tax that also lands in the router, so snipers end up paying for the
            first sweep.
          </p>

          <h2 id="policy" className="h-section mt-12">What happens to the NFTs</h2>
          <p className="mt-3">A coin picks one of two outcomes at launch, and it applies to every NFT its fees ever buy:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <b className="text-ink">Airdrop to holders.</b> Each NFT goes to one holder, drawn at random with odds that scale with
              their balance.
            </li>
            <li>
              <b className="text-ink">Burn.</b> Each NFT goes to a dead address and the collection&apos;s supply shrinks for good.
            </li>
          </ul>
          <p className="mt-3">
            <b className="text-ink">Only trading fees count.</b> A vault is shared by every coin paired with its collection, and anyone
            can pay ETH into a coin&apos;s escrow. That ETH still buys NFTs, but it earns no say over them: ownership follows the fees
            each coin earned in trades, read from the escrow&apos;s own record of where each credit came from.
          </p>
          <p className="mt-3">
            <b className="text-ink">Burn money and draw money never mix.</b> One NFT can be paid for by several coins. A purchase is
            only made when every coin it would be charged to wants the same outcome.
          </p>

          <h2 id="rule" className="h-section mt-12">The vault rule</h2>
          <p className="mt-3">
            A vault is a contract that holds ETH and can only turn it into NFTs of one collection. It has no withdraw function. Every
            sweep must pass all of these checks in the same transaction, or it reverts:
          </p>
          <div className="card mt-4 overflow-x-auto p-4">
            <table className="num w-full min-w-[420px] text-[12.5px]">
              <thead>
                <tr className="kicker text-left">
                  <th className="pb-2 font-normal">Key</th>
                  <th className="pb-2 font-normal">Value</th>
                </tr>
              </thead>
              <tbody>
                {RULES.map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-1 pr-6 text-fg-45">{k}</td>
                    <td className="py-1 text-ink">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>The call must go to an allow-listed marketplace contract.</li>
            <li>The vault&apos;s NFT balance must rise by at least the number the caller promised.</li>
            <li>ETH spent must be at most the floor cap times the NFTs bought. The keeper posts the cap from live floor data and it expires after an hour.</li>
            <li>Only token ids the caller listed in advance may arrive; anything else reverts the whole sweep.</li>
            <li>NFTs leave the vault only through the draw distributor or the burn path.</li>
          </ul>

          <h2 id="draws" className="h-section mt-12">Draws</h2>
          <p className="mt-3">
            The winning ticket comes from a public randomness beacon verified on {CHAIN.name}. Nobody picks it and nobody can roll it
            again.
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li><b className="text-ink">Open.</b> The keeper snapshots holders, builds a Merkle tree of ticket ranges, and opens the draw with the root and a link to the full list.</li>
            <li><b className="text-ink">Challenge.</b> For 30 minutes the snapshot is public and no draw can happen. Anyone can fetch the list and rebuild the root.</li>
            <li><b className="text-ink">Request.</b> Anyone calls <code>requestDraw(id)</code>. The draw is pinned to a randomness round a few seconds in the future, a value nobody can know yet. Once pinned it cannot be changed or cancelled.</li>
            <li><b className="text-ink">Resolve.</b> When that round is published its signature is checked on chain, and the value it yields picks the ticket.</li>
            <li><b className="text-ink">Deliver.</b> Anyone submits the winner&apos;s Merkle proof and the vault releases the NFT to them.</li>
          </ol>
          <p className="mt-3">
            Delivery is not the keeper&apos;s privilege: any address can submit the round&apos;s signature and the result is the same
            whoever does. If a request sits undelivered for 24 hours, anyone can move it to a fresh round. A draw always settles.
          </p>
          <p className="mt-3">
            One honest caveat: the holder snapshot is still the keeper&apos;s word. The challenge window makes a bad root visible to
            everyone, but nothing on chain rejects one automatically.
          </p>

          <h2 id="external" className="h-section mt-12">External collections</h2>
          <p className="mt-3">
            Some collections live on chains the vault cannot call, Ethereum today. Those get an external vault: fees still arrive on{" "}
            {CHAIN.name} with the same per-coin records, but buying happens off-chain by the keeper.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>ETH leaves only through an announced withdrawal behind a one-hour time lock that anyone can watch and the owner can cancel.</li>
            <li>Each purchase and each delivery is recorded on chain with its receipt, so the books can be checked against the other chain.</li>
            <li>Ethereum shares an address space with {CHAIN.name}, so the winning address is theirs there too: the prize is delivered to it once the winner confirms it on the Claims page.</li>
          </ul>

          <h2 id="contracts" className="h-section mt-12">Contracts & addresses</h2>
          <div className="card mt-4 divide-y divide-line-2 text-[13px]">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="text-ink">{BRAND.symbol} token</span>
              {TOKEN.isLive ? (
                <span className="flex items-center gap-3">
                  <CopyText value={BRAND.ca} />
                  <a href={explorerToken(BRAND.ca)} target="_blank" rel="noreferrer" className="link">
                    explorer
                  </a>
                </span>
              ) : (
                <span className="num text-fg-45">published at launch</span>
              )}
            </div>
            {["Collection registry", "Launcher", "Draw distributor", "Fee escrow"].map((name) => (
              <div key={name} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className="text-ink">{name}</span>
                <span className="num text-fg-45">published at deployment</span>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="text-ink">Chain</span>
              <span className="num text-fg-60">
                {CHAIN.name} · {CHAIN.id} ·{" "}
                <a href={CHAIN.explorer} target="_blank" rel="noreferrer" className="link">
                  explorer
                </a>
              </span>
            </div>
          </div>
          <p className="mt-3 text-[13.5px]">
            Each listed collection will have its own vault, shown on its <Link href="/explore?venue=collections" className="text-ink underline underline-offset-2">collection page</Link>. Each coin will have its own router, shown on its coin page.
          </p>

          <h2 id="faq" className="h-section mt-12">FAQ</h2>
          <div className="mt-4 space-y-2">
            {FAQ.map(([q, a]) => (
              <details key={q} className="card group px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14.5px] font-medium text-ink">
                  {q}
                  <span className="text-fg-45 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-[14px]">{a}</p>
              </details>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
