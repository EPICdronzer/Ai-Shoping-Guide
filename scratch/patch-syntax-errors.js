const fs = require('fs');
const path = require('path');

const targetFiles = [
  'brightness-contrast/page.js',
  'add-image-watermark/page.js',
  'add-text-to-video/page.js',
  'crop-video/page.js',
  'loop-video/page.js',
  'mute-video/page.js',
  'resize-video/page.js',
  'reverse-video/page.js',
  'rotate-video/page.js',
  'screen-recorder/page.js',
  'slow-motion-video/page.js',
  'speed-up-video/page.js',
  'video-compress/page.js',
  'video-filters/page.js',
  'video-trimmer/page.js',
  'webcam-recorder/page.js'
];

const basePath = path.join(__dirname, '..', 'app', 'tools');

targetFiles.forEach(file => {
  const fullPath = path.join(basePath, file);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Fix the floating ternary syntax error
  const ternaryPattern = /const\s+mime\s*=\s*getSupportedMimeType\(exportFormat\);\s*\?\s*[^;]+;/g;
  if (content.match(ternaryPattern)) {
    content = content.replace(ternaryPattern, 'const mime = getSupportedMimeType(exportFormat);');
    console.log(`Fixed ternary syntax error in ${file}`);
  }

  fs.writeFileSync(fullPath, content, 'utf8');
});

console.log('All syntax errors fixed!');
