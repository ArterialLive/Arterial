"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "@/config/brand";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CopyCaPill } from "@/components/CopyCa";
import { WalletButton } from "@/components/wallet/WalletButton";
import { SearchPalette } from "@/components/site/SearchPalette";
import { CloseIcon, MenuIcon, SearchIcon, UserIcon, XIcon } from "@/components/icons";

export const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/gallery", label: "Gallery" },
  { href: "/claims", label: "Claims" },
  { href: "/giveaways", label: "Giveaways" },
  { href: "/analytics", label: "Analytics" },
  { href: "/docs", label: "Docs" },
];

function isActive(pathname: string, href: string) {
  if (href === "/explore") return pathname.startsWith("/explore") || pathname.startsWith("/coins") || pathname.startsWith("/collections");
  return pathname === href || pathname.startsWith(`${href}/`);
}

const iconBtn = "size-8 place-items-center rounded-full text-fg-60 transition-colors hover:bg-tint-2 hover:text-ink";

export function SiteHeader() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);

  // Close the mobile menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenu(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line-2 bg-bg/85 backdrop-blur-md">
      <div className="wrap-wide flex h-[56px] items-center gap-6">
        <Link href="/" aria-label={`${BRAND.name} home`} className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[14px] transition-colors ${isActive(pathname, item.href) ? "font-medium text-ink" : "text-fg-60 hover:text-ink"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <button type="button" onClick={() => setSearch(true)} aria-label="Search coins (Cmd+K)" className={`${iconBtn} grid`}>
            <SearchIcon className="size-[17px]" />
          </button>
          <Link href="/profile" aria-label="Profile" className={`${iconBtn} hidden sm:grid ${pathname.startsWith("/profile") ? "bg-tint-2 text-ink" : ""}`}>
            <UserIcon className="size-[17px]" />
          </Link>
          <a href={BRAND.x} target="_blank" rel="noreferrer" aria-label={`${BRAND.name} on X`} className={`${iconBtn} hidden sm:grid`}>
            <XIcon className="size-[15px]" />
          </a>
          <ThemeToggle />
          <CopyCaPill className="ml-1 hidden md:inline-flex" />
          <Link href="/launch" className="btn btn-solid ml-1 hidden sm:inline-flex">
            Launch
          </Link>
          <WalletButton className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-label={menu ? "Close menu" : "Open menu"}
            className={`${iconBtn} grid lg:hidden`}
          >
            {menu ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {menu && (
        <div className="border-t border-line-2 bg-bg lg:hidden">
          <nav className="wrap-wide grid gap-1 py-3" aria-label="Mobile">
            {[...NAV, { href: "/launch", label: "Launch a coin" }, { href: "/profile", label: "Profile" }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2.5 text-[15px] ${isActive(pathname, item.href) ? "bg-tint-2 font-medium text-ink" : "text-fg-70 hover:bg-tint"}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-line-2 px-1 pt-3">
              <CopyCaPill />
              <WalletButton />
              <a href={BRAND.x} target="_blank" rel="noreferrer" className="btn">
                <XIcon className="size-3.5" /> {BRAND.xHandle}
              </a>
            </div>
          </nav>
        </div>
      )}

      {search && <SearchPalette onClose={() => setSearch(false)} />}
    </header>
  );
}
