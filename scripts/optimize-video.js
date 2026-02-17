/**
 * Video optimization script
 * Run: node scripts/optimize-video.js [video.mp4]
 *
 * Creates optimized MP4 (H.264) and WebM (VP9) versions.
 * Requires: ffmpeg in PATH
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const VIDEO_FILE = process.argv[2] || 'story-video.mp4';
const inputPath = path.join(ASSETS_DIR, VIDEO_FILE);

if (!fs.existsSync(inputPath)) {
  console.error(`Video not found: ${inputPath}`);
  process.exit(1);
}

const baseName = path.basename(VIDEO_FILE, path.extname(VIDEO_FILE));
const optimizedMp4 = path.join(ASSETS_DIR, `${baseName}_optimized.mp4`);
const webmPath = path.join(ASSETS_DIR, `${baseName}.webm`);

console.log(`Optimizing ${VIDEO_FILE}...\n`);

try {
  // 1. Create optimized MP4 (H.264 CRF 28, faststart for web)
  console.log('Creating optimized MP4...');
  execSync(
    `ffmpeg -i "${inputPath}" -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 96k -movflags +faststart -y "${optimizedMp4}"`,
    { stdio: 'inherit' }
  );

  // 2. Create WebM (VP9)
  console.log('\nCreating WebM...');
  execSync(
    `ffmpeg -i "${inputPath}" -c:v libvpx-vp9 -crf 35 -b:v 0 -c:a libopus -b:a 96k -y "${webmPath}"`,
    { stdio: 'inherit' }
  );

  // 3. Replace original with optimized, move original to archive
  const archiveDir = path.join(ASSETS_DIR, 'archive');
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
  const originalArchive = path.join(archiveDir, `${baseName}_original.mp4`);

  fs.renameSync(inputPath, originalArchive);
  fs.renameSync(optimizedMp4, inputPath);

  console.log(`\nDone! Original saved to archive/${baseName}_original.mp4`);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
