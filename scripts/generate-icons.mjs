// Generates LIVINGSTONEEDU PWA icons (pure Node, no deps).
// Usage: node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

// ---------- minimal PNG encoder ----------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter: none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- icon artwork (unit space 0..1) ----------
const BG_TOP = [59, 130, 246]; // #3B82F6
const BG_BOTTOM = [99, 102, 241]; // #6366F1
const GLYPH = [255, 255, 255];

function outsideRoundedRect(x, y, cx, cy, hw, hh, r) {
  const dx = Math.max(Math.abs(x - cx) - hw + r, 0);
  const dy = Math.max(Math.abs(y - cy) - hh + r, 0);
  return dx * dx + dy * dy > r * r;
}

function inDiamond(x, y, cx, cy, hw, hh) {
  return Math.abs((x - cx) / hw) + Math.abs((y - cy) / hh) <= 1;
}

function inRoundedRect(x, y, cx, cy, hw, hh, r) {
  return !outsideRoundedRect(x, y, cx, cy, hw, hh, r);
}

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

// Graduation-cap glyph (white) + indigo gradient background.
// If cornerRadius > 0 the outer corners are transparent (rounded app icon),
// otherwise the background is full-bleed (maskable / iOS).
function isGlyph(x, y) {
  // mortarboard diamond
  if (inDiamond(x, y, 0.5, 0.5, 0.3, 0.34)) return true;
  // center button
  if (inCircle(x, y, 0.5, 0.5, 0.07)) return true;
  // skull/head beneath the board
  if (inRoundedRect(x, y, 0.5, 0.895, 0.17, 0.075, 0.07)) return true;
  // tassel drop at the corner
  if (inCircle(x, y, 0.81, 0.38, 0.03)) return true;
  return false;
}

function renderIcon(size, cornerRadius, glyphScale = 1, bgScale = 1) {
  const SS = 4; // supersampling factor for anti-aliasing
  const rgba = Buffer.alloc(size * size * 4);
  const [gt, gb] = [BG_TOP, BG_BOTTOM];

  const map = (v) => 0.5 + (v - 0.5) * glyphScale;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let white = 0;
      let samples = 0;
      let bgR = 0;
      let bgG = 0;
      let bgB = 0;

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const ux = (px + (sx + 0.5) / SS) / size;
          const uy = (py + (sy + 0.5) / SS) / size;

          // outer rounded-corner clipping (regular icons only)
          if (cornerRadius > 0 && outsideRoundedRect(ux, uy, 0.5, 0.5, 0.5, 0.5, cornerRadius)) {
            continue;
          }
          samples++;

          const t = Math.min(Math.max((uy - 0.5) * bgScale + 0.5, 0), 1);
          const gx = map(ux);
          const gy = map(uy);
          if (isGlyph(gx, gy)) white++;

          bgR += gt[0] + (gb[0] - gt[0]) * t;
          bgG += gt[1] + (gb[1] - gt[1]) * t;
          bgB += gt[2] + (gb[2] - gt[2]) * t;
        }
      }

      const idx = (py * size + px) * 4;
      if (samples === 0) {
        rgba[idx + 3] = 0; // fully transparent
        continue;
      }
      const cov = white / samples;
      rgba[idx + 0] = Math.round((bgR / samples) * (1 - cov) + GLYPH[0] * cov);
      rgba[idx + 1] = Math.round((bgG / samples) * (1 - cov) + GLYPH[1] * cov);
      rgba[idx + 2] = Math.round((bgB / samples) * (1 - cov) + GLYPH[2] * cov);
      rgba[idx + 3] = 255;
    }
  }
  return encodePNG(size, size, rgba);
}

// ---------- output ----------
mkdirSync(OUT_DIR, { recursive: true });
const CORNER = 0.185; // ~19% corner radius for rounded app icons
const files = [
  ["icon-512.png", renderIcon(512, CORNER)],
  ["icon-192.png", renderIcon(192, CORNER)],
  ["icon-maskable-512.png", renderIcon(512, 0, 0.72, 1)],
  ["icon-maskable-192.png", renderIcon(192, 0, 0.72, 1)],
  ["apple-touch-icon.png", renderIcon(180, 0, 0.66, 1)],
  ["favicon-64.png", renderIcon(64, CORNER)],
];

for (const [name, buf] of files) {
  writeFileSync(join(OUT_DIR, name), buf);
  console.log(`✓ ${name} (${buf.length} bytes)`);
}
