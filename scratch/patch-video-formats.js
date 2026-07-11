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

  // 3. Replace MIME recorder logic
  // Match standard MediaRecorder.isTypeSupported pattern for "mime"
  content = content.replace(/const\s+mime\s*=\s*MediaRecorder\.isTypeSupported\([\s\S]+?\)\s*;\s*/g, 'const mime = getSupportedMimeType(exportFormat);\n      ');
  content = content.replace(/const\s+mime\s*=\s*MediaRecorder\.isTypeSupported\([\s\S]+?\)\s*\?\s*['"]video[\s\S]+?\n/g, 'const mime = getSupportedMimeType(exportFormat);\n');
  
  // Target special cases (like video-compress using mimeType and checking vp9/vp8 multi-ternary)
  content = content.replace(/const\s+mimeType\s*=\s*MediaRecorder\.isTypeSupported\([\s\S]+?\)\s*\?\s*['"]video[\s\S]+?\);/g, 'const mimeType = getSupportedMimeType(exportFormat);');

  // Replace Blob instantiation
  content = content.replace(/new\s+Blob\(\s*chunks\s*,\s*\{\s*type:\s*mime\s*\}\s*\)/g, 
    "new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime })");
  content = content.replace(/new\s+Blob\(\s*chunks\s*,\s*\{\s*type:\s*mimeType\s*\}\s*\)/g, 
    "new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mimeType })");

  // 4. Update resulting filename extensions
  // e.g. name: file.name.replace(/\.[^.]+$/, '_xxx.webm') -> name: file.name.replace(/\.[^.]+$/, `_xxx.${exportFormat}`)
  content = content.replace(/_([a-zA-Z0-9_\-]+)\.webm/g, "_$1.${exportFormat}");
  content = content.replace(/\.webm'/g, ".${exportFormat}'");
  content = content.replace(/\.webm`/g, ".${exportFormat}`");
  content = content.replace(/\.webm"/g, ".${exportFormat}\"");

  // Fix button labels (.webm to chosen extension)
  content = content.replace(/\(\.webm\)/g, "(.${exportFormat})");
  content = content.replace(/\.webm<\/button>/g, ".${exportFormat}</button>");

  // 5. Inject Dropdown UI
  // Locate config card block: file && !result &&
  // Inject the dropdown inside the configuration container
  if (!content.includes('value={exportFormat}')) {
    // Find the end of the configurations block right before the process/submit button
    // A typical tool has:
    // {file && !result && (
    //   <button ...
    // or:
    // {file && !result && (
    //   <div style={card}>
    //      ...
    //   </div>
    // )}
    // Let's search for the closing div tag of the config card.
    // In many tools:
    //       {file && !result && (
    //         <div style={card}>
    //           ...
    //         </div>
    //       )}
    // Let's locate the config card pattern. We can search for the start of `{file && !result && (`
    // and find the next card closing block.
    // For simpler injection, let's find the closing `</div>` right before the main action button.
    // Or we can find `{file && !result && (`:
    const idx = content.indexOf('{file && !result && (');
    if (idx !== -1) {
      // Find the next card style div closing tag inside this block
      // Many files structure:
      // {file && !result && (
      //   <div style={card}>
      //     ...
      //     [THIS IS A GOOD INJECTION SPOT]
      //   </div>
      // )}
      const cardStartIdx = content.indexOf('<div style={card}>', idx);
      if (cardStartIdx !== -1) {
        // Find the matching closing </div> of this card by searching backwards from the next button/processing logic
        const nextButtonIdx = content.indexOf('<button', cardStartIdx);
        if (nextButtonIdx !== -1) {
          const closingDivIdx = content.lastIndexOf('</div>', nextButtonIdx);
          if (closingDivIdx !== -1 && closingDivIdx > cardStartIdx) {
            content = content.slice(0, closingDivIdx) + dropdownUI + content.slice(closingDivIdx);
            console.log(`- Injected dropdown UI into config card in ${file}`);
          }
        }
      } else {
        // If there's no card layout (just plain button), we insert it inside the {file && !result && ( ... )} container
        // e.g. screen-recorder or webcam-recorder might not require uploading a file.
        // Let's check screen-recorder and webcam-recorder structures.
        // Let's search for configuration section in screen-recorder/webcam-recorder.
        // E.g. in screen-recorder:
        // {!result && (
        //   <div style={card}>
        //     ...
        //   </div>
        // )}
        const activeIdx = content.indexOf('style={card}');
        if (activeIdx !== -1) {
          const nextButtonIdx = content.indexOf('<button', activeIdx);
          if (nextButtonIdx !== -1) {
            const closingDivIdx = content.lastIndexOf('</div>', nextButtonIdx);
            if (closingDivIdx !== -1) {
              content = content.slice(0, closingDivIdx) + dropdownUI + content.slice(closingDivIdx);
              console.log(`- Injected dropdown UI into main layout card in ${file}`);
            }
          }
        }
      }
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');
});

console.log('All patches applied successfully!');
