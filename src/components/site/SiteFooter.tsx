import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { Logo } from "@/components/Logo";
import { CaBlock } from "@/components/CopyCa";

const PRODUCT = [
  { href: "/explore", label: "Explore" },
  { href: "/explore?venue=collections", label: "Collections" },
  { href: "/analytics?view=payments", label: "Payments" },
  { href: "/analytics", label: "Analytics" },
  { href: "/launch", label: "Launch" },
];

const COMMUNITY = [
  { href: "/gallery", label: "Gallery" },
  { href: "/giveaways", label: "Giveaways" },
  { href: "/claims", label: "Claims" },
  { href: "/profile", label: "Profile" },
];

const LEGAL = [
  { href: "/docs", label: "Docs" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line-2">
      <div className="wrap grid grid-cols-1 gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-[300px] text-[13.5px] leading-relaxed text-fg-60">
            {BRAND.slogan} Fee split, vault spending and NFT custody are meant to be enforced by contracts on {CHAIN.name}.
          </p>
          <div className="mt-5">
            <CaBlock />
          </div>
        </div>
        <FooterCol title="Product" links={PRODUCT} />
        <FooterCol title="Community" links={COMMUNITY} />
        <div>
          <FooterCol title="Legal" links={LEGAL} />
          <a href={CHAIN.explorer} target="_blank" rel="noreferrer" className="link mt-2.5 block text-[13.5px]">
            Explorer
          </a>
        </div>
      </div>
      <div className="wrap flex flex-wrap items-center justify-between gap-2 border-t border-line-2 py-5 text-[11.5px] text-fg-45">
        <p>Nothing here is financial advice. Figures marked sample are illustrative until the contracts are deployed.</p>
        <p className="num">
          {CHAIN.name} · chain {CHAIN.id} · {BRAND.domain}
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="kicker">{title}</p>
      <ul className="mt-3 space-y-2.5 text-[13.5px]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="link">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
