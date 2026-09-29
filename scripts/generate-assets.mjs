// Draws every raster asset of the site. Run with `npm run assets`; output is committed.
//   - brand: favicon.ico (RGBA PNG payloads), icon.svg, apple-icon.png, mark and og card
//   - art:   one avatar per sample collection, six NFTs per collection, one logo per sample coin
// All art is procedural pixel sprites, seeded from src/content/catalog.json.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { INK, NIGHT, PULSE, markShapes } from "./brand-mark.mjs";

const catalog = JSON.parse(await readFile(new URL("../src/content/catalog.json", import.meta.url), "utf8"));

/* ---------- brand ---------- */

const tile = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="15" fill="${NIGHT}"/>
  <g transform="translate(6 5) scale(0.8125)">${markShapes(PULSE)}</g>
</svg>`;

const bare = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${markShapes(PULSE)}</svg>`;

async function png(svg, size) {
  return sharp(Buffer.from(svg), { density: 384 }).resize(size, size).ensureAlpha().png().toBuffer();
}

/** ICO container with PNG payloads (RGBA), which every current browser reads. */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

/* ---------- sprites ---------- */

function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))));
  return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** A mirrored 12x12 creature: body, belly shade, accent spots, two eyes, dark outline. */
function sprite({ seed, bg, body, accent }) {
  const rnd = prng(seed);
  const N = 12;
  const H = 6;
  const grid = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < H; c++) {
      const toward = c / (H - 1);
      let p = 0.12 + toward * 0.78;
      if (r < 2) p *= 0.55;
      if (r > 9) p *= 0.6;
      if (rnd() < p) grid[r][c] = 1;
    }
  }
  // Solid face so the eyes always sit inside the body.
  for (let r = 3; r <= 7; r++) for (let c = 2; c < H; c++) grid[r][c] = 1;
  for (let r = 0; r < N; r++) for (let c = 0; c < H; c++) grid[r][N - 1 - c] = grid[r][c];
  // Accent marks: a hat band or spots, decided per sprite.
  const hat = rnd() < 0.5;
  const eyeRow = 4 + Math.floor(rnd() * 2);
  const eyeCol = 3 + Math.floor(rnd() * 2);
  const cells = [];
  const outline = shade(bg, -0.55);
  const belly = shade(body, -0.18);
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const mirrorC = c < H ? c : N - 1 - c;
      if (grid[r][c]) {
        let fill = r >= 8 ? belly : body;
        if (hat && r <= 2) fill = accent;
        if (!hat && r >= 6 && r <= 9 && ((r * 7 + mirrorC * 3 + seed) % 5 === 0)) fill = accent;
        if (r === eyeRow && mirrorC === eyeCol) fill = "#ffffff";
        if (r === eyeRow + 1 && mirrorC === eyeCol) fill = "#141414";
        cells.push([r, c, fill]);
      } else {
        const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => grid[r + dr]?.[c + dc]);
        if (near) cells.push([r, c, outline]);
      }
    }
  }
  const pad = 2;
  const size = N + pad * 2;
  const rects = cells.map(([r, c, f]) => `<rect x="${c + pad}" y="${r + pad}" width="1.02" height="1.02" fill="${f}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size * 20}" height="${size * 20}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${bg}"/>${rects}</svg>`;
}

async function webp(svg, out, size) {
  await sharp(Buffer.from(svg)).resize(size, size, { kernel: "nearest" }).webp({ quality: 90 }).toFile(out);
}

await mkdir("public/brand", { recursive: true });
await mkdir("public/art/collections", { recursive: true });
await mkdir("public/art/nfts", { recursive: true });
await mkdir("public/art/coins", { recursive: true });

await writeFile("src/app/icon.svg", tile(64));
await writeFile("public/brand/arterial-mark.svg", bare);
await writeFile("src/app/favicon.ico", ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(tile(size), size) })))));
await sharp(Buffer.from(tile(180)), { density: 384 }).resize(180, 180).flatten({ background: NIGHT }).png().toFile("src/app/apple-icon.png");
await sharp(Buffer.from(tile(512)), { density: 384 }).resize(512, 512).webp({ quality: 92 }).toFile("public/brand/arterial-icon.webp");
await sharp(Buffer.from(bare), { density: 384 }).resize(512, 512).webp({ quality: 92 }).toFile("public/brand/arterial-mark.webp");

for (const col of catalog.collections) {
  await webp(sprite(col), `public/art/collections/${col.slug}.webp`, 256);
  for (let i = 0; i < 6; i++) {
    const swap = i % 3 === 2;
    await webp(
      sprite({ seed: col.seed * 1000 + i * 17 + 3, bg: col.bg, body: swap ? col.accent : col.body, accent: swap ? col.body : col.accent }),
      `public/art/nfts/${col.slug}-${i}.webp`,
      320,
    );
  }
}

const bySlug = Object.fromEntries(catalog.collections.map((c) => [c.slug, c]));
for (const coin of catalog.coins) {
  const col = bySlug[coin.collection];
  await webp(sprite({ seed: coin.seed * 7919, bg: shade(col.bg, -0.25), body: col.accent, accent: col.body }), `public/art/coins/${coin.ticker.toLowerCase()}.webp`, 192);
}

// Social card: mark, name, slogan, and a row of streams feeding five sprites.
const heroCols = catalog.collections.slice(0, 5);
const spriteImgs = await Promise.all(heroCols.map(async (c) => (await sharp(Buffer.from(sprite(c))).resize(150, 150, { kernel: "nearest" }).png().toBuffer()).toString("base64")));
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${NIGHT}"/>
  <g transform="translate(80 78) scale(1.5)">${markShapes(PULSE)}</g>
  <text x="200" y="140" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="600" fill="${INK}">Arterial</text>
  <text x="80" y="262" font-family="Helvetica, Arial, sans-serif" font-size="50" font-weight="500" fill="${INK}">Memecoin fees flowing live</text>
  <text x="80" y="322" font-family="Helvetica, Arial, sans-serif" font-size="50" font-weight="500" fill="${INK}">to NFT collections.</text>
  <text x="80" y="376" font-family="Menlo, monospace" font-size="22" fill="#efe8e299">$ARTERIAL · Robinhood Chain · arterial.live</text>
  <path d="M80 412 H1120" stroke="${PULSE}" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
  ${heroCols.map((_, i) => `<path d="M${170 + i * 205} 412 V444" stroke="${PULSE}" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 7"/>`).join("")}
  ${spriteImgs.map((b, i) => `<g><rect x="${95 + i * 205}" y="448" width="150" height="150" rx="18" fill="#221f1d"/><image x="${95 + i * 205}" y="448" width="150" height="150" href="data:image/png;base64,${b}" clip-path="inset(0 round 18px)"/></g>`).join("")}
</svg>`;
await sharp(Buffer.from(og)).webp({ quality: 90 }).toFile("public/brand/og.webp");
console.log(`assets written: ${catalog.collections.length} collections, ${catalog.collections.length * 6} nfts, ${catalog.coins.length} coins`);
