# Arterial

**Memecoin fees flowing live to NFT collections.** $ARTERIAL · Robinhood Chain · [arterial.live](https://arterial.live) · [@ArterialLive](https://x.com/ArterialLive)

## The problem

Memecoins generate a steady stream of trading fees, and almost all of it disappears into a creator's wallet. Holders get
nothing back but the chart, and there is no way for them to check where the money went or what it was spent on.

NFT collections have the opposite problem: their floors thin out as holders leave, and nothing structural keeps buying.

## The solution

Arterial pairs every memecoin with one NFT collection, permanently.

- **80% of the coin's creator fees** flow into a vault that can do exactly one thing: buy that collection's floor.
  The vault has no withdraw function, and it can only spend up to a posted floor cap per NFT.
- **20%** goes to the protocol treasury. None of it goes to the coin's creator directly; their upside is the coin.
- Every NFT the vault buys goes back to the coin's holders in a random draw weighted by balance, or is burned,
  depending on the policy the creator locked in at launch.
- Draws settle on public randomness, and anyone can trigger fee harvests, draws and deliveries. No single key can
  pick a winner or drain a vault.

The full design is on the site's `/docs` page.

## What you can try

Live today (read straight from Robinhood Chain, no keys needed):

- **Wallet connect** with any EIP-6963 browser wallet (MetaMask, Rabby and others). The site asks the wallet to switch to
  Robinhood Chain, or to add it if the wallet does not know it yet, reconnects silently on your next visit, and shows
  your live ETH balance.
- **Live chain readout**: block height, gas price and the ETH/USD price from the Chainlink feed on Robinhood Chain.
- **Profiles for any address** (`/profile/0x…`): live ETH balance, transaction count and account type.
- **Claims checker**: paste any address to read it from the chain.
- **Launch wizard** (`/launch`): the full four-step flow with a live fee-split preview.

Coming with the contracts (shown as clearly labelled sample data until then):

- Coins, collections, vaults, sweeps, the NFT gallery and winners.
- Launching a coin, harvesting fees, claiming prizes, $ARTERIAL giveaways and buybacks.
- As soon as the $ARTERIAL contract address is set, the copy button, burn counters, holder list and token balances
  switch on by themselves.

## Run it locally

You need **Node.js 20 or newer**. Download ZIP or fork this repository, then:

```bash
npm install
npm run build
npm run start        # http://localhost:4710
```

The server listens on port **4710**. `npm run dev` also works on machines with enough memory.

Optional environment variables (put them in `.env.local`, or in your host's environment settings):

| Variable | Where it is used | Purpose |
|---|---|---|
| `ROBINHOOD_RPC_URL` | server only | A private Robinhood Chain RPC URL, for example from Alchemy. |
| `NEXT_PUBLIC_ROBINHOOD_RPC_URL` | browser and server | A public-safe RPC override. |

Without either one the site uses the public endpoint and works as is.

`npm run assets` redraws the icons, the social card (built on `public/brand/arterial-banner.webp`) and all the pixel art
from `src/content/catalog.json`. The mark, tile and banner in `public/brand/` are the brand artwork itself.

## Add Robinhood Chain to your wallet

The site offers to add the network for you when you connect. To add it by hand:

| Field | Value |
|---|---|
| Network name | Robinhood Chain |
| RPC URL | `https://rpc.mainnet.chain.robinhood.com` |
| Chain ID | `4663` (hex `0x1237`) |
| Currency symbol | ETH |
| Block explorer | `https://robinhoodchain.blockscout.com` |

## Project layout

```
src/
  app/                  routes (App Router) and API routes
    api/rpc/            read-only JSON-RPC relay (allow-listed methods)
    api/price/          ETH/USD from Chainlink on Robinhood Chain
    api/holders/        token holders from the public explorer API
  components/
    wallet/             EIP-6963 wallet provider and wallet sheet
    site/               header, footer, search palette
    cards/, explore/, coin/, analytics/, launch/, ...
  config/brand.ts       name, links, chain settings and the token contract address
  content/catalog.json  sample collections and coins
  content/seed.ts       sample vaults, sweeps and draws derived from the catalogue
  lib/                  RPC helpers and number formatting
scripts/                asset generator (icons, social card, sprite art)
public/                 generated images (.webp)
```

## Token contract

| | |
|---|---|
| Token | $ARTERIAL |
| Chain | Robinhood Chain (4663) |
| Contract address | Published at launch. It will appear here and in `src/config/brand.ts`. |

Nothing in this repository is financial advice. The protocol contracts are not deployed or audited yet.
