// Renders PWA icons, favicon and Android source icons from /assets/icon.svg.
import { access, mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const icon = new URL("../assets/icon.svg", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const out = (p) => new URL(`../${p}`, import.meta.url).pathname.replace(/^\/(\w:)/, "$1");

/** Single PNG packed as a modern ICO (PNG-in-ICO). */
function pngToIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0); // 0 ⇒ 256; we use 32 below
  entry.writeUInt8(32, 0);
  entry.writeUInt8(32, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

await mkdir(out("public/icons"), { recursive: true });

for (const size of [192, 512]) {
  await sharp(icon).resize(size, size).png().toFile(out(`public/icons/icon-${size}.png`));
}
// Maskable: shrink the plate into the 80% safe zone.
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#0f110e" } })
  .composite([{ input: await sharp(icon).resize(410, 410).png().toBuffer(), gravity: "center" }])
  .png()
  .toFile(out("public/icons/maskable-512.png"));
await sharp(icon).resize(180, 180).png().toFile(out("public/apple-touch-icon.png"));
await sharp(icon).resize(48, 48).png().toFile(out("src/app/icon.png"));
const favPng = await sharp(icon).resize(32, 32).png().toBuffer();
await writeFile(out("public/favicon.ico"), pngToIco(favPng));
await writeFile(out("src/app/favicon.ico"), pngToIco(favPng));
// OG image: keep hand-authored public/og.jpg (do not overwrite from SVG).
const ogJpg = out("public/og.jpg");
try {
  await access(ogJpg);
} catch {
  const ogSvg = new URL("../assets/og.svg", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
  await sharp(ogSvg).resize(1200, 630).jpeg({ quality: 88, mozjpeg: true }).toFile(ogJpg);
  console.warn("public/og.jpg missing — generated from assets/og.svg (replace with your artwork)");
}

// Sources for `npx @capacitor/assets generate`.
await sharp(icon).resize(1024, 1024).png().toFile(out("assets/icon-only.png"));
await sharp(icon)
  .resize(1024, 1024)
  .png()
  .toFile(out("assets/icon-foreground.png"));
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: "#0f110e" } })
  .png()
  .toFile(out("assets/icon-background.png"));
await sharp({ create: { width: 2732, height: 2732, channels: 4, background: "#0f110e" } })
  .composite([{ input: await sharp(icon).resize(560, 560).png().toBuffer(), gravity: "center" }])
  .png()
  .toFile(out("assets/splash.png"));
await sharp(out("assets/splash.png")).toFile(out("assets/splash-dark.png"));

console.log("icons written");
