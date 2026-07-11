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

const helperCode = `const getSupportedMimeType = (format) => {
  const formats = {
    mp4: [
      'video/mp4;codecs=h264,aac',
      'video/mp4;codecs=h264',
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=h264'
    ],
    mov: [
      'video/quicktime;codecs=h264',
      'video/quicktime;codecs=avc1',
      'video/quicktime',
      'video/mp4'
    ],
    webm: [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ]
  };
  const list = formats[format] || [];
  for (const mime of list) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return 'video/webm';
};\n\n`;

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
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping non-existent file: ${file}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. Inject helper if missing
  if (!content.includes('getSupportedMimeType')) {
    const componentDefStr = 'export default function';
    const index = content.indexOf(componentDefStr);
    if (index !== -1) {
      content = content.slice(0, index) + helperCode + content.slice(index);
      console.log(`- Injected getSupportedMimeType into ${file}`);
    }
  }

  // 2. Inject exportFormat state
  if (!content.includes('exportFormat')) {
    let searchHook = '';
    if (content.includes('const [file, setFile] = useState')) {
      searchHook = 'const [file, setFile] = useState';
    } else if (content.includes('const [recording, setRecording] = useState')) {
      searchHook = 'const [recording, setRecording] = useState';
    } else if (content.includes('const [active, setActive] = useState')) {
      searchHook = 'const [active, setActive] = useState';
    }

    if (searchHook) {
      const hookIndex = content.indexOf(searchHook);
      const nextNewLineIndex = content.indexOf('\n', hookIndex);
      if (nextNewLineIndex !== -1) {
        content = content.slice(0, nextNewLineIndex + 1) + "  const [exportFormat, setExportFormat] = useState('mp4');\n" + content.slice(nextNewLineIndex + 1);
        console.log(`- Injected exportFormat state into ${file}`);
      }
    }
  }

  // 3. Replace MIME recorder logic safely (restricted to single-line [^\n] matching)
  content = content.replace(/const\s+mime\s*=\s*MediaRecorder\.isTypeSupported\([^\n]+?\);?/g, 
    'const mime = getSupportedMimeType(exportFormat);');

  // Special multi-line check for video-compress
  if (file === 'video-compress/page.js') {
    content = content.replace(/const\s+mimeType\s*=\s*MediaRecorder\.isTypeSupported\([\s\S]+?;\s*/, 
      'const mimeType = getSupportedMimeType(exportFormat);\n      ');
  }

  // Replace Blob instantiation safely
  content = content.replace(/new\s+Blob\(\s*chunks\s*,\s*\{\s*type:\s*mime\s*\}\s*\)/g, 
    "new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime })");
  content = content.replace(/new\s+Blob\(\s*chunks\s*,\s*\{\s*type:\s*mimeType\s*\}\s*\)/g, 
    "new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mimeType })");

  // 4. Update resulting filename extensions
  content = content.replace(/replace\(\/\\\.\s*\[\^\.\]\+\s*\/\s*,\s*(['"\`])(.*?)\.webm\1\)/g, 
    "replace(/\\.[^.]+$/, $1$2.${exportFormat}$1)");

  // Fix button labels
  content = content.replace(/\.webm\)/g, ".${exportFormat})");
  content = content.replace(/\.webm<\/button>/g, ".${exportFormat}</button>");

  // 5. Inject Dropdown UI before the action button
  if (!content.includes('value={exportFormat}')) {
    const buttonPattern = /<button\s+onClick=\{(handleProcess|handleMute|handleTrim|handleCompress|startRecording|startCamera|handleMuteVideo)\}/i;
    const match = content.match(buttonPattern);
    if (match) {
      const buttonIdx = match.index;
      const lastDivIdx = content.lastIndexOf('</div>', buttonIdx);
      if (lastDivIdx !== -1) {
        content = content.slice(0, lastDivIdx) + dropdownUI + content.slice(lastDivIdx);
        console.log(`- Injected dropdown UI into ${file}`);
      }
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');
});

console.log('All patches applied successfully!');
