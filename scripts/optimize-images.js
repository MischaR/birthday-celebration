/**
 * Image optimization script
 * Run: npm run optimize-images
 *
 * 1. Creates WebP versions of all JPG/PNG images in assets
 * 2. Copies fallback.png from archive for fallback, creates fallback.webp
 * 3. Moves original JPG/PNG to archive/originals (keeps WebP in assets)
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const ARCHIVE_DIR = path.join(ASSETS_DIR, 'archive');
const ORIGINALS_DIR = path.join(ARCHIVE_DIR, 'originals');
const QUALITY = { webp: 82 };
const MAX_WIDTH = 1200;

// Template image names used in index.html (base names for WebP)
const USED_IMAGES = [
  'story-01', 'story-02', 'story-03', 'story-04', 'story-05', 'story-06', 'fallback'
];

async function optimizeImages() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('Run: npm install sharp');
    process.exit(1);
  }

  if (!fs.existsSync(ORIGINALS_DIR)) {
    fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
  }

  // Process fallback.png from archive
  const fallbackSrc = path.join(ARCHIVE_DIR, 'fallback.png');
  if (fs.existsSync(fallbackSrc)) {
    try {
      await sharp(fallbackSrc)
        .webp({ quality: QUALITY.webp })
        .toFile(path.join(ASSETS_DIR, 'fallback.webp'));
      fs.copyFileSync(fallbackSrc, path.join(ASSETS_DIR, 'fallback.png'));
      console.log('  ✓ fallback.png → fallback.webp (from archive)');
    } catch (err) {
      console.error('  ✗ fallback.png:', err.message);
    }
  }

  const files = fs.readdirSync(ASSETS_DIR).filter(f => {
    const fullPath = path.join(ASSETS_DIR, f);
    return fs.statSync(fullPath).isFile() &&
      /\.(jpg|jpeg|png)$/i.test(f) &&
      !f.toLowerCase().includes('favicon') &&
      !f.toLowerCase().startsWith('fallback.'); // Keep fallback.png in assets for fallback
  });

  console.log(`\nConverting ${files.length} images to WebP...\n`);

  for (const file of files) {
    const inputPath = path.join(ASSETS_DIR, file);
    const baseName = file.replace(/\.[^.]+$/i, '');
    const webpPath = path.join(ASSETS_DIR, `${baseName}.webp`);

    try {
      let pipeline = sharp(inputPath);
      const meta = await pipeline.metadata();
      if (meta.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
      }

      await pipeline.clone().webp({ quality: QUALITY.webp }).toFile(webpPath);
      console.log(`  ✓ ${file} → ${baseName}.webp`);

      // Move original to archive/originals (used as img fallback in <picture>)
      const destPath = path.join(ORIGINALS_DIR, file);
      fs.renameSync(inputPath, destPath);
      console.log(`    → archive/originals/`);
    } catch (err) {
      console.error(`  ✗ ${file}:`, err.message);
    }
  }

  console.log('\nDone! HTML updated to use WebP with fallbacks.');
}

optimizeImages().catch(console.error);
