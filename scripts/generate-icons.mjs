// Generates icon-192.png and icon-512.png in public/ using sharp
import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

function makeSvg(size) {
  const pad = Math.round(size * 0.15);
  const fontSize = Math.round(size * 0.55);
  const r = Math.round(size * 0.2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#09090b"/>
  <text x="${size / 2}" y="${size / 2 + fontSize * 0.38}" font-size="${fontSize}" text-anchor="middle" font-family="serif">🔥</text>
</svg>`;
}

async function generate(size) {
  const svg = Buffer.from(makeSvg(size));
  await sharp(svg).png().toFile(join(publicDir, `icon-${size}.png`));
  console.log(`Generated icon-${size}.png`);
}

await generate(192);
await generate(512);
