// Renders PWA icons, Android source icons and the OG image from the SVGs in /assets.
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const icon = new URL("../assets/icon.svg", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const og = new URL("../assets/og.svg", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const out = (p) => new URL(`../${p}`, import.meta.url).pathname.replace(/^\/(\w:)/, "$1");

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
await sharp(og).png().toFile(out("public/og.png"));

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
