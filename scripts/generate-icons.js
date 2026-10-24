import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

// Clean vector SVG of the exact Livingstoneedu Logo Mark
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <!-- Center group with balanced margins -->
  <g transform="translate(10, 5)">
    <!-- 3D Mortarboard Cap -->
    <!-- Diamond Top -->
    <polygon points="65,22 120,44 65,66 10,44" fill="#164CE8" />
    <polygon points="65,22 120,44 65,49 10,44" fill="#2059FF" />
    <!-- Cap Neck / Skull Band -->
    <path d="M36,54 L36,66 C36,74 94,74 94,66 L94,54 Z" fill="#0E38B5" />
    <!-- Center Button & Hanging Tassel -->
    <circle cx="65" cy="44" r="3" fill="#0E38B5" />
    <path d="M65,44 Q108,46 108,68 L108,76" stroke="#164CE8" stroke-width="3" stroke-linecap="round" fill="none" />
    <circle cx="108" cy="80" r="4.5" fill="#164CE8" />

    <!-- Left Pillar (Main L Stem) -->
    <path d="M22,72 L48,72 L48,124 L22,132 Z" fill="#164CE8" />

    <!-- Center/Right Pillar Column -->
    <path d="M60,82 C60,78 68,78 68,82 L68,122 L60,124 Z" fill="#164CE8" />
    <circle cx="64" cy="74" r="5" fill="#164CE8" />

    <!-- Adjacent Dot/Node -->
    <circle cx="82" cy="76" r="4.5" fill="#164CE8" />

    <!-- Vibrant Orange Sail / Page Curve -->
    <path d="M48,82 Q60,94 62,118 L48,122 Z" fill="#FA5C26" />

    <!-- Flowing Base Waves (Dual Waves) -->
    <path d="M22,126 Q50,114 80,128 T140,118 L140,132 Q105,128 80,146 T22,148 Z" fill="#164CE8" />
    <path d="M22,142 Q50,132 80,144 T140,134 L140,146 Q105,142 80,158 T22,158 Z" fill="#2059FF" />
  </g>
</svg>`;

// Icon with background for app icon & apple-touch-icon
function getAppIconSvg(size, padding = 20, bg = '#ffffff') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200" fill="none">
    ${bg ? `<rect width="200" height="200" rx="36" fill="${bg}" />` : ''}
    <g transform="translate(${padding}, ${padding}) scale(${(200 - padding * 2) / 200})">
      <!-- 3D Mortarboard Cap -->
      <polygon points="65,22 120,44 65,66 10,44" fill="#164CE8" />
      <polygon points="65,22 120,44 65,49 10,44" fill="#2059FF" />
      <path d="M36,54 L36,66 C36,74 94,74 94,66 L94,54 Z" fill="#0E38B5" />
      <circle cx="65" cy="44" r="3" fill="#0E38B5" />
      <path d="M65,44 Q108,46 108,68 L108,76" stroke="#164CE8" stroke-width="3" stroke-linecap="round" fill="none" />
      <circle cx="108" cy="80" r="4.5" fill="#164CE8" />

      <!-- Left Pillar -->
      <path d="M22,72 L48,72 L48,124 L22,132 Z" fill="#164CE8" />

      <!-- Center Pillar & Dots -->
      <path d="M60,82 C60,78 68,78 68,82 L68,122 L60,124 Z" fill="#164CE8" />
      <circle cx="64" cy="74" r="5" fill="#164CE8" />
      <circle cx="82" cy="76" r="4.5" fill="#164CE8" />

      <!-- Vibrant Orange Sail / Page Curve -->
      <path d="M48,82 Q60,94 62,118 L48,122 Z" fill="#FA5C26" />

      <!-- Flowing Base Waves -->
      <path d="M22,126 Q50,114 80,128 T140,118 L140,132 Q105,128 80,146 T22,148 Z" fill="#164CE8" />
      <path d="M22,142 Q50,132 80,144 T140,134 L140,146 Q105,142 80,158 T22,158 Z" fill="#2059FF" />
    </g>
  </svg>`;
}

// Full horizontal logo with wordmark
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 160" fill="none">
  <!-- Mark on Left -->
  <g transform="translate(10, 5) scale(0.95)">
    <polygon points="65,22 120,44 65,66 10,44" fill="#164CE8" />
    <polygon points="65,22 120,44 65,49 10,44" fill="#2059FF" />
    <path d="M36,54 L36,66 C36,74 94,74 94,66 L94,54 Z" fill="#0E38B5" />
    <circle cx="65" cy="44" r="3" fill="#0E38B5" />
    <path d="M65,44 Q108,46 108,68 L108,76" stroke="#164CE8" stroke-width="3" stroke-linecap="round" fill="none" />
    <circle cx="108" cy="80" r="4.5" fill="#164CE8" />

    <path d="M22,72 L48,72 L48,124 L22,132 Z" fill="#164CE8" />
    <path d="M60,82 C60,78 68,78 68,82 L68,122 L60,124 Z" fill="#164CE8" />
    <circle cx="64" cy="74" r="5" fill="#164CE8" />
    <circle cx="82" cy="76" r="4.5" fill="#164CE8" />
    <path d="M48,82 Q60,94 62,118 L48,122 Z" fill="#FA5C26" />

    <path d="M22,126 Q50,114 80,128 T140,118 L140,132 Q105,128 80,146 T22,148 Z" fill="#164CE8" />
    <path d="M22,142 Q50,132 80,144 T140,134 L140,146 Q105,142 80,158 T22,158 Z" fill="#2059FF" />
  </g>

  <!-- Wordmark Text: Livingstone in Blue, edu in Orange -->
  <text x="160" y="116" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="76" font-weight="900" letter-spacing="-1.5">
    <tspan fill="#164CE8">Livingstone</tspan><tspan fill="#FA5C26">edu</tspan>
  </text>
</svg>`;

async function main() {
  const publicDir = path.resolve('public');

  // Save SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), markSvg);
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), fullLogoSvg);

  // Render PNGs
  const renders = [
    { name: 'favicon-64.png', size: 64, padding: 8, bg: null },
    { name: 'apple-touch-icon.png', size: 180, padding: 18, bg: '#ffffff' },
    { name: 'icon-192.png', size: 192, padding: 16, bg: '#ffffff' },
    { name: 'icon-512.png', size: 512, padding: 36, bg: '#ffffff' },
    { name: 'icon-maskable-192.png', size: 192, padding: 28, bg: '#ffffff' },
    { name: 'icon-maskable-512.png', size: 512, padding: 64, bg: '#ffffff' },
  ];

  for (const item of renders) {
    const svgStr = getAppIconSvg(item.size, item.padding, item.bg);
    const resvg = new Resvg(svgStr, {
      fitTo: { mode: 'width', value: item.size },
    });
    const pngData = resvg.render().asPng();
    fs.writeFileSync(path.join(publicDir, item.name), pngData);
    console.log(`Rendered ${item.name} (${item.size}x${item.size})`);
  }

  // Render logo.png
  const logoResvg = new Resvg(fullLogoSvg, {
    fitTo: { mode: 'width', value: 620 },
  });
  fs.writeFileSync(path.join(publicDir, 'logo.png'), logoResvg.render().asPng());
  console.log('Rendered logo.png');
}

main().catch(console.error);
