import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * Builds every web-facing brand asset from the supplied circular logo.
 *
 * Usage: node scripts/build-logo-assets.mjs [path-to-logo.png]
 *
 * The source artwork has its transparency checkerboard flattened into the
 * pixels, so the badge is rebuilt from the circular emblem: the square crop is
 * masked to the gold ring and saved with a genuine transparent surround.
 */

const source = path.resolve(
  process.argv[2] ?? "K Gems Sapphire Logo.png",
);

if (!fs.existsSync(source)) {
  throw new Error(`Logo source not found: ${source}`);
}

const publicDir = path.resolve("public/brand");
fs.mkdirSync(publicDir, { recursive: true });

// Circle measured from the 1491 × 1055 source artwork.
const crop = { left: 212, top: 0, width: 1056, height: 1055 };
const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${crop.width}" height="${crop.height}">
    <ellipse cx="527.5" cy="524.5" rx="527" ry="521" fill="#ffffff"/>
  </svg>`,
);

const maskedBadge = await sharp(source)
  .extract(crop)
  .ensureAlpha()
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();

const badgePath = path.join(publicDir, "k-gems-badge.webp");
const badge = await sharp(maskedBadge)
  .trim()
  .resize(768, 768, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .webp({ quality: 92, alphaQuality: 100, effort: 6 })
  .toBuffer();
fs.writeFileSync(badgePath, badge);

// Browser favicon (transparent circular badge).
await sharp(badge)
  .resize(512, 512, { fit: "contain" })
  .png({ compressionLevel: 9, palette: true, colours: 256 })
  .toFile(path.resolve("app/icon.png"));

// Apple touch icon must be opaque; sit the badge on the brand navy.
const appleBadge = await sharp(badge)
  .resize(152, 152, { fit: "contain" })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 180,
    height: 180,
    channels: 3,
    background: "#071525",
  },
})
  .composite([{ input: appleBadge, gravity: "center" }])
  .png({ compressionLevel: 9, palette: true, colours: 256 })
  .toFile(path.resolve("app/apple-icon.png"));

// Social sharing card: typographic left panel, logo seal on the right.
const socialBackground = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <radialGradient id="bg" cx="72%" cy="42%" r="82%">
        <stop offset="0%" stop-color="#132b4e"/>
        <stop offset="55%" stop-color="#081728"/>
        <stop offset="100%" stop-color="#040c15"/>
      </radialGradient>
      <radialGradient id="halo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#2c66d8" stop-opacity="0.28"/>
        <stop offset="70%" stop-color="#2c66d8" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="#071525" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="#c9a96e" stroke-opacity="0.28"/>
    <rect x="44" y="44" width="1112" height="542" fill="none" stroke="#c9a96e" stroke-opacity="0.15"/>
    <g opacity="0.09" stroke="#f7f6f2">
      <line x1="100" y1="0" x2="100" y2="630"/><line x1="300" y1="0" x2="300" y2="630"/>
      <line x1="500" y1="0" x2="500" y2="630"/><line x1="700" y1="0" x2="700" y2="630"/>
      <line x1="900" y1="0" x2="900" y2="630"/><line x1="1100" y1="0" x2="1100" y2="630"/>
    </g>
    <circle cx="880" cy="315" r="282" fill="url(#halo)"/>
    <circle cx="880" cy="315" r="268" fill="none" stroke="#c9a96e" stroke-opacity="0.22"/>
    <circle cx="880" cy="315" r="320" fill="none" stroke="#c9a96e" stroke-opacity="0.1"/>
    <g font-family="'Cormorant Garamond', Georgia, serif" fill="#f7f6f2">
      <text x="96" y="145" font-family="Inter, Arial, sans-serif" font-size="23" letter-spacing="9" fill="#c9a96e">K GEMS INTERNATIONAL</text>
      <text x="96" y="292" font-size="82" letter-spacing="-1">Rare Beauty.</text>
      <text x="96" y="380" font-size="82" letter-spacing="-1" font-style="italic" fill="#e2c99a">Lasting Value.</text>
    </g>
    <g font-family="Inter, Arial, sans-serif" fill="#f7f6f2">
      <text x="96" y="452" font-size="15" letter-spacing="3.4" opacity="0.56">FROM EARTH TO ELEGANCE · FINE GEMSTONES</text>
      <text x="96" y="532" font-size="13" letter-spacing="2.4" opacity="0.34">COLOMBO · ODDAMAVADI</text>
      <text x="96" y="560" font-size="13" letter-spacing="2.4" opacity="0.34">+94 77 737 8592</text>
    </g>
    <g stroke="#c9a96e" stroke-opacity="0.5">
      <line x1="96" y1="480" x2="360" y2="480"/>
    </g>
  </svg>`,
);

const socialBadge = await sharp(badge)
  .resize(430, 430, { fit: "contain" })
  .png()
  .toBuffer();

await sharp(socialBackground)
  .composite([{ input: socialBadge, left: 700, top: 100 }])
  .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
  .toFile(path.resolve("public/og.jpg"));

console.log("logo assets written:");
console.log("  public/brand/k-gems-badge.webp");
console.log("  app/icon.png");
console.log("  app/apple-icon.png");
console.log("  public/og.jpg");
