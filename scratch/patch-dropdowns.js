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

const dropdownUI = `          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>OUTPUT FORMAT</label>
            <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontSize: '13px', height: '38px', outline: 'none' }}>
              <option value="mp4" style={{ color: '#ffffff', backgroundColor: '#121026' }}>MP4 (.mp4)</option>
              <option value="mov" style={{ color: '#ffffff', backgroundColor: '#121026' }}>MOV (.mov)</option>
              <option value="webm" style={{ color: '#ffffff', backgroundColor: '#121026' }}>WebM (.webm)</option>
            </select>
          </div>\n`;

targetFiles.forEach(file => {
  const fullPath = path.join(basePath, file);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Check if dropdown is already injected
  if (content.includes('value={exportFormat}')) {
    console.log(`Dropdown already exists in ${file}`);
    return;
  }

  // Find the index of the main submit button
  const buttonPattern = /<button\s+onClick=\{(handleProcess|handleMute|handleTrim|handleCompress|startRecording|startCamera|handleMuteVideo)\}/i;
  const match = content.match(buttonPattern);
  if (match) {
    const buttonIdx = match.index;
    // Find the last </div> before this button
    const lastDivIdx = content.lastIndexOf('</div>', buttonIdx);
    if (lastDivIdx !== -1) {
      content = content.slice(0, lastDivIdx) + dropdownUI + content.slice(lastDivIdx);
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Successfully injected dropdown into ${file}`);
    } else {
      console.log(`Could not find </div> before button in ${file}`);
    }
  } else {
    console.log(`Could not find action button in ${file}`);
  }
});
