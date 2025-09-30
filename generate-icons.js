// Generate PWA icons using Canvas (node-canvas)
const fs = require('fs');

// Create SVG template for the icon
const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle with gradient -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad)"/>
  
  <!-- Speech bubble icon -->
  <g transform="translate(${size*0.25}, ${size*0.25})">
    <!-- Main bubble -->
    <rect x="${size*0.1}" y="${size*0.1}" width="${size*0.3}" height="${size*0.25}" 
          rx="${size*0.03}" fill="white" opacity="0.95"/>
    <!-- Bubble tail -->
    <polygon points="${size*0.12},${size*0.35} ${size*0.1},${size*0.4} ${size*0.15},${size*0.35}" 
             fill="white" opacity="0.95"/>
    <!-- Letter 'E' -->
    <text x="${size*0.18}" y="${size*0.27}" 
          font-family="Arial, sans-serif" 
          font-size="${size*0.12}" 
          font-weight="bold" 
          fill="#667eea" 
          text-anchor="middle">E</text>
  </g>
</svg>
`;

// Sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate SVG files
sizes.forEach(size => {
  const svg = createSVG(size);
  fs.writeFileSync(`public/icon-${size}.svg`, svg);
  console.log(`Generated icon-${size}.svg`);
});

console.log('SVG icons generated. Install sharp to convert to PNG: npm install sharp');
