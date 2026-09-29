import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/config/brand";
import { THEME_BOOT } from "@/config/theme";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const title = `${BRAND.name}: ${BRAND.slogan}`;

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: { default: title, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title,
    description: BRAND.description,
    images: [{ url: "/brand/og.webp", width: 1200, height: 630, alt: BRAND.name }],
  },
  twitter: {
    card: "summary_large_image",
    site: BRAND.xHandle,
    title,
    description: BRAND.description,
    images: ["/brand/og.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#12100f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <WalletProvider>
          <SiteHeader />
          <main className="min-h-[60vh]">{children}</main>
          <SiteFooter />
        </WalletProvider>
      </body>
    </html>
  );
}
