import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(__dirname, '../public/allbirds-category-swatch.png');
const crops = [
  { name: 'allbirds-crop-top-left.png', left: 0, top: 0 },
  { name: 'allbirds-crop-top-right.png', left: 256, top: 0 },
  { name: 'allbirds-crop-bottom-left.png', left: 0, top: 256 },
  { name: 'allbirds-crop-bottom-right.png', left: 256, top: 256 },
];

async function run() {
  const absoluteInput = path.resolve(inputPath);
  if (!fs.existsSync(absoluteInput)) {
    throw new Error(`Input file not found at ${absoluteInput}`);
  }

  for (const crop of crops) {
    const outputPath = path.resolve(__dirname, '../public', crop.name);
    await sharp(absoluteInput)
      .extract({ left: crop.left, top: crop.top, width: 256, height: 256 })
      .toFile(outputPath);
    console.log(`Cropped: ${outputPath}`);
  }
}

run().catch(console.error);
