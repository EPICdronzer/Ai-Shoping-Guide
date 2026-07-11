const fs = require('fs');
const path = require('path');

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

// Map of exact name line replacements for 100% precision
const nameReplacements = {
  'brightness-contrast/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, '_adjusted.webm')",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_adjusted.${exportFormat}`)"
  },
  'add-image-watermark/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, '_watermarked.webm')",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_watermarked.${exportFormat}`)"
  },
  'add-text-to-video/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, '_text.webm')",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_text.${exportFormat}`)"
  },
  'crop-video/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, '_cropped.webm')",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_cropped.${exportFormat}`)"
  },
  'loop-video/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, `_looped_${loops}x.webm`)",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_looped_${loops}x.${exportFormat}`)"
  },
  'mute-video/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, '_muted.webm')",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_muted.${exportFormat}`)"
  },
  'resize-video/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, `_${outW}x${outH}.webm`)",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_${outW}x${outH}.${exportFormat}`)"
  },
  'reverse-video/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, '_reversed.webm')",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_reversed.${exportFormat}`)"
  },
  'rotate-video/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, `_rotated${rotation}.webm`)",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_rotated${rotation}.${exportFormat}`)"
  },
  'screen-recorder/page.js': {
    target: "name: `recording_${new Date().toISOString().slice(0,10)}.webm`",
    replacement: "name: `recording_${new Date().toISOString().slice(0,10)}.${exportFormat}`"
  },
  'slow-motion-video/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, `_slow_${speed}x.webm`)",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_slow_${speed}x.${exportFormat}`)"
  },
  'speed-up-video/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, `_fast_${speed}x.webm`)",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_fast_${speed}x.${exportFormat}`)"
  },
  'video-compress/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, `_compressed.webm`), originalSize: file.size",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_compressed.${exportFormat}`), originalSize: file.size"
  },
  'video-filters/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, `_filter_${filter}.webm`)",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_filter_${filter}.${exportFormat}`)"
  },
  'video-trimmer/page.js': {
    target: "name: file.name.replace(/\\.[^.]+$/, '_trimmed.webm')",
    replacement: "name: file.name.replace(/\\.[^.]+$/, `_trimmed.${exportFormat}`)"
  },
  'webcam-recorder/page.js': {
    target: "name: `webcam_${new Date().toISOString().slice(0,10)}.webm`",
    replacement: "name: `webcam_${new Date().toISOString().slice(0,10)}.${exportFormat}`"
  }
};

const targetFiles = Object.keys(nameReplacements);

targetFiles.forEach(file => {
  const fullPath = path.join(basePath, file);
  if (!fs.existsSync(fullPath)) return;
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

  // 3. Replace MIME recorder logic using LITERALS to avoid regex devouring lines
  const standardMimeLine1 = "const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';";
  const standardMimeLine2 = "const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';";
  
  if (content.includes(standardMimeLine1)) {
    content = content.replace(standardMimeLine1, 'const mime = getSupportedMimeType(exportFormat);');
    console.log(`- Patched standard mime VP9 block in ${file}`);
  } else if (content.includes(standardMimeLine2)) {
    content = content.replace(standardMimeLine2, 'const mime = getSupportedMimeType(exportFormat);');
    console.log(`- Patched standard mime VP9+opus block in ${file}`);
  }

  // Special literal replacement for video-compress
  if (file === 'video-compress/page.js') {
    const compressMimeBlock = `      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';`;
    if (content.includes(compressMimeBlock)) {
      content = content.replace(compressMimeBlock, '      const mimeType = getSupportedMimeType(exportFormat);');
      console.log(`- Patched compress multi-line mime block`);
    }
  }

  // 4. Replace Blob instantiation using exact literals
  const standardBlobBlock = "const blob = new Blob(chunks, { type: mime });";
  if (content.includes(standardBlobBlock)) {
    content = content.replace(standardBlobBlock, "const blob = new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mime });");
    console.log(`- Patched standard blob instantiation in ${file}`);
  }

  const compressBlobBlock = "const blob = new Blob(chunks, { type: mimeType });";
  if (content.includes(compressBlobBlock)) {
    content = content.replace(compressBlobBlock, "const blob = new Blob(chunks, { type: exportFormat === 'mp4' ? 'video/mp4' : exportFormat === 'mov' ? 'video/quicktime' : mimeType });");
    console.log(`- Patched compress blob instantiation in ${file}`);
  }

  // 5. Replace filename name generation using exact literals
  const nameRep = nameReplacements[file];
  if (nameRep && content.includes(nameRep.target)) {
    content = content.replace(nameRep.target, nameRep.replacement);
    console.log(`- Patched filename generation in ${file}`);
  } else if (nameRep) {
    // try with backticks if not found
    const backtickTarget = nameRep.target.replace(/'/g, '`');
    if (content.includes(backtickTarget)) {
      content = content.replace(backtickTarget, nameRep.replacement);
      console.log(`- Patched filename generation (backtick) in ${file}`);
    } else {
      console.log(`⚠️ Warning: could not find name line in ${file}`);
    }
  }

  // 6. Update download button labels (literal `.webm)` string replacement)
  content = content.replace(/\.webm\)/g, ".${exportFormat})");
  content = content.replace(/\.webm<\/button>/g, ".${exportFormat}</button>");

  // 7. Inject Dropdown UI before the action button
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

console.log('All safe bulletproof patches applied successfully!');
