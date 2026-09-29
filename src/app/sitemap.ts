import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";
import { COINS, COLLECTIONS, coinHref, collectionHref } from "@/content/seed";

const STATIC = ["", "/explore", "/collections", "/launch", "/analytics", "/claims", "/gallery", "/giveaways", "/profile", "/docs", "/terms", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC.map((p) => ({ url: `${BRAND.url}${p}` })),
    ...COINS.map((c) => ({ url: `${BRAND.url}${coinHref(c)}` })),
    ...COLLECTIONS.map((c) => ({ url: `${BRAND.url}${collectionHref(c)}` })),
  ];
}
