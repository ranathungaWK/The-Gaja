// Generates PWA icons from the Ali Mankadin Eha circle badge (public/brand/mark-solid.png):
// black disc with the white elephant, transparent outside the circle.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const path = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const out = (name) => path(`../public/icons/${name}`);
await mkdir(path("../public/icons/"), { recursive: true });

const badge = path("../public/brand/mark-solid.png");

// size: canvas size; scale: share of the canvas the badge fills; square: paint a white square behind it.
const icon = async (size, { scale = 1, square = false } = {}) => {
  const d = Math.round(size * scale);
  const offset = Math.round((size - d) / 2);
  const ink = await sharp(badge).resize(d, d, { kernel: "lanczos3" }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: square ? "#ffffff" : { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: ink, left: offset, top: offset }])
    .png();
};

await (await icon(192)).toFile(out("icon-192.png"));
await (await icon(512)).toFile(out("icon-512.png"));
await (await icon(512, { scale: 0.72, square: true })).toFile(out("maskable-512.png"));
await (await icon(180, { scale: 0.86, square: true })).toFile(out("apple-touch-icon.png"));
await (await icon(48)).toFile(out("favicon-48.png"));
console.log("icons written");
