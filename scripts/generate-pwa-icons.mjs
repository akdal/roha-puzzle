import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svgPath = join(publicDir, 'favicon.svg');
const svgBuffer = readFileSync(svgPath);

const icons = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
];

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  for (const icon of icons) {
    const outputPath = join(publicDir, icon.name);
    await sharp(svgBuffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);
    console.log(`Created: ${icon.name} (${icon.size}x${icon.size})`);
  }

  console.log('\nDone! Icons saved to public/');
}

generateIcons().catch(console.error);
