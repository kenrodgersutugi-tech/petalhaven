const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// A clean, minimal stylized single pink rose design
// Beautiful at 16px favicon as well as 512px app icon
const roseSvgStandard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="roseMain" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7597" />
      <stop offset="60%" stop-color="#E75480" />
      <stop offset="100%" stop-color="#C2255C" />
    </linearGradient>
    <linearGradient id="roseLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFB6C1" />
      <stop offset="100%" stop-color="#FF85A1" />
    </linearGradient>
    <linearGradient id="roseDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D6336C" />
      <stop offset="100%" stop-color="#831843" />
    </linearGradient>
    <linearGradient id="leafGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ADE80" />
      <stop offset="100%" stop-color="#16A34A" />
    </linearGradient>
    <linearGradient id="leafGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86EFAC" />
      <stop offset="100%" stop-color="#22C55E" />
    </linearGradient>
  </defs>

  <!-- Stylized leaf accents at base -->
  <path d="M 195 350 C 130 380 95 440 120 470 C 155 485 220 455 235 390 Z" fill="url(#leafGradLeft)" />
  <path d="M 317 350 C 382 380 417 440 392 470 C 357 485 292 455 277 390 Z" fill="url(#leafGradRight)" />

  <!-- Outer Layer Petals (Stylized blooming rose silhouette) -->
  <path d="M 256 60 C 360 60 450 140 450 250 C 450 360 360 440 256 440 C 152 440 62 360 62 250 C 62 140 152 60 256 60 Z" fill="url(#roseMain)" />

  <!-- Outer Petal Overlap Flaps -->
  <path d="M 100 240 C 100 135 190 85 256 85 C 322 85 412 135 412 240 C 412 340 335 415 256 415 C 177 415 100 340 100 240 Z" fill="#D6336C" />

  <!-- Left Sweeping Petal -->
  <path d="M 115 225 C 115 320 180 395 256 395 C 195 375 145 315 145 235 C 145 160 200 115 256 105 C 170 115 115 160 115 225 Z" fill="url(#roseLight)" />

  <!-- Right Sweeping Petal -->
  <path d="M 397 225 C 397 320 332 395 256 395 C 317 375 367 315 367 235 C 367 160 312 115 256 105 C 342 115 397 160 397 225 Z" fill="url(#roseDark)" />

  <!-- Middle Cup Petal -->
  <path d="M 160 215 C 160 295 205 355 256 355 C 307 355 352 295 352 215 C 352 165 310 130 256 130 C 202 130 160 165 160 215 Z" fill="#E75480" />

  <!-- Secondary Inner Cup -->
  <path d="M 185 220 C 185 285 215 330 256 330 C 297 330 327 285 327 220 C 327 175 295 150 256 150 C 217 150 185 175 185 220 Z" fill="#FF8DA9" />

  <!-- Rose Core / Swirling Heart Petals -->
  <path d="M 210 220 C 210 265 230 295 256 295 C 282 295 302 265 302 220 C 302 185 280 168 256 168 C 232 168 210 185 210 220 Z" fill="#831843" />

  <path d="M 225 218 C 225 250 240 275 256 275 C 272 275 287 250 287 218 C 287 195 272 182 256 182 C 240 182 225 195 225 218 Z" fill="#FFB6C1" />

  <!-- Central Bud Swirl -->
  <ellipse cx="256" cy="225" rx="15" ry="20" fill="#E75480" />
  <circle cx="256" cy="223" r="8" fill="#FFF0F3" />
</svg>`;

// Maskable icon with solid white background and 80% safe zone padding
const roseSvgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mRoseMain" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7597" />
      <stop offset="60%" stop-color="#E75480" />
      <stop offset="100%" stop-color="#C2255C" />
    </linearGradient>
    <linearGradient id="mRoseLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFB6C1" />
      <stop offset="100%" stop-color="#FF85A1" />
    </linearGradient>
    <linearGradient id="mRoseDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D6336C" />
      <stop offset="100%" stop-color="#831843" />
    </linearGradient>
    <linearGradient id="mLeafGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ADE80" />
      <stop offset="100%" stop-color="#16A34A" />
    </linearGradient>
    <linearGradient id="mLeafGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86EFAC" />
      <stop offset="100%" stop-color="#22C55E" />
    </linearGradient>
  </defs>

  <!-- Solid white background filling 100% canvas for maskable specs -->
  <rect width="512" height="512" fill="#ffffff" />
  
  <!-- Subtle circular brand soft background in safe zone -->
  <circle cx="256" cy="256" r="195" fill="#FFF5F7" />

  <!-- Rose graphic scaled and centered within the safe 80% circle (0.78 scale) -->
  <g transform="translate(56, 56) scale(0.78)">
    <path d="M 195 350 C 130 380 95 440 120 470 C 155 485 220 455 235 390 Z" fill="url(#mLeafGradLeft)" />
    <path d="M 317 350 C 382 380 417 440 392 470 C 357 485 292 455 277 390 Z" fill="url(#mLeafGradRight)" />

    <path d="M 256 60 C 360 60 450 140 450 250 C 450 360 360 440 256 440 C 152 440 62 360 62 250 C 62 140 152 60 256 60 Z" fill="url(#mRoseMain)" />

    <path d="M 100 240 C 100 135 190 85 256 85 C 322 85 412 135 412 240 C 412 340 335 415 256 415 C 177 415 100 340 100 240 Z" fill="#D6336C" />

    <path d="M 115 225 C 115 320 180 395 256 395 C 195 375 145 315 145 235 C 145 160 200 115 256 105 C 170 115 115 160 115 225 Z" fill="url(#mRoseLight)" />

    <path d="M 397 225 C 397 320 332 395 256 395 C 317 375 367 315 367 235 C 367 160 312 115 256 105 C 342 115 397 160 397 225 Z" fill="url(#mRoseDark)" />

    <path d="M 160 215 C 160 295 205 355 256 355 C 307 355 352 295 352 215 C 352 165 310 130 256 130 C 202 130 160 165 160 215 Z" fill="#E75480" />

    <path d="M 185 220 C 185 285 215 330 256 330 C 297 330 327 285 327 220 C 327 175 295 150 256 150 C 217 150 185 175 185 220 Z" fill="#FF8DA9" />

    <path d="M 210 220 C 210 265 230 295 256 295 C 282 295 302 265 302 220 C 302 185 280 168 256 168 C 232 168 210 185 210 220 Z" fill="#831843" />

    <path d="M 225 218 C 225 250 240 275 256 275 C 272 275 287 250 287 218 C 287 195 272 182 256 182 C 240 182 225 195 225 218 Z" fill="#FFB6C1" />

    <ellipse cx="256" cy="225" rx="15" ry="20" fill="#E75480" />
    <circle cx="256" cy="223" r="8" fill="#FFF0F3" />
  </g>
</svg>`;

// Apple Touch Icon with solid background (white / soft rose #FFF5F7)
const roseSvgApple = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" fill="#ffffff" />
  <circle cx="90" cy="90" r="82" fill="#FFF5F7" />
  <g transform="translate(18, 18) scale(0.28125)">
    <!-- Rose design -->
    <path d="M 195 350 C 130 380 95 440 120 470 C 155 485 220 455 235 390 Z" fill="#16A34A" />
    <path d="M 317 350 C 382 380 417 440 392 470 C 357 485 292 455 277 390 Z" fill="#22C55E" />
    <path d="M 256 60 C 360 60 450 140 450 250 C 450 360 360 440 256 440 C 152 440 62 360 62 250 C 62 140 152 60 256 60 Z" fill="#E75480" />
    <path d="M 100 240 C 100 135 190 85 256 85 C 322 85 412 135 412 240 C 412 340 335 415 256 415 C 177 415 100 340 100 240 Z" fill="#D6336C" />
    <path d="M 115 225 C 115 320 180 395 256 395 C 195 375 145 315 145 235 C 145 160 200 115 256 105 C 170 115 115 160 115 225 Z" fill="#FFB6C1" />
    <path d="M 397 225 C 397 320 332 395 256 395 C 317 375 367 315 367 235 C 367 160 312 115 256 105 C 342 115 397 160 397 225 Z" fill="#831843" />
    <path d="M 160 215 C 160 295 205 355 256 355 C 307 355 352 295 352 215 C 352 165 310 130 256 130 C 202 130 160 165 160 215 Z" fill="#E75480" />
    <path d="M 185 220 C 185 285 215 330 256 330 C 297 330 327 285 327 220 C 327 175 295 150 256 150 C 217 150 185 175 185 220 Z" fill="#FF8DA9" />
    <path d="M 210 220 C 210 265 230 295 256 295 C 282 295 302 265 302 220 C 302 185 280 168 256 168 C 232 168 210 185 210 220 Z" fill="#831843" />
    <path d="M 225 218 C 225 250 240 275 256 275 C 272 275 287 250 287 218 C 287 195 272 182 256 182 C 240 182 225 195 225 218 Z" fill="#FFB6C1" />
    <ellipse cx="256" cy="225" rx="15" ry="20" fill="#E75480" />
    <circle cx="256" cy="223" r="8" fill="#FFF0F3" />
  </g>
</svg>`;

async function generate() {
  console.log('Generating PWA icons with sharp...');

  const stdBuffer = Buffer.from(roseSvgStandard);
  const maskBuffer = Buffer.from(roseSvgMaskable);
  const appleBuffer = Buffer.from(roseSvgApple);

  // 1. icon-512x512.png
  const p512 = await sharp(stdBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), p512);
  fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), p512);
  console.log('✓ 512x512 icon generated');

  // 2. icon-192x192.png
  const p192 = await sharp(stdBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), p192);
  fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), p192);
  console.log('✓ 192x192 icon generated');

  // 3. icon-maskable-512x512.png
  const pMask512 = await sharp(maskBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-maskable-512x512.png'), pMask512);
  fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.png'), pMask512);
  console.log('✓ 512x512 maskable icon generated');

  // 4. apple-touch-icon.png (180x180)
  const pApple = await sharp(appleBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pApple);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon-precomposed.png'), pApple);
  fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), pApple);
  console.log('✓ apple-touch-icon.png generated');

  // 5. Favicon sizes: 48, 32, 16
  const p48 = await sharp(stdBuffer).resize(48, 48).png().toBuffer();
  const p32 = await sharp(stdBuffer).resize(32, 32).png().toBuffer();
  const p16 = await sharp(stdBuffer).resize(16, 16).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), p48);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), p32);
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), p16);

  // Convert to multi-resolution favicon.ico via ImageMagick convert
  execSync(`convert "${path.join(publicDir, 'favicon-48x48.png')}" "${path.join(publicDir, 'favicon-32x32.png')}" "${path.join(publicDir, 'favicon-16x16.png')}" "${path.join(publicDir, 'favicon.ico')}"`);
  console.log('✓ favicon.ico generated (16, 32, 48)');

  // Save the SVG icon as well
  fs.writeFileSync(path.join(publicDir, 'rose-icon.svg'), roseSvgStandard);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), roseSvgStandard);
  console.log('✓ SVG icons saved to public/');
}

generate().catch(err => {
  console.error('Fatal error generating icons:', err);
  process.exit(1);
});
