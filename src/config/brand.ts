// Single place to change project identity. Everything on the site reads from here.
// `CA` is a placeholder until launch. Replace it with the real 0x address and the
// navbar pill, the mobile menu and the footer block start copying it on their own.

const CA = "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

export const isAddress = (v: string): v is `0x${string}` =>
  /^0x[0-9a-fA-F]{40}$/.test(v);

export const BRAND = {
  name: "Arterial",
  ticker: "ARTERIAL",
  symbol: "$ARTERIAL",
  domain: "arterial.live",
  url: "https://arterial.live",
  email: "team@arterial.live",
  slogan: "Memecoin fees flowing live to NFT collections.",
  description:
    "Arterial pairs every memecoin with an NFT collection on Robinhood Chain. Most of its creator fees flow into a vault that can only buy that collection's floor, and the NFTs go back to holders.",
  x: "https://x.com/arterial",
  xHandle: "@arterial",
  /** Public GitHub repo. Empty hides every GitHub link on the site. */
  github: "https://github.com/ArterialLive/Arterial" as string,
  ca: CA as string,
} as const;

// Public endpoints are the default. An operator can point the site at a
// private RPC with ROBINHOOD_RPC_URL (server) / NEXT_PUBLIC_ROBINHOOD_RPC_URL
// (browser and server). Both are optional.
const PUBLIC_RPC = "https://rpc.mainnet.chain.robinhood.com";

export const CHAIN = {
  id: 4663,
  hex: "0x1237",
  name: "Robinhood Chain",
  nativeSymbol: "ETH",
  decimals: 18,
  publicRpc: PUBLIC_RPC,
  rpc: process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL || PUBLIC_RPC,
  /** Second public endpoint, used for reads only when the first one fails. */
  fallbackRpc: "https://robinhood-rpc.publicnode.com",
  explorer: "https://robinhoodchain.blockscout.com",
  explorerName: "Blockscout",
} as const;

/** RPC for server code: the private endpoint when set, else the public one. */
export function serverRpc() {
  return (
    process.env.ROBINHOOD_RPC_URL ||
    process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL ||
    PUBLIC_RPC
  );
}

export const TOKEN = {
  get isLive() {
    return isAddress(BRAND.ca);
  },
};

export function explorerAddress(address: string) {
  return `${CHAIN.explorer}/address/${address}`;
}
export function explorerToken(address: string) {
  return `${CHAIN.explorer}/token/${address}`;
}
export function shortAddress(address: string, head = 6, tail = 4) {
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}
