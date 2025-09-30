# PWA Icons Generation

The app requires PWA icons in the following sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## Option 1: Use an Online Generator (Recommended)

1. Visit [RealFaviconGenerator](https://realfavicongenerator.net/) or [PWA Asset Generator](https://www.pwabuilder.com/)
2. Upload your logo/icon (SVG or high-resolution PNG)
3. Generate all required sizes
4. Download and place files in the `public/` directory

## Option 2: Use ImageMagick (Command Line)

If you have a source icon (e.g., `icon-source.png` or `icon-source.svg`):

```bash
# Install ImageMagick if not installed
brew install imagemagick  # macOS
apt-get install imagemagick  # Linux

# Generate all sizes
convert icon-source.png -resize 72x72 public/icon-72.png
convert icon-source.png -resize 96x96 public/icon-96.png
convert icon-source.png -resize 128x128 public/icon-128.png
convert icon-source.png -resize 144x144 public/icon-144.png
convert icon-source.png -resize 152x152 public/icon-152.png
convert icon-source.png -resize 192x192 public/icon-192.png
convert icon-source.png -resize 384x384 public/icon-384.png
convert icon-source.png -resize 512x512 public/icon-512.png
```

## Option 3: Create a Simple Icon

For testing purposes, you can create a simple colored square:

```bash
# Create simple test icons with gradients
for size in 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} \
    gradient:'#667eea'-'#764ba2' \
    -gravity center \
    -pointsize $((size/3)) \
    -fill white \
    -annotate +0+0 "SE" \
    public/icon-${size}.png
done
```

## Current Status

The manifest.json references these icon files, but they need to be generated.
The app will work without them, but won't be installable as a PWA until icons are added.

## Required Files

Once generated, ensure these files exist in `public/`:
- icon-72.png
- icon-96.png
- icon-128.png
- icon-144.png
- icon-152.png
- icon-192.png
- icon-384.png
- icon-512.png

Also create screenshots for app stores (optional but recommended):
- screenshot-mobile.png (540x720)
- screenshot-desktop.png (1280x720)