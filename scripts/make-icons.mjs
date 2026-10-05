// Generates PWA icons from the GAJA logo mark (leaf dot on forest green).
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const out = new URL("../public/icons/", import.meta.url);
await mkdir(out, { recursive: true });

const svg = (size, { padding = 0.18, rounded = true } = {}) => {
  const r = rounded ? size * 0.22 : 0;
  const inner = size * (1 - padding * 2);
  const fontSize = inner * 0.3;
  const dot = inner * 0.2;
  const cx = size / 2;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#1d4b34"/>
  <circle cx="${cx}" cy="${size * 0.4}" r="${dot}" fill="#3c8d5a"/>
  <text x="${cx}" y="${size * 0.4 + dot + fontSize * 1.15}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="${fontSize * 0.04}" fill="#e3f0e4">GAJA</text>
</svg>`);
};

await sharp(svg(192)).png().toFile(new URL("icon-192.png", out).pathname.replace(/^\/(\w:)/, "$1"));
await sharp(svg(512)).png().toFile(new URL("icon-512.png", out).pathname.replace(/^\/(\w:)/, "$1"));
await sharp(svg(512, { padding: 0.28, rounded: false })).png().toFile(new URL("maskable-512.png", out).pathname.replace(/^\/(\w:)/, "$1"));
await sharp(svg(180, { rounded: false })).png().toFile(new URL("apple-touch-icon.png", out).pathname.replace(/^\/(\w:)/, "$1"));
await sharp(svg(48)).png().toFile(new URL("favicon-48.png", out).pathname.replace(/^\/(\w:)/, "$1"));
console.log("icons written");
