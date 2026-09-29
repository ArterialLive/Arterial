import catalog from "./catalog.json";

/*
 * Sample protocol state, derived deterministically from catalog.json.
 * Nothing here is read from a chain: the Arterial launcher, vaults and
 * raffles are not deployed yet, so every page that shows these numbers
 * labels them as sample data. Same input, same output, on server and client.
 */

export type Lane = "robinhood" | "ethereum";
export type Policy = "airdrop" | "burn";
export type NftStatus = "vault" | "given" | "onway" | "burned";

export type Collection = {
  slug: string;
  name: string;
  lane: Lane;
  address: string;
  vault: string;
  floor: number;
  supply: number;
  image: string;
  coinTickers: string[];
  /** ETH received from coin routers (the 80% share). */
  feesEth: number;
  donationsEth: number;
  budgetEth: number;
  swept: number;
  spentEth: number;
  capAgeMin: number;
};

export type Coin = {
  address: string;
  router: string;
  creator: string;
  ticker: string;
  name: string;
  collection: string;
  policy: Policy;
  taxBps: number;
  graduated: boolean;
  mc: number;
  vol: number;
  ageDays: number;
  image: string;
  /** All creator fees the router has harvested, in ETH. */
  feesEth: number;
  holders: number;
  nftsFunded: number;
};

export type Nft = {
  key: string;
  collection: string;
  tokenId: number;
  priceEth: number;
  coin: string;
  status: NftStatus;
  winner: string | null;
  hoursAgo: number;
  image: string;
  /** Only for prizes waiting on the winner (external lane). */
  hoursLeft: number | null;
};

/** Reference price used only to turn sample USD figures into sample ETH figures. */
const SEED_ETH_USD = 2600;

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable, address-shaped identifier. These are samples and exist on no chain. */
export function sampleAddress(label: string) {
  let out = "";
  for (let round = 0; out.length < 40; round++) {
    let h = 0x811c9dc5 ^ Math.imul(round + 1, 0x9e3779b1);
    const text = `${round}|${label}|${round}`;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    h ^= h >>> 15;
    h = Math.imul(h, 0x2c1b3c6d) >>> 0;
    h ^= h >>> 12;
    out += (h >>> 0).toString(16).padStart(8, "0");
  }
  return `0x${out.slice(0, 40)}`;
}

const round = (v: number, d = 4) => Math.round(v * 10 ** d) / 10 ** d;

export const COINS: Coin[] = catalog.coins.map((c) => {
  const feesEth = round((c.vol * c.age * 0.0035 + c.mc * 0.004) / SEED_ETH_USD);
  return {
    address: sampleAddress(`coin:${c.ticker}`),
    router: sampleAddress(`router:${c.ticker}`),
    creator: sampleAddress(`creator:${c.seed % 9}`),
    ticker: c.ticker,
    name: c.name,
    collection: c.collection,
    policy: c.policy as Policy,
    taxBps: c.taxBps,
    graduated: c.graduated,
    mc: c.mc,
    vol: c.vol,
    ageDays: c.age,
    image: `/art/coins/${c.ticker.toLowerCase()}.webp`,
    feesEth,
    holders: Math.round(40 + c.mc / 95 + c.age * 11),
    nftsFunded: 0,
  };
});

const coinsBySlug = new Map<string, Coin[]>();
for (const coin of COINS) {
  coinsBySlug.set(coin.collection, [...(coinsBySlug.get(coin.collection) ?? []), coin]);
}

export const NFTS: Nft[] = [];

export const COLLECTIONS: Collection[] = catalog.collections.map((c) => {
  const rnd = prng(c.seed);
  const coins = coinsBySlug.get(c.slug) ?? [];
  const feesEth = round(coins.reduce((s, x) => s + x.feesEth * 0.8, 0));
  const donationsEth = round(rnd() * 0.02);
  const available = feesEth + donationsEth;
  // A vault buys whenever it can afford a floor, so what is left is always below one floor.
  const prices: number[] = [];
  let remaining = available;
  for (;;) {
    const price = round(c.floor * (0.9 + rnd() * 0.1));
    if (remaining < price) break;
    prices.push(price);
    remaining -= price;
  }
  const swept = prices.length;
  let spentEth = 0;
  const lane = c.lane as Lane;
  const maxAge = Math.max(1, ...coins.map((x) => x.ageDays)) * 24;
  for (let i = 0; i < swept; i++) {
    const price = prices[i];
    spentEth += price;
    // Charge each purchase to a coin, weighted by the fees it earned.
    const total = coins.reduce((s, x) => s + x.feesEth, 0) || 1;
    let pick = rnd() * total;
    const coin = coins.find((x) => (pick -= x.feesEth) <= 0) ?? coins[0];
    coin.nftsFunded += 1;
    const hoursAgo = Math.round(((swept - 1 - i) / swept) * maxAge * (0.85 + rnd() * 0.1) + rnd() * 7);
    const tokenId = 1 + Math.floor(rnd() * c.supply);
    let status: NftStatus = coin.policy === "burn" ? "burned" : "given";
    let hoursLeft: number | null = null;
    if (hoursAgo < 5 && coin.policy === "airdrop") status = "vault";
    if (lane === "ethereum" && status === "given" && hoursAgo < 90) {
      status = "onway";
      hoursLeft = Math.max(3, 72 - hoursAgo);
    }
    NFTS.push({
      key: `${c.slug}-${tokenId}-${i}`,
      collection: c.slug,
      tokenId,
      priceEth: price,
      coin: coin.ticker,
      status,
      winner: status === "given" || status === "onway" ? sampleAddress(`winner:${c.slug}:${i}`) : null,
      hoursAgo,
      image: `/art/nfts/${c.slug}-${tokenId % 6}.webp`,
      hoursLeft,
    });
  }
  spentEth = round(spentEth);
  return {
    slug: c.slug,
    name: c.name,
    lane,
    address: sampleAddress(`nft:${c.slug}`),
    vault: sampleAddress(`vault:${c.slug}`),
    floor: c.floor,
    supply: c.supply,
    image: `/art/collections/${c.slug}.webp`,
    coinTickers: coins.map((x) => x.ticker),
    feesEth,
    donationsEth,
    budgetEth: round(Math.max(0, available - spentEth)),
    swept,
    spentEth,
    capAgeMin: 4 + Math.floor(rnd() * 50),
  };
});

NFTS.sort((a, b) => a.hoursAgo - b.hoursAgo);

export const coinByAddress = (address: string) =>
  COINS.find((c) => c.address.toLowerCase() === address.toLowerCase()) ?? null;
export const coinByTicker = (ticker: string) => COINS.find((c) => c.ticker === ticker) ?? null;
export const collectionBySlug = (slug: string) => COLLECTIONS.find((c) => c.slug === slug) ?? null;
export const collectionByAddress = (address: string) =>
  COLLECTIONS.find((c) => c.address.toLowerCase() === address.toLowerCase()) ?? null;

export const coinHref = (coin: Coin) => `/coins/${coin.address}`;
export const collectionHref = (c: Collection) => `/collections/${c.address}`;

export const laneLabel = (lane: Lane) => (lane === "robinhood" ? "Robinhood Chain" : "Ethereum");

/** Platform totals, all from the sample data above. */
export function totals() {
  const fees = COINS.reduce((s, c) => s + c.feesEth, 0);
  const toVaults = fees * 0.8;
  const spent = COLLECTIONS.reduce((s, c) => s + c.spentEth, 0);
  const waiting = COLLECTIONS.reduce((s, c) => s + c.budgetEth, 0);
  const given = NFTS.filter((n) => n.status === "given" || n.status === "onway").length;
  return {
    coins: COINS.length,
    graduated: COINS.filter((c) => c.graduated).length,
    collections: COLLECTIONS.length,
    nfts: NFTS.length,
    given,
    burned: NFTS.filter((n) => n.status === "burned").length,
    inVault: NFTS.filter((n) => n.status === "vault").length,
    onWay: NFTS.filter((n) => n.status === "onway").length,
    feesEth: fees,
    toVaultsEth: toVaults,
    toTreasuryEth: fees * 0.2,
    spentEth: spent,
    waitingEth: waiting,
  };
}

/** Cumulative ETH swept, oldest first, for the analytics chart. */
export function sweepSeries() {
  const ordered = [...NFTS].sort((a, b) => b.hoursAgo - a.hoursAgo);
  let acc = 0;
  return ordered.map((n) => {
    acc += n.priceEth;
    return { hoursAgo: n.hoursAgo, total: acc };
  });
}

/** A sample price path for a coin page, ending at its market cap. */
export function priceSeries(coin: Coin, points = 60) {
  const rnd = prng(coin.ticker.length * 977 + coin.mc);
  const out: number[] = [];
  let v = coin.mc * (0.25 + rnd() * 0.3);
  for (let i = 0; i < points; i++) {
    const pull = (coin.mc - v) / (points - i + 2);
    v = Math.max(coin.mc * 0.05, v + pull + (rnd() - 0.5) * coin.mc * 0.09);
    out.push(v);
  }
  out[out.length - 1] = coin.mc;
  return out;
}

export function agoLabel(hours: number) {
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
