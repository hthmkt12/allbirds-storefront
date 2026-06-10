import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');
const optimizedDir = path.join(publicDir, 'optimized');

if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

// Active fallback images
const imagesToOptimize = [
  'allbirds-crop-top-left.png',
  'allbirds-crop-top-right.png',
  'allbirds-crop-bottom-left.png',
  'allbirds-crop-bottom-right.png',
  'allbirds-hero-linen.png',
  'allbirds-lifestyle-hero.png',
  'allbirds-material-texture.png',
  'allbirds-mvp-lifestyle.png',
  'allbirds-travel-promo.png',
];

const widths = [480, 768, 1024, 1280, 1536, 1920];

async function optimize() {
  for (const imageName of imagesToOptimize) {
    const inputPath = path.join(publicDir, imageName);
    if (!fs.existsSync(inputPath)) {
      console.warn(`File not found: ${inputPath}, skipping`);
      continue;
    }

    const baseName = path.parse(imageName).name;
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width || 1920;

    for (const width of widths) {
      // Standard responsive image generation
      const targetWidth = Math.min(width, originalWidth);
      
      const webpOutName = `${baseName}-${width}w.webp`;
      const webpOutPath = path.join(optimizedDir, webpOutName);
      await sharp(inputPath)
        .resize({ width: targetWidth })
        .webp({ quality: 80 })
        .toFile(webpOutPath);
      console.log(`Generated WebP: ${webpOutPath}`);

      const avifOutName = `${baseName}-${width}w.avif`;
      const avifOutPath = path.join(optimizedDir, avifOutName);
      await sharp(inputPath)
        .resize({ width: targetWidth })
        .avif({ quality: 75 })
        .toFile(avifOutPath);
      console.log(`Generated AVIF: ${avifOutPath}`);
    }
  }
  console.log('Static image optimization completed!');
}

optimize().catch(console.error);
