# Romantic Story Website Template

A public, customizable static website template for a romantic birthday or anniversary page.
It includes a cinematic hero, timeline story cards, embedded media, and a small surprise game section.

## Demo

- https://mischar.github.io/birthday-celebration/

## Features

- Responsive single-page layout (`index.html`, `styles.css`, `script.js`)
- Scroll reveal animations and gentle section snapping
- YouTube embed section with loading state
- Short fictional story timeline you can customize
- Love note section with video support
- Interactive card game that reveals a "boarding pass" style surprise
- Optional media optimization scripts for local assets

## Project Structure

- `index.html` - Main page markup and all section content
- `styles.css` - Full visual design and responsive styles
- `script.js` - Scroll behavior, animations, and game logic
- `assets/` - Static assets (currently only `favicon.svg`)
- `scripts/optimize-images.js` - Converts local images to WebP (optional)
- `scripts/optimize-video.js` - Creates optimized video outputs (optional)
- `package.json` - npm scripts and dev dependencies

## Quick Start

1. Install dependencies:
   - `npm install`
2. Open `index.html` directly in your browser, or use a local static server.
3. Customize text/media in `index.html` and styles in `styles.css`.

## Customization Guide

### 1) Hero

Edit the hero heading/subtitle in `index.html`:

- Main title is inside `.hero h1`
- Subtitle is inside `.hero .subtitle`

### 2) Story Timeline

Each timeline chapter is a `.timeline-item` block in `index.html`.

For each chapter, customize:

- `date` label
- `h3` title
- paragraph text
- image URL (`img src`) and `alt` text

### 3) Media

- YouTube embed: update the `iframe src` in the video section.
- Love note video: update the `<source src="...">` URL in the love-note section.
- Stock images are currently external URLs (`picsum.photos`) to keep the repo lightweight.

### 4) Surprise Game

In `index.html`:

- Change card labels and emojis in `.game-container`
- Change ticket values (`PASSENGER`, route, destination, date)

In `script.js`:

- Update per-card feedback messages in `handleCardClick()`
- Update success text in `triggerSuccess()`

## Optional Media Optimization

If you switch from external URLs to local files in `assets/`:

- Optimize images:
  - `npm run optimize-images`
- Optimize video:
  - `npm run optimize-video`

Notes:

- `optimize-images.js` expects local files and can generate WebP variants.
- `optimize-video.js` requires `ffmpeg` installed and available in PATH.

## Deployment

This is a static site, so it works on:

- GitHub Pages
- Netlify
- Vercel (static output)
- Any basic web host

Before deploying:

- Replace template text with your own content
- Replace stock media with your own media/licensed links if needed
- Validate all external URLs

## Privacy Checklist For Public Repos

- Remove personal names, signatures, and private references
- Remove private routes, dates, and identifiers
- Remove or replace private photos/videos
- Avoid committing unredacted personal story files
- Re-scan repository text before publishing

## License

Use this template freely for personal projects. Add your preferred open-source license if publishing as a reusable template.
