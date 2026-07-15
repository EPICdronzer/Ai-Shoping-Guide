'use client';
import { useState, useEffect, useRef } from 'react';

const WORKING_TOOLS = new Set([
  'shopping',
  'travel',
  'image-to-pdf',
  'image-compress',
  'image-resize',
  'image-convert',
  'background-remover',
  'ai-image-upscaler',
  'ai-photo-enhancer',
  'ai-resume',
  'ai-summarize',
  'ai-blog',
  'ai-email',
  'ai-translator',
  'ai-grammar',
  'ai-cover-letter',
  'ai-code-gen',
  'ai-code-explain',
  'ai-sql',
  'pdf-merge',
  'pdf-split',
  'pdf-compress',
  'pdf-protect',
  'pdf-unlock',
  'pdf-watermark',
  'pdf-numbering',
  'pdf-repair',
  'pdf-rotate',
  'pdf-remove-pages',
  'pdf-ocr',
  'word-to-pdf',
  'pdf-to-word',
  'excel-to-pdf',
  'pdf-to-excel',
  'ppt-to-pdf',
  'pdf-to-ppt',
  'html-to-pdf',
  'markdown-to-pdf',
  'img-to-pdf',
  'pdf-to-images',
  'csv-to-excel',
  'excel-to-csv',
  'epub-converter',
  'webp-convert',
  'heic-to-jpg',
  'barcode',
  'qr-code',
  'json-formatter',
  'json-xml',
  'base64',
  'uuid-gen',
  'password-gen',
  'color-palette',
  'image-color-picker',
  'image-crop',
  'image-to-text',
  'text-formatter',
  'unit-converter',
  'currency-converter',
  'notemind',
  'watermark-remover',
  'image-rotate',
  'img-compress',
  'img-resize',
  'img-format',

  // Video Tools
  'video-compress',
  'video-trimmer',
  'mute-video',
  'rotate-video',
  'flip-video',
  'speed-up-video',
  'slow-motion-video',
  'loop-video',
  'reverse-video',
  'thumbnail-generator',
  'video-metadata-viewer',
  'screen-recorder',
  'webcam-recorder',
  'extract-audio',
  'extract-mp3',
  'brightness-contrast',
  'saturation-adjustment',
  'color-correction',
  'video-filters',
  'add-text-to-video',
  'add-image-watermark',
  'resize-video',
  'crop-video',
  'video-to-gif',
  'video-downloader',
  'yt-downloader',
  'yt-shorts-downloader',
  'yt-playlist-downloader',
  'watermark-remover-video',
  'ai-video-upscaler',

  // Dynamic Case Handlers
  'ai-astrology-assistant',
  'ai-astrology',
  'ai-travel-planner',
  'ai-travel',
  'glassmorphism-generator',
  'glassmorphism',
  'neumorphism-generator',
  'neumorphism',
  'password-strength',
  'password-strength-checker',
  'jwt-decoder',
  'jwt-decode',
  'bmi-calculator',
  'bmi',
  'ai-chat',
  'lorem-ipsum',
  'lorem-ipsum-generator',
  'age-calculator'
]);

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [expandedTools, setExpandedTools] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategories, setActiveCategories] = useState([]);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const floatingInputRef = useRef(null);
  const mainRef = useRef(null);
  const filterPanelRef = useRef(null);

  useEffect(() => {
    const threshold = 100;
    const onScroll = () => {
      const winScroll = window.scrollY || window.pageYOffset;
      const elScroll = mainRef.current ? mainRef.current.scrollTop : 0;
      setIsScrolled(winScroll > threshold || elScroll > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const el = mainRef.current;
    if (el) el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (el) el.removeEventListener('scroll', onScroll);
    };
  }, []);

  const toggleExpand = (toolId) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 600) {
      setExpandedTools(prev => ({
        ...prev,
        [toolId]: !prev[toolId]
      }));
    }
  };

  const tools = [
    // Active / Main Tools
    {
      id: 'shopping',
      title: 'ShopMind AI',
      category: '🚀 Active Tools',
      description: 'Find products, compare prices across stores, get budget recommendations, and analyze alternatives using AI.',
      icon: '🛍️',
      active: true,
      link: '/shopping',
      badge: 'Gemini Powered',
      accentColor: 'rgba(236,72,153,0.18)',
      badgeColor: '#f472b6',
      features: ['Web Search Integration', 'Multi-Product Compare', 'Smart Budget Alerts'],
    },
    {
      id: 'travel',
      title: 'RouteMind AI',
      category: '🚀 Active Tools',
      description: 'Interactive map-based travel planner. Compare CNG, Petrol & Diesel fuel costs, calculate tolls with AI.',
      icon: '🚗',
      active: true,
      link: '/travel',
      badge: 'New Tool',
      accentColor: 'rgba(59,130,246,0.18)',
      badgeColor: '#60a5fa',
      features: ['Interactive Leaflet Maps', 'CNG vs Petrol vs Diesel', 'Toll Tax Simulation'],
    },

    // Image Tools
    {
      id: 'img-to-pdf',
      title: 'Image to PDF',
      category: '🖼️ Image Tools',
      description: 'Convert JPG, PNG, WEBP and more images into a single high-quality PDF. Batch upload, drag-to-reorder pages.',
      icon: '🖼️',
      active: true,
      link: '/tools/image-to-pdf',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Batch Multi-Image Upload', 'Page Size & Orientation', 'Drag-to-Reorder Pages'],
    },
    {
      id: 'img-compress',
      title: 'Image Compressor',
      category: '🖼️ Image Tools',
      description: 'Compress images to shrink file size or upscale quality. Control level with a live slider and see before/after stats.',
      icon: '📦',
      active: true,
      link: '/tools/image-compress',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Lossy & Lossless Modes', 'Decompress / Upscale Size', 'Bulk Batch Processing'],
    },
    {
      id: 'img-resize',
      title: 'Image Resizer',
      category: '🖼️ Image Tools',
      description: 'Resize images to exact pixel dimensions, percentage, or preset sizes for social media and web platforms.',
      icon: '📐',
      active: true,
      link: '/tools/image-resize',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Pixel & % Resize', 'Aspect Ratio Lock', 'Social Media Presets'],
    },
    {
      id: 'img-format',
      title: 'Image Converter',
      category: '🖼️ Image Tools',
      description: 'Convert between JPG, PNG, WEBP, and BMP with a single click. Quality control for lossy formats.',
      icon: '🔄',
      active: true,
      link: '/tools/image-convert',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['4 Formats Supported', 'Transparency Preserved', 'Quality Fine-Control'],
    },
    {
      id: 'background-remover',
      title: 'Background Remover',
      category: '🖼️ Image Tools',
      description: 'Remove backgrounds from images instantly using local canvas edge-detection and threshold color keying.',
      icon: '👤',
      active: true,
      link: '/tools/background-remover',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Color Threshold Match', 'Alpha Masking', 'White/Black Preset Keys'],
    },
    {
      id: 'ai-image-upscaler',
      title: 'AI Image Upscaler',
      category: '🖼️ Image Tools',
      description: 'Enhance and upscale image resolutions client-side using advanced interpolation algorithms.',
      icon: '🚀',
      active: true,
      link: '/tools/ai-image-upscaler',
      badge: 'AI Powered',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Super Resolution Simulation', 'Bicubic Spline Scale', 'Noise reduction filter'],
    },
    {
      id: 'watermark-remover',
      title: 'Watermark Remover',
      category: '🖼️ Image Tools',
      description: 'Erase overlay stamps, text, or logos from pictures using localized canvas inpainting brushes.',
      icon: '🧹',
      active: true,
      link: '/tools/watermark-remover',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Inpaint Healing Brush', 'Adjustable Brush Size', 'Color Match Blur'],
    },
    {
      id: 'image-crop',
      title: 'Image Cropper',
      category: '🖼️ Image Tools',
      description: 'Select rectangular regions of images and crop them. Drag handles to resize crop box.',
      icon: '✂️',
      active: true,
      link: '/tools/image-crop',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Dynamic Crop Box', 'Aspect Ratio Helpers', 'Instant Export'],
    },
    {
      id: 'image-rotate',
      title: 'Image Rotator',
      category: '🖼️ Image Tools',
      description: 'Rotate images in 90-degree steps or custom degree angles. Flip horizontally or vertically.',
      icon: '🔄',
      active: true,
      link: '/tools/image-rotate',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['90° Step Rotations', 'Horizontal/Vertical Flips', 'Custom Angle Wheel'],
    },
    {
      id: 'image-color-picker',
      title: 'Image Color Picker',
      category: '🖼️ Image Tools',
      description: 'Upload any image and pick colors from individual pixels. Displays HEX, RGB, and HSL codes.',
      icon: '🎨',
      active: true,
      link: '/tools/image-color-picker',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['Canvas Pixel Inspector', 'Zoom Magnifier Loupe', 'Color Palette History'],
    },
    {
      id: 'image-to-text',
      title: 'Image to Text (OCR)',
      category: '🖼️ Image Tools',
      description: 'Extract editable text from images, invoices, or scanned documents using client-side OCR.',
      icon: '📝',
      active: true,
      link: '/tools/image-to-text',
      badge: 'AI OCR',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Auto Layout Analysis', 'Copy Output Text', 'Language selection'],
    },
    {
      id: 'heic-to-jpg',
      title: 'HEIC to JPG Converter',
      category: '🖼️ Image Tools',
      description: 'Convert Apple HEIC photos to standard JPG or PNG images directly in your browser.',
      icon: '🖼️',
      active: true,
      link: '/tools/heic-to-jpg',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Convert in Browser', 'Exif Data Preserve', 'Quality Tuning slider'],
    },
    {
      id: 'webp-convert',
      title: 'WebP Converter',
      category: '🖼️ Image Tools',
      description: 'Convert WebP images back into PNG, JPG, or GIF files. Bulk convert supported.',
      icon: '🌐',
      active: true,
      link: '/tools/webp-convert',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Fast Decoders', 'Batch Exports', 'Transparency lock'],
    },
    {
      id: 'ai-photo-enhancer',
      title: 'AI Photo Enhancer',
      category: '🖼️ Image Tools',
      description: 'Enhance contrast, saturation, sharpness, and brightness of photos using custom WebGL/Canvas shaders.',
      icon: '✨',
      active: true,
      link: '/tools/ai-photo-enhancer',
      badge: 'AI Render',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Smart Auto-Contrast', 'Details Sharpener', 'Vintage & Modern filters'],
    },

    // PDF Tools
    {
      id: 'pdf-to-word',
      title: 'PDF to Word',
      category: '📄 PDF Tools',
      description: 'Convert PDFs into editable Microsoft Word (.docx) documents by extracting all text content.',
      icon: '📝',
      active: true,
      link: '/tools/pdf-to-word',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Text Extraction', 'Heading Detection', 'Batch PDF Support'],
    },
    {
      id: 'pdf-to-excel',
      title: 'PDF to Excel',
      category: '📄 PDF Tools',
      description: 'Extract text from PDFs page by page and organize each line into an editable Excel (.xlsx) spreadsheet.',
      icon: '📊',
      active: true,
      link: '/tools/pdf-to-excel',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Per-Page Rows', 'Multi-Page Support', 'Auto Column Width'],
    },
    {
      id: 'pdf-to-images',
      title: 'PDF to Images',
      category: '📄 PDF Tools',
      description: 'Convert every page of a PDF into high-resolution PNG images. Choose DPI and download individually or all.',
      icon: '🗂️',
      active: true,
      link: '/tools/pdf-to-images',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Per-Page Export', '72 / 150 / 300 DPI', 'Thumbnail Grid'],
    },
    {
      id: 'pdf-compress',
      title: 'PDF Compressor',
      category: '📄 PDF Tools',
      description: 'Reduce PDF file size using object stream optimization and metadata stripping. Fast, private, client-side.',
      icon: '📄',
      active: true,
      link: '/tools/pdf-compress',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Object Stream Compress', 'Metadata Strip', 'Before/After Size'],
    },
    {
      id: 'pdf-merge',
      title: 'PDF Merger',
      category: '📄 PDF Tools',
      description: 'Merge multiple PDF files into one document. Drag to reorder before merging and download instantly.',
      icon: '🔗',
      active: true,
      link: '/tools/pdf-merge',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['Drag & Drop Order', 'Unlimited Files', 'Instant Merge'],
    },
    {
      id: 'pdf-split',
      title: 'PDF Splitter',
      category: '📄 PDF Tools',
      description: 'Split a PDF into individual pages or extract custom page ranges. Download each split as a separate file.',
      icon: '✂️',
      active: true,
      link: '/tools/pdf-split',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.12)',
      badgeColor: '#60a5fa',
      features: ['All Pages Mode', 'Custom Range (1-3, 5)', 'Batch Download'],
    },
    {
      id: 'pdf-protect',
      title: 'Protect PDF',
      category: '📄 PDF Tools',
      description: 'Encrypt your PDF with a password. Prevents unauthorized users from opening or editing the document.',
      icon: '🔒',
      active: true,
      link: '/tools/pdf-protect',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['RC4 & AES Encryption', 'Custom User Passwords', 'Secure browser encoding'],
    },
    {
      id: 'pdf-unlock',
      title: 'Unlock PDF',
      category: '📄 PDF Tools',
      description: 'Decrypt password-protected PDFs and download them without passwords.',
      icon: '🔓',
      active: true,
      link: '/tools/pdf-unlock',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Decryption keys', 'Permission unlock', 'Download password-free'],
    },
    {
      id: 'pdf-watermark',
      title: 'Add Watermark',
      category: '📄 PDF Tools',
      description: 'Overlay custom text watermarks or image logos onto every page of a PDF document.',
      icon: '💧',
      active: true,
      link: '/tools/pdf-watermark',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Text & Image support', 'Opacity & rotation controls', 'Margins & scaling'],
    },
    {
      id: 'pdf-remove-pages',
      title: 'Remove Pages',
      category: '📄 PDF Tools',
      description: 'Remove selected pages from PDF document. Enter page list (e.g. 2, 4-7) to discard.',
      icon: '🗑️',
      active: true,
      link: '/tools/pdf-remove-pages',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['Select pages to delete', 'Page numbers parsing', 'Auto save output'],
    },
    {
      id: 'pdf-rotate',
      title: 'Rotate PDF',
      category: '📄 PDF Tools',
      description: 'Rotate PDF pages by 90, 180 or 270 degrees. Rotate all or specific pages.',
      icon: '🔄',
      active: true,
      link: '/tools/pdf-rotate',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['90/180/270 Degree rotates', 'Per-page or whole PDF select', 'Live previews'],
    },
    {
      id: 'pdf-numbering',
      title: 'Page Numbering',
      category: '📄 PDF Tools',
      description: 'Add page numbers to bottom left, center, right, or top headers of your PDF documents.',
      icon: '🔢',
      active: true,
      link: '/tools/pdf-numbering',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Header/Footer Numbers', 'Custom offsets & text formats', 'Start page selector'],
    },
    {
      id: 'pdf-ocr',
      title: 'OCR PDF',
      category: '📄 PDF Tools',
      description: 'Scan non-selectable image-only PDFs and convert them into selectable, searchable PDF files.',
      icon: '🔍',
      active: true,
      link: '/tools/pdf-ocr',
      badge: 'AI OCR',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Searchable layers', 'Fast text alignment', 'Language support'],
    },
    {
      id: 'pdf-esign',
      title: 'eSign PDF',
      category: '📄 PDF Tools',
      description: 'Digitally sign PDFs using custom signatures. Draw signature or import transparent images.',
      icon: '✍️',
      active: true,
      link: '/tools/pdf-esign',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Draw Signature canvas', 'Drag & place stamps', 'Scale and save signs'],
    },
    {
      id: 'pdf-repair',
      title: 'PDF Repair',
      category: '📄 PDF Tools',
      description: 'Restore and recover text contents from corrupt, unreadable, or damaged PDF documents.',
      icon: '🔧',
      active: true,
      link: '/tools/pdf-repair',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['Structure recovery', 'Cross-Reference rebuilding', 'Metadata recovery'],
    },
    {
      id: 'pdf-to-ppt',
      title: 'PDF to PowerPoint',
      category: '📄 PDF Tools',
      description: 'Convert PDF document pages into high quality slide frames in PowerPoint PPTX.',
      icon: '📉',
      active: true,
      link: '/tools/pdf-to-ppt',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Auto Page Scaling', 'Image slide embedding', 'Quick PPTX output'],
    },

    // AI Tools
    {
      id: 'ai-resume',
      title: 'AI Resume Builder',
      category: '🧠 AI Tools',
      description: 'Generate standard job-winning resume data and layouts optimized for ATS software using Gemini AI.',
      icon: '📄',
      active: true,
      link: '/tools/ai-resume',
      badge: 'Gemini AI',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['ATS optimization', 'Gemini formatting', 'Polished print-ready layouts'],
    },
    {
      id: 'ai-cover-letter',
      title: 'AI Cover Letter',
      category: '🧠 AI Tools',
      description: 'Generate customized professional cover letters for job applications based on resume and descriptions.',
      icon: '✉️',
      active: true,
      link: '/tools/ai-cover-letter',
      badge: 'Gemini AI',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Job match analysis', 'Tone choices', 'Formatted email drafts'],
    },
    {
      id: 'ai-email',
      title: 'AI Email Writer',
      category: '🧠 AI Tools',
      description: 'Compose high-converting professional, friendly, or sales emails from short prompt ideas.',
      icon: '📧',
      active: true,
      link: '/tools/ai-email',
      badge: 'Gemini AI',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Tone options', 'Subject generators', 'Quick paste to clipboard'],
    },
    {
      id: 'ai-grammar',
      title: 'AI Grammar Checker',
      category: '🧠 AI Tools',
      description: 'Instantly check grammar, formatting, spelling mistakes, and enhance flow of your texts.',
      icon: '✍️',
      active: true,
      link: '/tools/ai-grammar',
      badge: 'Gemini AI',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['Inline corrections', 'Readability score', 'Vocabulary suggestions'],
    },
    {
      id: 'ai-translator',
      title: 'AI Translator',
      category: '🧠 AI Tools',
      description: 'Translate texts between 50+ languages with high context preservation and accuracy using Gemini.',
      icon: '🌐',
      active: true,
      link: '/tools/ai-translator',
      badge: 'Gemini AI',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Dialect localization', 'Multi-paragraph translation', 'Instant swap'],
    },
    {
      id: 'ai-code-gen',
      title: 'AI Code Generator',
      category: '🧠 AI Tools',
      description: 'Generate code files, logic, tests, and configurations in JavaScript, Python, C++, SQL and more.',
      icon: '💻',
      active: true,
      link: '/tools/ai-code-gen',
      badge: 'Gemini AI',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Syntactical correctness', 'Clean comments', 'Multi-language supported'],
    },
    {
      id: 'ai-code-explain',
      title: 'AI Code Explainer',
      category: '🧠 AI Tools',
      description: 'Analyze complex code snippets, explaining algorithms, complexity analysis, and suggest fixes.',
      icon: '💡',
      active: true,
      link: '/tools/ai-code-explain',
      badge: 'Gemini AI',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Big-O complexity helper', 'Step-by-step logic map', 'Optimal rewrite tips'],
    },
    {
      id: 'ai-sql',
      title: 'AI SQL Generator',
      category: '🧠 AI Tools',
      description: 'Generate raw SQL queries, schema tables, views, index statements from natural language descriptions.',
      icon: '🛢️',
      active: true,
      link: '/tools/ai-sql',
      badge: 'Gemini AI',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Joins, aggregates queries', 'Postgres/MySQL formats', 'Optimize statements'],
    },
    {
      id: 'ai-blog',
      title: 'AI Blog Writer',
      category: '🧠 AI Tools',
      description: 'Generate SEO optimized blog articles, structured headers, intros, and metadata on any topic.',
      icon: '✍️',
      active: true,
      link: '/tools/ai-blog',
      badge: 'Gemini AI',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['SEO keywords integration', 'Section outlines generator', 'Social hooks suggestions'],
    },
    {
      id: 'ai-summarize',
      title: 'AI Summarizer',
      category: '🧠 AI Tools',
      description: 'Paste research articles, emails or contracts and get concise summaries with key bullet takeaways.',
      icon: '📝',
      active: true,
      link: '/tools/ai-summarize',
      badge: 'Gemini AI',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Word reduction factor', 'Bullet list takeaways', 'Context key terms extraction'],
    },

    // Documents Tools
    {
      id: 'word-to-pdf',
      title: 'Word to PDF',
      category: '📁 Document Tools',
      description: 'Convert .docx and .doc Word files into PDFs with proper paragraph and heading formatting.',
      icon: '📃',
      active: true,
      link: '/tools/word-to-pdf',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.12)',
      badgeColor: '#34d399',
      features: ['DOCX & DOC Support', 'Heading Styles', 'A4 PDF Output'],
    },
    {
      id: 'excel-to-pdf',
      title: 'Excel to PDF',
      category: '📁 Document Tools',
      description: 'Convert Excel spreadsheets and CSV files to PDF with styled table rendering and live preview.',
      icon: '🔢',
      active: true,
      link: '/tools/excel-to-pdf',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.12)',
      badgeColor: '#fb923c',
      features: ['XLSX, XLS & CSV', 'Styled Table PDF', 'Live Row Preview'],
    },
    {
      id: 'ppt-to-pdf',
      title: 'PPT to PDF',
      category: '📁 Document Tools',
      description: 'Convert PowerPoint presentations (.pptx) into standard PDF documents easily.',
      icon: '📉',
      active: true,
      link: '/tools/ppt-to-pdf',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Slide formatting preservation', 'Layout rendering', 'Compact PDF size'],
    },
    {
      id: 'pdf-to-ppt',
      title: 'PDF to PPT Converter',
      category: '📁 Document Tools',
      description: 'Convert PDF slides back to editable PowerPoint presentation files (.pptx).',
      icon: '📊',
      active: true,
      link: '/tools/pdf-to-ppt',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['Convert text pages to slides', 'Image rendering support', 'Editable elements'],
    },
    {
      id: 'html-to-pdf',
      title: 'HTML to PDF',
      category: '📁 Document Tools',
      description: 'Convert raw HTML code string or websites into polished print-ready PDF files.',
      icon: '🌐',
      active: true,
      link: '/tools/html-to-pdf',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Webpages layout engine', 'CSS styles formatting', 'Direct prints'],
    },
    {
      id: 'markdown-to-pdf',
      title: 'Markdown to PDF',
      category: '📁 Document Tools',
      description: 'Convert Markdown logs, documentation notes or code readmes to beautiful standard PDF files.',
      icon: '✍️',
      active: true,
      link: '/tools/markdown-to-pdf',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Rich text fonts', 'Syntax block colors', 'Direct downloads'],
    },
    {
      id: 'epub-converter',
      title: 'EPUB Converter',
      category: '📁 Document Tools',
      description: 'Convert e-books in EPUB format to PDF or extract raw text content.',
      icon: '📚',
      active: true,
      link: '/tools/epub-converter',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Reflowable layouts', 'Font matching options', 'Fast translations'],
    },
    {
      id: 'csv-to-excel',
      title: 'CSV to Excel',
      category: '📁 Document Tools',
      description: 'Convert raw CSV data sheets into highly formatted Microsoft Excel spreadsheets (.xlsx).',
      icon: '📊',
      active: true,
      link: '/tools/csv-to-excel',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Smart delimiter parser', 'Auto sheet styling', 'Supports large files'],
    },
    {
      id: 'excel-to-csv',
      title: 'Excel to CSV Converter',
      category: '📁 Document Tools',
      description: 'Extract raw rows and columns from Excel sheets (.xlsx) into comma separated value files.',
      icon: '📑',
      active: true,
      link: '/tools/excel-to-csv',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['Sheet tab selectors', 'Custom comma delimiters', 'Instant text previews'],
    },
    {
      id: 'text-formatter',
      title: 'Text Formatter',
      category: '📁 Document Tools',
      description: 'Format, clean, beautify, indent raw text, modify cases, or clean special symbols.',
      icon: '🔤',
      active: true,
      link: '/tools/text-formatter',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['UPPER / lower case tools', 'Whitespace trimmer', 'Remove duplicate lines'],
    },

    // Utilities Tools
    {
      id: 'qr-code',
      title: 'QR Code Generator',
      category: '🛠️ Utilities',
      description: 'Generate high-resolution QR codes from URLs, texts, phone contacts or Wi-Fi configurations.',
      icon: '📱',
      active: true,
      link: '/tools/qr-code',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Custom colors options', 'Sizing scale sliders', 'Instant PNG/SVG saves'],
    },
    {
      id: 'barcode',
      title: 'Barcode Generator',
      category: '🛠️ Utilities',
      description: 'Generate standard barcodes including Code128, EAN, UPC codes for product inventory packaging.',
      icon: '📊',
      active: true,
      link: '/tools/barcode',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Multi formats (Code128, EAN)', 'Tuning sizes settings', 'High-res image export'],
    },
    {
      id: 'password-gen',
      title: 'Password Generator',
      category: '🛠️ Utilities',
      description: 'Generate ultra-secure, cryptographically strong passwords. Choose lengths and symbols.',
      icon: '🔑',
      active: true,
      link: '/tools/password-gen',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['Length customization', 'Numbers, symbols switches', 'Copy to clipboard'],
    },
    {
      id: 'uuid-gen',
      title: 'UUID Generator',
      category: '🛠️ Utilities',
      description: 'Generate standard UUID (v4) unique identifiers in bulk formats for databases.',
      icon: '🆔',
      active: true,
      link: '/tools/uuid-gen',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Bulk generations format', 'V4 standard keys', 'Uppercase toggle'],
    },
    {
      id: 'json-formatter',
      title: 'JSON Formatter',
      category: '🛠️ Utilities',
      description: 'Beautify, indent, format or minify raw JSON objects. Highlights errors in real-time.',
      icon: '💻',
      active: true,
      link: '/tools/json-formatter',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Validation check log', 'Indent custom spaces', 'Instant copy outputs'],
    },
    {
      id: 'json-xml',
      title: 'JSON ↔ XML Converter',
      category: '🛠️ Utilities',
      description: 'Convert JSON records into well-formatted XML tags, and XML files back to JSON.',
      icon: '🔄',
      active: true,
      link: '/tools/json-xml',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Bidirectional converter', 'Nesting tag checks', 'Quick file download'],
    },
    {
      id: 'base64',
      title: 'Base64 Encoder / Decoder',
      category: '🛠️ Utilities',
      description: 'Encode standard strings to Base64 formats, or decode Base64 back to raw readable texts.',
      icon: '🔗',
      active: true,
      link: '/tools/base64',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Bidi translation', 'URL safe options support', 'Instant string validation'],
    },
    {
      id: 'color-palette',
      title: 'Color Palette Generator',
      category: '🛠️ Utilities',
      description: 'Generate beautiful harmonious color palettes, random generators, or build shade gradients.',
      icon: '🎨',
      active: true,
      link: '/tools/color-palette',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.12)',
      badgeColor: '#f472b6',
      features: ['Monochromatic palette', 'Copy HEX values', 'Shades scale controls'],
    },
    {
      id: 'unit-converter',
      title: 'Unit Converter',
      category: '🛠️ Utilities',
      description: 'Convert values of length, mass, area, temperature, velocity, data sizes instantly.',
      icon: '📏',
      active: true,
      link: '/tools/unit-converter',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['10+ Categories conversions', 'Live inputs triggers', 'Precision sliders'],
    },
    {
      id: 'currency-converter',
      title: 'Currency Converter',
      category: '🛠️ Utilities',
      description: 'Convert currency rates (USD, EUR, GBP, INR, JPY, CAD) with live simulation calculator.',
      icon: '💱',
      active: true,
      link: '/tools/currency-converter',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Simulation mode conversion', 'Common currency presets', 'Quick swap button'],
    },
    // Basic Video Tools
    {
      id: 'video-compress',
      title: 'Video Compressor',
      category: '🎥 Basic Video Tools',
      description: 'Compress video files to shrink file size. Control level with presets and see before/after stats.',
      icon: '🎬',
      active: true,
      link: '/tools/video-compress',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Adjustable Presets', 'Codec Optimization', 'WEBM Format Export'],
    },
    {
      id: 'video-converter',
      title: 'Video Converter',
      category: '🎥 Basic Video Tools',
      description: 'Convert video files between MP4, MOV, AVI, WEBM, and other formats instantly.',
      icon: '🔄',
      active: true,
      link: '/tools/video-converter',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Multi-format Support', 'Lossless Conversion', 'Fast Processing'],
    },
    {
      id: 'video-trimmer',
      title: 'Video Trimmer',
      category: '🎥 Basic Video Tools',
      description: 'Trim the start and end points of a video file. Cut out unwanted sections.',
      icon: '✂️',
      active: true,
      link: '/tools/video-trimmer',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Visual Timeline', 'Precise Range Select', 'Instant Export'],
    },
    {
      id: 'video-cutter',
      title: 'Video Cutter',
      category: '🎥 Basic Video Tools',
      description: 'Cut large video files into smaller separate video clips.',
      icon: '🎞️',
      active: true,
      link: '/tools/video-cutter',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Split Segments', 'No-Reencode Mode', 'Custom Lengths'],
    },
    {
      id: 'video-merger',
      title: 'Video Merger',
      category: '🎥 Basic Video Tools',
      description: 'Combine and merge multiple video files into a single sequence.',
      icon: '🔗',
      active: true,
      link: '/tools/video-merger',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Drag & Drop Order', 'Format Alignment', 'Seamless Stitching'],
    },
    {
      id: 'video-splitter',
      title: 'Video Splitter',
      category: '🎥 Basic Video Tools',
      description: 'Split video into equal segments or by custom parts for sharing.',
      icon: '✂️',
      active: true,
      link: '/tools/video-splitter',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Auto Partitioning', 'Timeline Snapping', 'Batch Download'],
    },
    {
      id: 'crop-video',
      title: 'Crop Video',
      category: '🎥 Basic Video Tools',
      description: 'Select rectangular regions of video frames to crop out specific areas.',
      icon: '📐',
      active: true,
      link: '/tools/crop-video',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Aspect Ratio Presets', 'Freeform Cropper', 'Canvas Accelerated'],
    },
    {
      id: 'resize-video',
      title: 'Resize Video',
      category: '🎥 Basic Video Tools',
      description: 'Change video resolution dimensions, scaling aspect ratios and padding.',
      icon: '📏',
      active: true,
      link: '/tools/resize-video',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Pixel Scaling', 'Pillarbox Prevention', 'Dynamic Scaling'],
    },
    {
      id: 'rotate-video',
      title: 'Rotate Video',
      category: '🎥 Basic Video Tools',
      description: 'Rotate videos in 90-degree steps or flip them horizontally and vertically.',
      icon: '🔄',
      active: true,
      link: '/tools/rotate-video',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['90/180/270 Rotation', 'Mirror Flips', 'Fast Metadata Tagging'],
    },
    {
      id: 'flip-video',
      title: 'Flip Video',
      category: '🎥 Basic Video Tools',
      description: 'Mirror video footage horizontally or vertically to correct camera alignments.',
      icon: '🪞',
      active: true,
      link: '/tools/flip-video',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Horizontal Mirror', 'Vertical Inversion', 'Canvas Blitting'],
    },
    {
      id: 'reverse-video',
      title: 'Reverse Video',
      category: '🎥 Basic Video Tools',
      description: 'Reverse video frames to play backward. Ideal for rewind loops.',
      icon: '⏪',
      active: true,
      link: '/tools/reverse-video',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Frame Reorder Engine', 'Audio Playback Reverse', 'Adjustable Speed'],
    },
    {
      id: 'speed-up-video',
      title: 'Speed Up Video',
      category: '🎥 Basic Video Tools',
      description: 'Speed up video playback to create high-speed time-lapses.',
      icon: '⏩',
      active: true,
      link: '/tools/speed-up-video',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Up to 8x Faster', 'Audio Pitch Maintain', 'Frame Dropping Logic'],
    },
    {
      id: 'slow-motion-video',
      title: 'Slow Motion Video',
      category: '🎥 Basic Video Tools',
      description: 'Slow down video playback speed for dramatic slow-mo highlights.',
      icon: '🐢',
      active: true,
      link: '/tools/slow-motion-video',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Slow to 0.25x Speed', 'Optical Flow Simulation', 'Audio Speed Sync'],
    },
    {
      id: 'loop-video',
      title: 'Loop Video',
      category: '🎥 Basic Video Tools',
      description: 'Set video clips to repeat multiple times continuously in a loop.',
      icon: '🔁',
      active: true,
      link: '/tools/loop-video',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Custom Loop Counts', 'Audio Loop Stitching', 'Seamless Frames'],
    },
    {
      id: 'mute-video',
      title: 'Mute Video',
      category: '🎥 Basic Video Tools',
      description: 'Strip and remove all audio tracks from a video file.',
      icon: '🔇',
      active: true,
      link: '/tools/mute-video',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['No Re-encoding', 'Instant Track Stripping', 'Clean MP4/WEBM Output'],
    },
    {
      id: 'extract-audio',
      title: 'Extract Audio',
      category: '🎥 Basic Video Tools',
      description: 'Extract and isolate the audio track from video files.',
      icon: '🎵',
      active: true,
      link: '/tools/extract-audio',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['MP3/WAV/AAC Formats', 'Metadata Retention', 'Trim & Extract Option'],
    },
    {
      id: 'add-audio-to-video',
      title: 'Add Audio to Video',
      category: '🎥 Basic Video Tools',
      description: 'Add music, voiceovers, or background sound effects to videos.',
      icon: '🎶',
      active: true,
      link: '/tools/add-audio-to-video',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Soundtrack Mix', 'Adjustable Volume Mixer', 'Timeline Sync'],
    },
    {
      id: 'change-video-resolution',
      title: 'Change Video Resolution',
      category: '🎥 Basic Video Tools',
      description: 'Change the pixel density or resolution standard of a video file.',
      icon: '📺',
      active: true,
      link: '/tools/change-video-resolution',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['1080p, 720p, 4K Presets', 'Aspect Constraints', 'Fast Downscale'],
    },
    {
      id: 'change-fps',
      title: 'Change FPS',
      category: '🎥 Basic Video Tools',
      description: 'Modify the frames-per-second setting of your video.',
      icon: '📊',
      active: true,
      link: '/tools/change-fps',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Convert 60 to 30 FPS', 'Drop Frame Smoothing', 'Custom Frame Rates'],
    },
    {
      id: 'reduce-video-size',
      title: 'Reduce Video Size',
      category: '🎥 Basic Video Tools',
      description: 'Shrink video file sizes by adjusting encoding bitrates.',
      icon: '🗜️',
      active: true,
      link: '/tools/reduce-video-size',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Target Size Predictor', 'Two-Pass Compression', 'Bitrate Auto-tuner'],
    },

    // Editing Tools
    {
      id: 'add-text-to-video',
      title: 'Add Text to Video',
      category: '🎬 Editing Tools',
      description: 'Overlay custom text overlays, titles, or kinetic typography on your video.',
      icon: '✍️',
      active: true,
      link: '/tools/add-text-to-video',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Font Style Controls', 'Dynamic Timestamps', 'CSS Styling Engine'],
    },
    {
      id: 'add-image-watermark',
      title: 'Add Image/Logo Watermark',
      category: '🎬 Editing Tools',
      description: 'Overlay custom logo images, watermarks, or stamps on your video.',
      icon: '🛡️',
      active: true,
      link: '/tools/add-image-watermark',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Opacity Control', 'Position Alignment Grid', 'Image Resize & Rotate'],
    },
    {
      id: 'watermark-remover-video',
      title: 'Remove Watermark',
      category: '🎬 Editing Tools',
      description: 'Erase watermarks, overlay text, or static logos from videos using blur mask.',
      icon: '🧹',
      active: true,
      link: '/tools/watermark-remover-video',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Brush Mask Area', 'Inpaint Healing Blur', 'Timeline Matching'],
    },
    {
      id: 'blur-faces',
      title: 'Blur Faces',
      category: '🎬 Editing Tools',
      description: 'Detect and blur faces automatically in video footage to protect privacy.',
      icon: '👤',
      active: true,
      link: '/tools/blur-faces',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Face Detection Mask', 'Adjustable Blur Radii', 'Timeline Face Tracking'],
    },
    {
      id: 'blur-background',
      title: 'Blur Background',
      category: '🎬 Editing Tools',
      description: 'Separate subject from background and blur background client-side.',
      icon: '🫧',
      active: true,
      link: '/tools/blur-background',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Bokeh Blur Effect', 'Depth Masking Slider', 'Subject Highlight Mode'],
    },
    {
      id: 'add-subtitles',
      title: 'Add Subtitles',
      category: '🎬 Editing Tools',
      description: 'Upload SRT/VTT subtitle files and sync them with your video playback.',
      icon: '💬',
      active: true,
      link: '/tools/add-subtitles',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['SRT & VTT Support', 'Subtitle Delay Adjust', 'Font Style Editor'],
    },
    {
      id: 'remove-subtitles',
      title: 'Remove Subtitles',
      category: '🎬 Editing Tools',
      description: 'Strip embedded subtitle tracks or mask hardcoded subtitles from videos.',
      icon: '📴',
      active: true,
      link: '/tools/remove-subtitles',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Soft-sub Track Strip', 'Area Blur Masking', 'Clean Export Option'],
    },
    {
      id: 'auto-subtitle-generator',
      title: 'Auto Subtitle Generator',
      category: '🎬 Editing Tools',
      description: 'Generate speech-to-text subtitles automatically using AI models.',
      icon: '🤖',
      active: true,
      link: '/tools/auto-subtitle-generator',
      badge: 'AI Model',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Multi-Language Spoken', 'Timestamp Aligned', 'SRT/VTT Export formats'],
    },
    {
      id: 'burn-subtitles',
      title: 'Burn Subtitles into Video',
      category: '🎬 Editing Tools',
      description: 'Hardcode and render subtitles permanently into the video frame.',
      icon: '🔥',
      active: true,
      link: '/tools/burn-subtitles',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Hardcoded Rendering', 'Crisp Text Scaling', 'Outline/Background Box'],
    },
    {
      id: 'video-filters',
      title: 'Video Filters',
      category: '🎬 Editing Tools',
      description: 'Apply artistic filters, color LUTs, and aesthetic styles to video clips.',
      icon: '🎭',
      active: true,
      link: '/tools/video-filters',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Creative LUT Filters', 'Canvas Render Pipeline', 'Realtime Intensity Controls'],
    },
    {
      id: 'color-correction',
      title: 'Color Correction',
      category: '🎬 Editing Tools',
      description: 'Balance color tones, correct white levels, and shift color temperatures.',
      icon: '🎨',
      active: true,
      link: '/tools/color-correction',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['R/G/B Channel Tune', 'Temperature Warmth Shift', 'Color Wheel Grids'],
    },
    {
      id: 'brightness-contrast',
      title: 'Brightness & Contrast',
      category: '🎬 Editing Tools',
      description: 'Adjust the luminance and standard contrast levels of video clips.',
      icon: '☀️',
      active: true,
      link: '/tools/brightness-contrast',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Precision Sliders', 'Histogram Graph Check', 'Realtime Canvas Filter'],
    },
    {
      id: 'saturation-adjustment',
      title: 'Saturation Adjustment',
      category: '🎬 Editing Tools',
      description: 'Enhance color depth or convert videos to black and white.',
      icon: '🌈',
      active: true,
      link: '/tools/saturation-adjustment',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Saturation Scale Slider', 'Vibrance Protect Skintone', 'Monochrome Converter'],
    },
    {
      id: 'video-stabilizer',
      title: 'Video Stabilizer',
      category: '🎬 Editing Tools',
      description: 'Smooth out shaky camera movements using localized motion vector analysis.',
      icon: '⚖️',
      active: true,
      link: '/tools/video-stabilizer',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Motion Vector Smooth', 'Margin Auto-Cropper', 'Warp Stabilizer Mode'],
    },
    {
      id: 'video-denoiser',
      title: 'Video Denoiser',
      category: '🎬 Editing Tools',
      description: 'Filter out digital noise and grain artifacts from low-light video clips.',
      icon: '🔇',
      active: true,
      link: '/tools/video-denoiser',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Spatial Grain Filter', 'Temporal Frame Merge', 'Luminance Denoise Level'],
    },
    {
      id: 'ai-video-enhancer',
      title: 'AI Video Enhancer',
      category: '🎬 Editing Tools',
      description: 'Enhance details, texture patterns, sharpness, and quality in videos using AI.',
      icon: '✨',
      active: true,
      link: '/tools/ai-video-enhancer',
      badge: 'AI Model',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Frame Detail Recovery', 'HDR Expansion Mode', 'Intelligent Color Boosting'],
    },

    // Social Media Tools
    {
      id: 'youtube-shorts-maker',
      title: 'YouTube Shorts Maker',
      category: '📱 Social Media Tools',
      description: 'Crop, trim, and format standard horizontal videos into YouTube Shorts format (9:16).',
      icon: '🟥',
      active: true,
      link: '/tools/youtube-shorts-maker',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['9:16 Vertical Cropper', 'Shorts Duration Lock', 'Title Overlay Presets'],
    },
    {
      id: 'instagram-reel-maker',
      title: 'Instagram Reel Maker',
      category: '📱 Social Media Tools',
      description: 'Format videos for Instagram Reels with matching aspect ratios, music mixes, and safe zones.',
      icon: '📸',
      active: true,
      link: '/tools/instagram-reel-maker',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Reel Grid Overlays', 'Audio Sync Assistance', 'Fast Export Speed'],
    },
    {
      id: 'tiktok-video-resizer',
      title: 'TikTok Video Resizer',
      category: '📱 Social Media Tools',
      description: 'Resize and reframe videos for TikTok with safe zone preview guidelines.',
      icon: '🎵',
      active: true,
      link: '/tools/tiktok-video-resizer',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Safe Area Masking', 'Reframing Keyframes', 'Auto Padding Modes'],
    },
    {
      id: 'facebook-video-resizer',
      title: 'Facebook Video Resizer',
      category: '📱 Social Media Tools',
      description: 'Optimize videos for Facebook feeds (4:5, 1:1) and story templates.',
      icon: '🔵',
      active: true,
      link: '/tools/facebook-video-resizer',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Aspect Presets (1:1, 4:5)', 'Page Post Safe Zones', 'Optimized Metadata'],
    },
    {
      id: 'linkedin-video-resizer',
      title: 'LinkedIn Video Resizer',
      category: '📱 Social Media Tools',
      description: 'Convert videos into standard landscape or square ratios tailored for LinkedIn posts.',
      icon: '💼',
      active: true,
      link: '/tools/linkedin-video-resizer',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Aspect Adjuster', 'Bitrate Scaling limits', 'Professional Title Slides'],
    },
    {
      id: 'snapchat-video-converter',
      title: 'Snapchat Video Converter',
      category: '📱 Social Media Tools',
      description: 'Prepare videos for Snapchat Stories with direct 9:16 cropping and audio formatting.',
      icon: '🟡',
      active: true,
      link: '/tools/snapchat-video-converter',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['9:16 Reframing', 'Audio Compression Fit', 'Fast Browser Encode'],
    },
    {
      id: 'pinterest-video-converter',
      title: 'Pinterest Video Converter',
      category: '📱 Social Media Tools',
      description: 'Resize and encode videos for Pinterest Pins and Story formats.',
      icon: '📌',
      active: true,
      link: '/tools/pinterest-video-converter',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Pinterest Aspect Preset', 'Cover Photo Selector', 'Compact size exports'],
    },
    {
      id: 'social-media-safe-zone',
      title: 'Safe Zone Previewer',
      category: '📱 Social Media Tools',
      description: 'Preview UI overlays for TikTok, IG Reels, and YouTube Shorts over your video.',
      icon: '🛡️',
      active: true,
      link: '/tools/social-media-safe-zone',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Interactive UI Overlay', 'Multi-Platform Toggles', 'Export with Guides option'],
    },

    // GIF Tools
    {
      id: 'video-to-gif',
      title: 'Video to GIF',
      category: '🎞️ GIF Tools',
      description: 'Convert video files or trim ranges into highly-optimized animated GIFs.',
      icon: '🎞️',
      active: true,
      link: '/tools/video-to-gif',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Frame Rate Control', 'Color Dithering algorithms', 'Auto-looping output'],
    },
    {
      id: 'gif-to-video',
      title: 'GIF to Video',
      category: '🎞️ GIF Tools',
      description: 'Convert looping animated GIF files into clean MP4 or WebM video format files.',
      icon: '🎬',
      active: true,
      link: '/tools/gif-to-video',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['MP4 & WebM Support', 'H.264 Video Codec', 'Smooth FPS Scaling'],
    },
    {
      id: 'gif-compressor',
      title: 'GIF Compressor',
      category: '🎞️ GIF Tools',
      description: 'Compress and optimize GIF files to minimize file sizes for web performance.',
      icon: '🗜️',
      active: true,
      link: '/tools/gif-compressor',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Color Reduction levels', 'Lossy LZW compression', 'Dimension scaling'],
    },
    {
      id: 'gif-resizer',
      title: 'GIF Resizer',
      category: '🎞️ GIF Tools',
      description: 'Resize animated GIF heights and widths, preserving the active frame timings.',
      icon: '📏',
      active: true,
      link: '/tools/gif-resizer',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Width/Height Inputs', 'Aspect Ratio Lock', 'Preserved Frame Delay'],
    },
    {
      id: 'gif-cropper',
      title: 'GIF Cropper',
      category: '🎞️ GIF Tools',
      description: 'Crop bounding areas from animated GIFs to select specific content segments.',
      icon: '✂️',
      active: true,
      link: '/tools/gif-cropper',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Canvas Crop Regions', 'Aspect Constraints', 'Frame-by-frame integrity'],
    },
    {
      id: 'gif-speed-controller',
      title: 'GIF Speed Controller',
      category: '🎞️ GIF Tools',
      description: 'Speed up or slow down animation frame delay rates in GIF files.',
      icon: '⏱️',
      active: true,
      link: '/tools/gif-speed-controller',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Frame Delay Slider', 'Playback Speeds (0.5x - 4x)', 'Realtime loop checks'],
    },
    {
      id: 'gif-optimizer',
      title: 'GIF Optimizer',
      category: '🎞️ GIF Tools',
      description: 'Apply advanced frame optimization strategies to drop redundant pixels.',
      icon: '✨',
      active: true,
      link: '/tools/gif-optimizer',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Frame Difference Stripping', 'Transparency optimization', 'Color palette limiters'],
    },

    // AI Video Tools
    {
      id: 'ai-subtitle-generator-video',
      title: 'AI Subtitle Generator',
      category: '🤖 AI Video Tools',
      description: 'Transcribe audio tracks from video files using high-precision speech-to-text models.',
      icon: '💬',
      active: true,
      link: '/tools/ai-subtitle-generator-video',
      badge: 'AI Model',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Advanced Audio Transcription', 'Multi-language Recognition', 'VTT/SRT File Export'],
    },
    {
      id: 'ai-caption-generator',
      title: 'AI Caption Generator',
      category: '🤖 AI Video Tools',
      description: 'Create engaging animated subtitles and social captions for social videos.',
      icon: '✏️',
      active: true,
      link: '/tools/ai-caption-generator',
      badge: 'AI Model',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Aesthetic caption layouts', 'Intelligent emoji matching', 'Auto-word splitting'],
    },
    {
      id: 'ai-video-summarizer',
      title: 'AI Video Summarizer',
      category: '🤖 AI Video Tools',
      description: 'Parse video transcripts and outline structural summaries and action points.',
      icon: '📝',
      active: true,
      link: '/tools/ai-video-summarizer',
      badge: 'AI Model',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Auto Transcribing Parse', 'Segment Summaries', 'Actionable Highlights output'],
    },
    {
      id: 'ai-scene-detection',
      title: 'AI Scene Detection',
      category: '🤖 AI Video Tools',
      description: 'Detect visual scene shifts and cut boundaries automatically inside videos.',
      icon: '🎞️',
      active: true,
      link: '/tools/ai-scene-detection',
      badge: 'AI Model',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Histogram Change Check', 'Scene Split timestamps', 'Batch Trim points export'],
    },
    {
      id: 'ai-highlight-generator',
      title: 'AI Highlight Generator',
      category: '🤖 AI Video Tools',
      description: 'Analyze visual content and transcript to extract the most engaging moments.',
      icon: '⭐',
      active: true,
      link: '/tools/ai-highlight-generator',
      badge: 'AI Model',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Action Climax detection', 'Dialogue importance analysis', 'Auto-clip highlight clips'],
    },
    {
      id: 'ai-background-removal',
      title: 'AI Background Removal',
      category: '🤖 AI Video Tools',
      description: 'Remove backgrounds or isolate subjects from videos without physical green screens.',
      icon: '👤',
      active: true,
      link: '/tools/ai-background-removal',
      badge: 'AI Model',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Subject Segmentation Mask', 'Alpha Matted boundaries', 'Custom BG replacements'],
    },
    {
      id: 'ai-green-screen',
      title: 'AI Green Screen',
      category: '🤖 AI Video Tools',
      description: 'Key out specific background solid colors and swap in new video/image backgrounds.',
      icon: '🟢',
      active: true,
      link: '/tools/ai-green-screen',
      badge: 'AI Model',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Color Range keying', 'Spill Suppression adjustments', 'Alpha Matte smoothing'],
    },
    {
      id: 'ai-voiceover',
      title: 'AI Voiceover',
      category: '🤖 AI Video Tools',
      description: 'Generate high-quality natural speech voiceovers from script text to sync with video.',
      icon: '🎙️',
      active: true,
      link: '/tools/ai-voiceover',
      badge: 'AI Model',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Multi-character Voices', 'Pitch & Speed Tuner', 'Timeline sync adjustments'],
    },
    {
      id: 'ai-lip-sync',
      title: 'AI Lip Sync',
      category: '🤖 AI Video Tools',
      description: 'Animate and align mouth movement in video to match new voice tracks.',
      icon: '👄',
      active: true,
      link: '/tools/ai-lip-sync',
      badge: 'AI Model',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Mouth landmark alignment', 'Audio Wave sync checks', 'Dynamic face warping'],
    },
    {
      id: 'ai-face-blur',
      title: 'AI Face Blur',
      category: '🤖 AI Video Tools',
      description: 'Detect, track, and blur specific faces inside motion videos automatically.',
      icon: '👤',
      active: true,
      link: '/tools/ai-face-blur',
      badge: 'AI Model',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Multi-face tracking', 'Dynamic mask sizing', 'Blur intensity presets'],
    },
    {
      id: 'ai-object-removal',
      title: 'AI Object Removal',
      category: '🤖 AI Video Tools',
      description: 'Inpaint and erase moving objects or pedestrians from video clips.',
      icon: '📴',
      active: true,
      link: '/tools/ai-object-removal',
      badge: 'AI Model',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Object masking brush', 'Temporal frame filling', 'Flow-aware interpolation'],
    },
    {
      id: 'ai-auto-zoom',
      title: 'AI Auto Zoom',
      category: '🤖 AI Video Tools',
      description: 'Follow subjects and zoom in automatically on visual focal points in a video.',
      icon: '🔍',
      active: true,
      link: '/tools/ai-auto-zoom',
      badge: 'AI Model',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Subject Tracking focus', 'Cinematic zoom paths', 'Resolution preservation limits'],
    },
    {
      id: 'ai-video-upscaler',
      title: 'AI Video Upscaler',
      category: '🤖 AI Video Tools',
      description: 'Upscale low-resolution videos to HD or 4K with deep learning frame enhancement.',
      icon: '🚀',
      active: true,
      link: '/tools/ai-video-upscaler',
      badge: 'AI Model',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Super Resolution models', 'Edge sharpening filters', 'Noise Reduction pipeline'],
    },
    {
      id: 'ai-colorizer',
      title: 'AI Colorizer',
      category: '🤖 AI Video Tools',
      description: 'Colorize black and white archival video footage automatically using AI models.',
      icon: '🎨',
      active: true,
      link: '/tools/ai-colorizer',
      badge: 'AI Model',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Consistent color grading', 'Auto palette selections', 'Historical correction curves'],
    },
    {
      id: 'ai-noise-reduction',
      title: 'AI Noise Reduction',
      category: '🤖 AI Video Tools',
      description: 'Isolate spoken dialogue and cancel ambient noise or wind noise using AI voice filters.',
      icon: '🔇',
      active: true,
      link: '/tools/ai-noise-reduction',
      badge: 'AI Model',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Spectral voice filter', 'Gain profile adjustments', 'Ambient sweep cancellation'],
    },

    // Audio for Videos
    {
      id: 'extract-mp3',
      title: 'Extract MP3',
      category: '🎧 Audio for Videos',
      description: 'Isolate the background audio track from video files and export it as an MP3.',
      icon: '🎧',
      active: true,
      link: '/tools/extract-mp3',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Custom MP3 Bitrates', 'ID3 Metadata tagging', 'Fast client extraction'],
    },
    {
      id: 'replace-audio',
      title: 'Replace Audio',
      category: '🎧 Audio for Videos',
      description: 'Mute the original sound of a video and swap in a completely new audio track.',
      icon: '🔄',
      active: true,
      link: '/tools/replace-audio',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Original track replacement', 'Synchronized frame overlay', 'No transcoding delays'],
    },
    {
      id: 'audio-sync',
      title: 'Audio Sync',
      category: '🎧 Audio for Videos',
      description: 'Shift audio offset timings forward or backward to correct delay discrepancies.',
      icon: '🔗',
      active: true,
      link: '/tools/audio-sync',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Millisecond delay shifts', 'Waveform audio checker', 'Live sync check play'],
    },
    {
      id: 'remove-bg-noise',
      title: 'Remove Background Noise',
      category: '🎧 Audio for Videos',
      description: 'Remove background hums, street noises, and mic interference from video audio.',
      icon: '🔇',
      active: true,
      link: '/tools/remove-bg-noise',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['High-pass audio filter', 'Noise gate threshold settings', 'Realtime waveform graphs'],
    },
    {
      id: 'normalize-volume',
      title: 'Normalize Volume',
      category: '🎧 Audio for Videos',
      description: 'Normalize loudness levels across video clips to prevent clipping audio peaks.',
      icon: '🔊',
      active: true,
      link: '/tools/normalize-volume',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Loudness normalization (LUFS)', 'Peak gain adjustments', 'Distortion prevention'],
    },
    {
      id: 'fade-in-out-audio',
      title: 'Fade In/Out Audio',
      category: '🎧 Audio for Videos',
      description: 'Add smooth volume fades to the beginning and end of a video soundtrack.',
      icon: '📉',
      active: true,
      link: '/tools/fade-in-out-audio',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Adjustable Fade timers', 'Linear/Exponential curves', 'Visual volume map'],
    },
    {
      id: 'add-music-track',
      title: 'Add Music',
      category: '🎧 Audio for Videos',
      description: 'Overlay royalty-free audio tracks or custom songs into your video files.',
      icon: '🎵',
      active: true,
      link: '/tools/add-music-track',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Adjustable Volume slider', 'Trim audio timeline', 'Loop background track'],
    },
    {
      id: 'voice-changer',
      title: 'Voice Changer',
      category: '🎧 Audio for Videos',
      description: 'Apply funny pitch shifts and voice effects to spoken tracks in a video.',
      icon: '🗣️',
      active: true,
      link: '/tools/voice-changer',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Pitch & frequency shifts', 'Presets (Robot, Helium, Echo)', 'Realtime audio preview'],
    },
    {
      id: 'text-to-speech-video',
      title: 'Text to Speech',
      category: '🎧 Audio for Videos',
      description: 'Type out messages and convert them to AI spoken tracks aligned with video frames.',
      icon: '📝',
      active: true,
      link: '/tools/text-to-speech-video',
      badge: 'AI Model',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Natural voice synthesis', 'Pitch & Speed tuner', 'Multiple language accents'],
    },
    {
      id: 'speech-to-text-video',
      title: 'Speech to Text',
      category: '🎧 Audio for Videos',
      description: 'Transcribe voice elements inside video clips into copyable TXT files.',
      icon: '🔤',
      active: true,
      link: '/tools/speech-to-text-video',
      badge: 'AI Model',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Speech to text transcript', 'Word-by-word timestamping', 'Copyable editor output'],
    },

    // Format Conversion
    {
      id: 'mp4-to-avi',
      title: 'MP4 → AVI',
      category: '📺 Format Conversion',
      description: 'Convert standard MP4 videos into high-compatibility AVI files.',
      icon: '🎞️',
      active: true,
      link: '/tools/mp4-to-avi',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Container conversion', 'High quality preservation', 'Fast processing speed'],
    },
    {
      id: 'avi-to-mp4',
      title: 'AVI → MP4',
      category: '📺 Format Conversion',
      description: 'Convert AVI format videos to MP4 with efficient H.264 compression.',
      icon: '🎞️',
      active: true,
      link: '/tools/avi-to-mp4',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Modern H.264 encoding', 'Greatly reduced size', 'Universal compatibility'],
    },
    {
      id: 'mp4-to-mov',
      title: 'MP4 → MOV',
      category: '📺 Format Conversion',
      description: 'Convert MP4 videos into Apple QuickTime MOV files for editing programs.',
      icon: '🎞️',
      active: true,
      link: '/tools/mp4-to-mov',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Apple QuickTime format', 'Optimal editing parameters', 'Lossless compression options'],
    },
    {
      id: 'mov-to-mp4',
      title: 'MOV → MP4',
      category: '📺 Format Conversion',
      description: 'Convert MOV video files into widely supported MP4 video files.',
      icon: '🎞️',
      active: true,
      link: '/tools/mov-to-mp4',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Format conversion', 'Highly optimized size', 'Immediate browser download'],
    },
    {
      id: 'mkv-to-mp4',
      title: 'MKV → MP4',
      category: '📺 Format Conversion',
      description: 'Transcode Matroska MKV files into highly-compatible MP4 files.',
      icon: '🎞️',
      active: true,
      link: '/tools/mkv-to-mp4',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Track Selection support', 'Subtitles integration', 'Universal play compatibility'],
    },
    {
      id: 'webm-to-mp4',
      title: 'WebM → MP4',
      category: '📺 Format Conversion',
      description: 'Convert light WebM animations and screen recordings to standard MP4.',
      icon: '🎞️',
      active: true,
      link: '/tools/webm-to-mp4',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['H.264 Transcoding', 'Pixel-perfect translation', 'Adjustable output sizes'],
    },
    {
      id: 'mp4-to-webm',
      title: 'MP4 → WebM',
      category: '📺 Format Conversion',
      description: 'Convert MP4 videos into high-efficiency VP9 WebM files for websites.',
      icon: '🌐',
      active: true,
      link: '/tools/mp4-to-webm',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['VP8/VP9 web codecs', 'Alpha transparency support', 'Ultra light filesize'],
    },
    {
      id: 'mp4-to-gif-convert',
      title: 'MP4 → GIF',
      category: '📺 Format Conversion',
      description: 'Convert MP4 video clips into lightweight, auto-playing animated GIF files.',
      icon: '🎞️',
      active: true,
      link: '/tools/mp4-to-gif-convert',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Color dithering settings', 'Trim segment select', 'Variable frame rates'],
    },
    {
      id: 'gif-to-mp4-convert',
      title: 'GIF → MP4',
      category: '📺 Format Conversion',
      description: 'Convert animated GIF loops to HTML5-friendly MP4 files.',
      icon: '🎞️',
      active: true,
      link: '/tools/gif-to-mp4-convert',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['H.264 video compression', 'Looping configurations', 'Compact web formatting'],
    },
    {
      id: 'mp4-to-mp3-convert',
      title: 'MP4 → MP3',
      category: '📺 Format Conversion',
      description: 'Rip audio streams from MP4 videos directly to audio MP3 files.',
      icon: '🎵',
      active: true,
      link: '/tools/mp4-to-mp3-convert',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Digital audio extraction', 'Bitrate settings (128-320kbps)', 'Fast browser download'],
    },

    // Optimization Tools
    {
      id: 'reduce-file-size-video',
      title: 'Reduce File Size',
      category: '⚙️ Optimization Tools',
      description: 'Compress video sizes with variable bitrate optimizations.',
      icon: '🗜️',
      active: true,
      link: '/tools/reduce-file-size-video',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Size Slider controller', 'Codecs optimizations', 'Quality verification preview'],
    },
    {
      id: 'compress-whatsapp',
      title: 'Compress for WhatsApp',
      category: '⚙️ Optimization Tools',
      description: 'Fit video files exactly within WhatsApp size limits (16MB/64MB).',
      icon: '💬',
      active: true,
      link: '/tools/compress-whatsapp',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['16MB limits ceiling', 'Auto audio compression', 'Standard format parameters'],
    },
    {
      id: 'compress-email',
      title: 'Compress for Email',
      category: '⚙️ Optimization Tools',
      description: 'Shrink video file sizes to fit within standard email attachments (25MB limits).',
      icon: '✉️',
      active: true,
      link: '/tools/compress-email',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['25MB attachment limits', 'Resolution scaling factor', 'Immediate file download'],
    },
    {
      id: 'compress-instagram',
      title: 'Compress for Instagram',
      category: '⚙️ Optimization Tools',
      description: 'Encode videos to exact specifications required for IG uploads.',
      icon: '📸',
      active: true,
      link: '/tools/compress-instagram',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Instagram Codec tuning', 'Aspect constraint check', 'Optimal bitrates selector'],
    },
    {
      id: 'compress-youtube',
      title: 'Compress for YouTube',
      category: '⚙️ Optimization Tools',
      description: 'Format videos for optimal fast uploads on YouTube streams.',
      icon: '🟥',
      active: true,
      link: '/tools/compress-youtube',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['H.264 profile target', 'Audio sample match (48khz)', 'Bitrate recommendations'],
    },
    {
      id: 'compress-discord',
      title: 'Compress for Discord',
      category: '⚙️ Optimization Tools',
      description: 'Shrink video file sizes to fit Discord free/Nitro upload ceilings (8MB/25MB/50MB).',
      icon: '👾',
      active: true,
      link: '/tools/compress-discord',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['8MB file limits', 'Fast transcoder compression', 'Audio bitrate scaling'],
    },
    {
      id: 'compress-lossless',
      title: 'Compress Without Loss',
      category: '⚙️ Optimization Tools',
      description: 'Remove metadata and structure overheads without lowering visual video quality.',
      icon: '💎',
      active: true,
      link: '/tools/compress-lossless',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Metadata stripping blocks', 'Lossless compression profiles', 'Codec structure cleaning'],
    },
    {
      id: 'batch-compress',
      title: 'Batch Video Compression',
      category: '⚙️ Optimization Tools',
      description: 'Upload multiple files and compress them using uniform presets concurrently.',
      icon: '🗂️',
      active: true,
      link: '/tools/batch-compress',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Multi-file upload queue', 'Unified preset processing', 'Batch ZIP downloads'],
    },

    // Recording Tools
    {
      id: 'screen-recorder',
      title: 'Screen Recorder',
      category: '📹 Recording Tools',
      description: 'Record your desktop screen or individual browser tabs directly from your browser.',
      icon: '🖥️',
      active: true,
      link: '/tools/screen-recorder',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Chrome DisplayCapture API', 'System Audio recording', '1080p WebM encoding'],
    },
    {
      id: 'webcam-recorder',
      title: 'Webcam Recorder',
      category: '📹 Recording Tools',
      description: 'Record video feeds from your device webcams with matching audio feeds.',
      icon: '📹',
      active: true,
      link: '/tools/webcam-recorder',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['MediaDevices webcam capture', 'Audio source selections', 'Instant local playback'],
    },
    {
      id: 'screen-webcam-recorder',
      title: 'Screen + Webcam Recorder',
      category: '📹 Recording Tools',
      description: 'Record desktop screen and webcam feeds overlays (Picture in Picture) simultaneously.',
      icon: '👥',
      active: true,
      link: '/tools/screen-webcam-recorder',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Picture-in-Picture webcam', 'Custom overlays layout', 'System & Mic audio mix'],
    },
    {
      id: 'audio-recorder',
      title: 'Audio Recorder',
      category: '📹 Recording Tools',
      description: 'Record voice notes or system sounds and export them to MP3 files.',
      icon: '🎙️',
      active: true,
      link: '/tools/audio-recorder',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Microphone Capture capture', 'Volume level animation', 'Clean MP3 exports'],
    },
    {
      id: 'voice-recorder',
      title: 'Voice Recorder',
      category: '📹 Recording Tools',
      description: 'Isolate vocal range signals and capture clean speech audio files.',
      icon: '🗣️',
      active: true,
      link: '/tools/voice-recorder',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Vocal frequency filter', 'Echo cancellation tuning', 'Automatic Gain Control'],
    },
    {
      id: 'online-camera-test',
      title: 'Online Camera Test',
      category: '📹 Recording Tools',
      description: 'Test connected webcam resolution capacities, FPS configurations, and colors.',
      icon: '📷',
      active: true,
      link: '/tools/online-camera-test',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Resolution auto-detect', 'Frame rate diagnostics', 'RGB sensor calibration'],
    },
    {
      id: 'microphone-test',
      title: 'Microphone Test',
      category: '📹 Recording Tools',
      description: 'Diagnose connected microphones, check input levels, and map audio frequencies.',
      icon: '🎙️',
      active: true,
      link: '/tools/microphone-test',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Input dB monitor', 'Frequency visual analyzer', 'Latency measurements check'],
    },

    // Utility Tools
    {
      id: 'video-metadata-viewer',
      title: 'Video Metadata Viewer',
      category: '📂 Utility Tools',
      description: 'Inspect internal metadata tags, codecs, frame counts, bitrates in video files.',
      icon: '📄',
      active: true,
      link: '/tools/video-metadata-viewer',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Codec structure details', 'Encoder system tags', 'Audio track descriptors'],
    },
    {
      id: 'remove-video-metadata',
      title: 'Remove Metadata',
      category: '📂 Utility Tools',
      description: 'Wipe all GPS geolocation, camera details, and tags from video files to protect privacy.',
      icon: '🧼',
      active: true,
      link: '/tools/remove-video-metadata',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Wipe GPS tags', 'Remove encoder brandings', 'Clean size headers'],
    },
    {
      id: 'thumbnail-generator',
      title: 'Thumbnail Generator',
      category: '📂 Utility Tools',
      description: 'Select frames from video timeline and export them as JPEG/PNG thumbnails.',
      icon: '🖼️',
      active: true,
      link: '/tools/thumbnail-generator',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Timeline frame capture', 'Aesthetic font additions', 'PNG/JPEG export standards'],
    },
    {
      id: 'thumbnail-extractor',
      title: 'Thumbnail Extractor',
      category: '📂 Utility Tools',
      description: 'Extract cover images embedded in video files or YouTube video URLs.',
      icon: '📸',
      active: true,
      link: '/tools/thumbnail-extractor',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Extract poster frame', 'YouTube URL parser', 'Max Resolution image downloads'],
    },
    {
      id: 'thumbnail-downloader',
      title: 'Thumbnail Downloader',
      category: '📂 Utility Tools',
      description: 'Download video thumbnails in multiple resolution scales instantly.',
      icon: '📥',
      active: true,
      link: '/tools/thumbnail-downloader',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['HD/SD/Web resolutions', 'One-click save format', 'Batch cover downloads'],
    },
    {
      id: 'video-duration-checker',
      title: 'Video Duration Checker',
      category: '📂 Utility Tools',
      description: 'Calculate cumulative duration sums of multiple video file queues.',
      icon: '⏱️',
      active: true,
      link: '/tools/video-duration-checker',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Batch file queue parse', 'Cumulative duration sum', 'Export duration sheet report'],
    },
    {
      id: 'video-frame-extractor',
      title: 'Video Frame Extractor',
      category: '📂 Utility Tools',
      description: 'Extract individual raw frames sequentially or by time divisions from video clips.',
      icon: '🎞️',
      active: true,
      link: '/tools/video-frame-extractor',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Export frame series', 'Adjustable frame step interval', 'Zip bundle download'],
    },
    {
      id: 'frames-to-video',
      title: 'Convert Frames to Video',
      category: '📂 Utility Tools',
      description: 'Stitch ordered image frame directories into standard MP4/WebM video files.',
      icon: '🎬',
      active: true,
      link: '/tools/frames-to-video',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Upload image series', 'Frame rate configuration', 'WebM rendering outputs'],
    },

    // Creator Tools
    {
      id: 'intro-maker',
      title: 'Intro Maker',
      category: '🎨 Creator Tools',
      description: 'Generate beautiful video intros with customized branding and animation presets.',
      icon: '🎬',
      active: true,
      link: '/tools/intro-maker',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Intro templates', 'Logo image overlays', 'Creative title text animations'],
    },
    {
      id: 'outro-maker',
      title: 'Outro Maker',
      category: '🎨 Creator Tools',
      description: 'Design ending credits and Call to Action screen overlays for social channels.',
      icon: '🎬',
      active: true,
      link: '/tools/outro-maker',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Endscreen templates', 'Social handle icons overlays', 'Smooth ending audio fades'],
    },
    {
      id: 'logo-animation-maker',
      title: 'Logo Animation Maker',
      category: '🎨 Creator Tools',
      description: 'Animate raw logo SVG/PNG images with custom hover and entrance actions.',
      icon: '🎨',
      active: true,
      link: '/tools/logo-animation-maker',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Aesthetic animation preset', 'Transparency transparency preserve', 'Looping motion paths'],
    },
    {
      id: 'slideshow-maker',
      title: 'Slideshow Maker',
      category: '🎨 Creator Tools',
      description: 'Create musical video slideshows from static digital photos.',
      icon: '🖼️',
      active: true,
      link: '/tools/slideshow-maker',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Photo transition sliders', 'Music sync controls', 'Dynamic pan-zoom (Ken Burns)'],
    },
    {
      id: 'photo-to-video',
      title: 'Photo to Video',
      category: '🎨 Creator Tools',
      description: 'Convert a single digital photo into a video file of customizable duration.',
      icon: '🖼️',
      active: true,
      link: '/tools/photo-to-video',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Duration setting slider', 'Ken Burns zooming effects', 'Direct MP4 creation'],
    },
    {
      id: 'video-collage-maker',
      title: 'Video Collage Maker',
      category: '🎨 Creator Tools',
      description: 'Stitch and position multiple video clips playing in split-screen grids.',
      icon: '🗂️',
      active: true,
      link: '/tools/video-collage-maker',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Grid template selector', 'Per-cell audio volume controls', 'Border spacing adjustments'],
    },
    {
      id: 'video-montage-creator',
      title: 'Video Montage Creator',
      category: '🎨 Creator Tools',
      description: 'Combine short video highlights together synced to soundtrack beats.',
      icon: '🎞️',
      active: true,
      link: '/tools/video-montage-creator',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Music beat analyzer', 'Auto-clip alignment tool', 'Crossfade transition preset'],
    },
    {
      id: 'video-meme-maker',
      title: 'Video Meme Maker',
      category: '🎨 Creator Tools',
      description: 'Add top/bottom bold text overlays to videos to create memes.',
      icon: '🤡',
      active: true,
      link: '/tools/video-meme-maker',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Impact font meme style', 'Meme layout canvas templates', 'GIF and MP4 exports'],
    },
    {
      id: 'cinematic-bars',
      title: 'Cinematic Bars',
      category: '🎨 Creator Tools',
      description: 'Add classic aspect ratio black bars (e.g. 21:9 letterbox) to videos.',
      icon: '📺',
      active: true,
      link: '/tools/cinematic-bars',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Aspect ratio guides (2.35:1)', 'Interactive height sliders', 'Solid black overlay margins'],
    },
    {
      id: 'video-border-creator',
      title: 'Video Border Creator',
      category: '🎨 Creator Tools',
      description: 'Add custom colored, decorative, or blurred borders around your video frame.',
      icon: '🖼️',
      active: true,
      link: '/tools/video-border-creator',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Border width slider', 'Color palettes & blur fills', 'Canvas background scaling'],
    },

    // YouTube Creator Tools
    {
      id: 'youtube-thumbnail-maker',
      title: 'YouTube Thumbnail Maker',
      category: '📺 YouTube Creator Tools',
      description: 'Create high-clickrate YouTube thumbnails with canvas editors and presets.',
      icon: '🖼️',
      active: true,
      link: '/tools/youtube-thumbnail-maker',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['1280x720 canvas guides', 'Drop shadow text additions', 'Accent border frames'],
    },
    {
      id: 'yt-thumbnail-downloader',
      title: 'Thumbnail Downloader',
      category: '📺 YouTube Creator Tools',
      description: 'Extract and save thumbnails from any YouTube URL in high definition.',
      icon: '📥',
      active: true,
      link: '/tools/yt-thumbnail-downloader',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Quick URL parsing', 'Max Quality image extraction', 'Webp/Jpg download modes'],
    },
    {
      id: 'shorts-downloader',
      title: 'Shorts Downloader',
      category: '📺 YouTube Creator Tools',
      description: 'Parse links and download YouTube Shorts videos locally.',
      icon: '📥',
      active: true,
      link: '/tools/shorts-downloader',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Direct link resolution', 'Quality format selector', 'Audio extraction track option'],
    },
    {
      id: 'playlist-downloader',
      title: 'Playlist Downloader',
      category: '📺 YouTube Creator Tools',
      description: 'Parse YouTube playlist links to generate individual video downloads.',
      icon: '🗂️',
      active: true,
      link: '/tools/playlist-downloader',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Scan complete playlist URLs', 'Video queue download list', 'Batch metadata save'],
    },
    {
      id: 'transcript-generator',
      title: 'Transcript Generator',
      category: '📺 YouTube Creator Tools',
      description: 'Transcribe YouTube audio streams to editable document script files.',
      icon: '📝',
      active: true,
      link: '/tools/transcript-generator',
      badge: 'AI Model',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Speech to text transcript', 'Paragraph structure outlines', 'Speaker diarization'],
    },
    {
      id: 'transcript-downloader',
      title: 'Transcript Downloader',
      category: '📺 YouTube Creator Tools',
      description: 'Fetch and download existing captions from public video URLs.',
      icon: '📥',
      active: true,
      link: '/tools/transcript-downloader',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['TXT/SRT formatting options', 'Fetch multi-lingual tracks', 'Timestamp cleaner options'],
    },
    {
      id: 'timestamp-generator',
      title: 'Timestamp Generator',
      category: '📺 YouTube Creator Tools',
      description: 'Generate timestamp lists for video chapters quickly.',
      icon: '⏱️',
      active: true,
      link: '/tools/timestamp-generator',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Interactive timing clicks', 'Format (00:00 - Title)', 'Copy timestamp script'],
    },
    {
      id: 'chapters-generator',
      title: 'Chapters Generator',
      category: '📺 YouTube Creator Tools',
      description: 'Analyze video transcripts to generate standard chapter lists automatically.',
      icon: '📖',
      active: true,
      link: '/tools/chapters-generator',
      badge: 'AI Model',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Transcribe segment splits', 'Auto chapter titles suggestions', 'Optimized YouTube structures'],
    },
    {
      id: 'ai-description-generator',
      title: 'AI Description Generator',
      category: '📺 YouTube Creator Tools',
      description: 'Create engaging SEO optimized video descriptions using AI models.',
      icon: '✍️',
      active: true,
      link: '/tools/ai-description-generator',
      badge: 'AI Model',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['SEO keywords integration', 'Timestamps outline formats', 'Social handles inclusion blocks'],
    },
    {
      id: 'ai-tags-generator',
      title: 'AI Tags Generator',
      category: '📺 YouTube Creator Tools',
      description: 'Generate highly searchable tags and SEO keywords based on video topics.',
      icon: '🏷️',
      active: true,
      link: '/tools/ai-tags-generator',
      badge: 'AI Model',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['SEO search volume check', 'Relevance tag rankings', 'Copy tag text blocks'],
    },
    {
      id: 'ai-title-generator',
      title: 'AI Title Generator',
      category: '📺 YouTube Creator Tools',
      description: 'Generate click-worthy YouTube titles using AI model recommendations.',
      icon: '💡',
      active: true,
      link: '/tools/ai-title-generator',
      badge: 'AI Model',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['High CTR title versions', 'Aesthetic emojis inclusion', 'Tone profiles selector'],
    },
    {
      id: 'youtube-thumbnail-analyzer',
      title: 'Thumbnail Analyzer',
      category: '📺 YouTube Creator Tools',
      description: 'Analyze thumbnails contrast, text size, and focal balance metrics.',
      icon: '🔍',
      active: true,
      link: '/tools/youtube-thumbnail-analyzer',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Luminance contrast score', 'Typography readable checks', 'Simulated blur testing'],
    },

    // Streaming Tools
    {
      id: 'webcam-background-blur',
      title: 'Webcam Background Blur',
      category: '🎥 Streaming Tools',
      description: 'Blur your webcam backgrounds in real-time for stream sessions.',
      icon: '🫧',
      active: true,
      link: '/tools/webcam-background-blur',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Body segment tracking', 'WebGL blur shaders', 'Direct virtual camera output option'],
    },
    {
      id: 'virtual-background',
      title: 'Virtual Background',
      category: '🎥 Streaming Tools',
      description: 'Swap webcam backgrounds with image/video overlays client-side.',
      icon: '🖼️',
      active: true,
      link: '/tools/virtual-background',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Body segment mask', 'Static image background select', 'WebGL overlay compositing'],
    },
    {
      id: 'live-stream-overlay',
      title: 'Live Stream Overlay Maker',
      category: '🎥 Streaming Tools',
      description: 'Design stream overlay frames with customizable layout borders.',
      icon: '📺',
      active: true,
      link: '/tools/live-stream-overlay',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['1080p canvas overlay grids', 'Stream tag text overlays', 'Export PNG transparencies'],
    },
    {
      id: 'obs-overlay-creator',
      title: 'OBS Overlay Creator',
      category: '🎥 Streaming Tools',
      description: 'Generate web-source HTML widgets for OBS overlay designs.',
      icon: '🖥️',
      active: true,
      link: '/tools/obs-overlay-creator',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Interactive widgets design', 'Websocket connection check', 'Copy overlay source URLs'],
    },
    {
      id: 'webcam-effects',
      title: 'Webcam Effects',
      category: '🎥 Streaming Tools',
      description: 'Apply WebGL filters and face masks to webcam streams.',
      icon: '🎭',
      active: true,
      link: '/tools/webcam-effects',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Aesthetic LUT webcam filters', 'Funny distortion effects', 'Realtime frame rate sync'],
    },

    // Mobile Optimization
    {
      id: 'compress-android',
      title: 'Compress for Android',
      category: '📱 Mobile Optimization',
      description: 'Encode and compress videos optimized for Android devices compatibility.',
      icon: '🤖',
      active: true,
      link: '/tools/compress-android',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['H.264 video codec configurations', 'AAC audio encoding parameters', 'Optimal container sizing'],
    },
    {
      id: 'compress-iphone',
      title: 'Compress for iPhone',
      category: '📱 Mobile Optimization',
      description: 'Format videos for QuickTime and iOS device playback compatibility.',
      icon: '📱',
      active: true,
      link: '/tools/compress-iphone',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['iOS codec profiles', 'HEVC / H.264 formats selectors', 'Optimized metadata structures'],
    },
    {
      id: 'hevc-mp4-converter',
      title: 'Convert HEVC ↔ MP4',
      category: '📱 Mobile Optimization',
      description: 'Transcode modern Apple HEVC/H.265 videos into high-compatibility H.264 MP4 videos.',
      icon: '🔄',
      active: true,
      link: '/tools/hevc-mp4-converter',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['HEVC H.265 transcoding', 'Fast browser decode processing', 'File size estimations check'],
    },
    {
      id: 'hdr-sdr-converter',
      title: 'Convert HDR → SDR',
      category: '📱 Mobile Optimization',
      description: 'Tone map high dynamic range HDR videos into standard SDR formats.',
      icon: '🔆',
      active: true,
      link: '/tools/hdr-sdr-converter',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Intelligent tone mapping algorithms', 'Gamut color translation maps', 'Preserved details control'],
    },
    {
      id: 'rotate-phone-videos',
      title: 'Rotate Phone Videos',
      category: '📱 Mobile Optimization',
      description: 'Fix portrait orientation tags in mobile recorded video files.',
      icon: '🔄',
      active: true,
      link: '/tools/rotate-phone-videos',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Orientation tag rewrites', '90-degree rotate overlays', 'No re-encoding required option'],
    },
    {
      id: 'vertical-horizontal-video',
      title: 'Vertical ↔ Horizontal',
      category: '📱 Mobile Optimization',
      description: 'Add blur backgrounds or padding to swap landscape and vertical aspects.',
      icon: '📱',
      active: true,
      link: '/tools/vertical-horizontal-video',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Blur padding generation', '16:9 ↔ 9:16 aspect mapping', 'Intelligent cropping guides'],
    },

    // Professional Tools
    {
      id: 'batch-video-converter',
      title: 'Batch Video Converter',
      category: '💼 Professional Tools',
      description: 'Transcode lists of video files concurrently into multiple target formats.',
      icon: '🗂️',
      active: true,
      link: '/tools/batch-video-converter',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Batch file queuing', 'Multiple formats targets settings', 'Concurrent conversions engine'],
    },
    {
      id: 'batch-video-compressor',
      title: 'Batch Compressor',
      category: '💼 Professional Tools',
      description: 'Shrink multiple files concurrently using identical size targets.',
      icon: '🗜️',
      active: true,
      link: '/tools/batch-video-compressor',
      badge: 'Client-Side',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Batch queue upload', 'Automatic size mapping preset', 'Concurrent compress channels'],
    },
    {
      id: 'batch-watermark',
      title: 'Batch Watermark',
      category: '💼 Professional Tools',
      description: 'Apply branding logo images or text watermarks to multiple videos simultaneously.',
      icon: '🛡️',
      active: true,
      link: '/tools/batch-watermark',
      badge: 'Client-Side',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Overlay placement settings', 'Multi-video queue processing', 'Zip download outputs'],
    },
    {
      id: 'batch-rename-videos',
      title: 'Batch Rename Videos',
      category: '💼 Professional Tools',
      description: 'Rename large list of video files using smart naming schemas and offsets.',
      icon: '🏷️',
      active: true,
      link: '/tools/batch-rename-videos',
      badge: 'Client-Side',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Index counters format', 'Find & replace naming schemas', 'Fast batch export metadata'],
    },
    {
      id: 'batch-resolution-changer',
      title: 'Batch Resolution Changer',
      category: '💼 Professional Tools',
      description: 'Change dimensions of multiple videos to a single standard size in batch.',
      icon: '📺',
      active: true,
      link: '/tools/batch-resolution-changer',
      badge: 'Client-Side',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Batch scaling grid preset', 'Aspect constraints locks', 'Fast batch downloads'],
    },
    {
      id: 'batch-fps-converter',
      title: 'Batch FPS Converter',
      category: '💼 Professional Tools',
      description: 'Convert frame rate configurations of multiple files in a single sweep.',
      icon: '📊',
      active: true,
      link: '/tools/batch-fps-converter',
      badge: 'Client-Side',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['FPS target settings', 'Skip frame adjustments', 'Concurrently batched channels'],
    },

    // Trending AI Features
    {
      id: 'ai-clip-generator',
      title: 'AI Clip Generator',
      category: '🔥 Trending AI Features',
      description: 'Extract engaging highlight clips from long-form raw footage using AI models.',
      icon: '🎬',
      active: true,
      link: '/tools/ai-clip-generator',
      badge: 'AI Model',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Dialogue highlight detect', 'Cinematic clip framing cuts', 'Auto-clip timestamp exports'],
    },
    {
      id: 'ai-shorts-generator',
      title: 'AI Shorts Generator',
      category: '🔥 Trending AI Features',
      description: 'Auto-detect main subjects and extract 9:16 vertical shorts from horizontal videos.',
      icon: '📱',
      active: true,
      link: '/tools/ai-shorts-generator',
      badge: 'AI Model',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Face focal reframing', 'Key dialogue subtitles generation', 'Optimal timing clips'],
    },
    {
      id: 'ai-reel-generator',
      title: 'AI Reel Generator',
      category: '🔥 Trending AI Features',
      description: 'Turn standard clips into cinematic reels with auto-beat synchronization.',
      icon: '📸',
      active: true,
      link: '/tools/ai-reel-generator',
      badge: 'AI Model',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Music beats sync checks', 'Dynamic transition speeds', 'Visual effects integrations'],
    },
    {
      id: 'ai-podcast-clips',
      title: 'AI Podcast Clips',
      category: '🔥 Trending AI Features',
      description: 'Extract highlights from video podcasts focusing frames on active speakers.',
      icon: '🎙️',
      active: true,
      link: '/tools/ai-podcast-clips',
      badge: 'AI Model',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Active speaker zoom', 'Intelligent speech cuts', 'Auto titles overlay generators'],
    },
    {
      id: 'ai-talking-avatar',
      title: 'AI Talking Avatar',
      category: '🔥 Trending AI Features',
      description: 'Create animated speaking video avatars synced to speech audio files.',
      icon: '👤',
      active: true,
      link: '/tools/ai-talking-avatar',
      badge: 'AI Model',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Lip sync animations', 'Realistic facial blinks', 'Multi-avatar select presets'],
    },
    {
      id: 'ai-eye-contact',
      title: 'AI Eye Contact Correction',
      category: '🔥 Trending AI Features',
      description: 'Adjust eye gaze vectors to make the subject look directly at the camera.',
      icon: '👁️',
      active: true,
      link: '/tools/ai-eye-contact',
      badge: 'AI Model',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Eye tracking models', 'Realtime head pose sync', 'Natural visual gaze checks'],
    },
    {
      id: 'ai-auto-reframe',
      title: 'AI Auto Reframe',
      category: '🔥 Trending AI Features',
      description: 'Keep important subjects centered when changing aspect ratios.',
      icon: '🔍',
      active: true,
      link: '/tools/ai-auto-reframe',
      badge: 'AI Model',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Subject panning logic', 'Automatic scene detection bounds', 'Aspect templates outputs'],
    },
    {
      id: 'ai-silence-remover',
      title: 'AI Silence Remover',
      category: '🔥 Trending AI Features',
      description: 'Cut out dead air and silent pauses from videos automatically.',
      icon: '✂️',
      active: true,
      link: '/tools/ai-silence-remover',
      badge: 'AI Model',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Silence decibel analysis', 'Auto timeline jumpcuts', 'Adjustable pause margins'],
    },
    {
      id: 'ai-filler-word-remover',
      title: 'AI Filler Word Remover',
      category: '🔥 Trending AI Features',
      description: 'Detect and cut out vocal filler words (like "um", "ah", "like") from speech.',
      icon: '📴',
      active: true,
      link: '/tools/ai-filler-word-remover',
      badge: 'AI Model',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Filler word speech detect', 'Precision wave audio jumpcuts', 'Smooth video transition blends'],
    },
    {
      id: 'ai-b-roll-suggestions',
      title: 'AI B-Roll Suggestions',
      category: '🔥 Trending AI Features',
      description: 'Suggest relevant B-Roll footage based on video speech transcripts.',
      icon: '💡',
      active: true,
      link: '/tools/ai-b-roll-suggestions',
      badge: 'AI Model',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Transcript theme keyword check', 'Footage tags recommendation', 'Visual editing place guides'],
    },
    {
      id: 'ai-thumbnail-generator',
      title: 'AI Thumbnail Generator',
      category: '🔥 Trending AI Features',
      description: 'Detect high-expression moments in video to construct thumbnail designs.',
      icon: '🖼️',
      active: true,
      link: '/tools/ai-thumbnail-generator',
      badge: 'AI Model',
      accentColor: 'rgba(139,92,246,0.15)',
      badgeColor: '#a78bfa',
      features: ['Focal expression scores', 'Text title overlays placement', 'High CTR templates designs'],
    },
    {
      id: 'ai-voice-cloning',
      title: 'AI Voice Cloning',
      category: '🔥 Trending AI Features',
      description: 'Clone vocal profiles from short audio samples to generate customized voiceovers.',
      icon: '🎙️',
      active: true,
      link: '/tools/ai-voice-cloning',
      badge: 'AI Model',
      accentColor: 'rgba(236,72,153,0.15)',
      badgeColor: '#f472b6',
      features: ['Intelligent voice replication', 'Text to speech synthesis', 'Emotional vocal pitch profiles'],
    },
    {
      id: 'ai-video-translator',
      title: 'AI Video Translator',
      category: '🔥 Trending AI Features',
      description: 'Translate speech tracks in videos to other languages with voice synthesis.',
      icon: '🌐',
      active: true,
      link: '/tools/ai-video-translator',
      badge: 'AI Model',
      accentColor: 'rgba(251,146,60,0.15)',
      badgeColor: '#fb923c',
      features: ['Vocal tone translation', 'Sync spoken speeds', 'Multi-lingual outputs formats'],
    },
    {
      id: 'ai-dubbing',
      title: 'AI Dubbing',
      category: '🔥 Trending AI Features',
      description: 'Replace original speaker voices with voice actors translated scripts.',
      icon: '🗣️',
      active: true,
      link: '/tools/ai-dubbing',
      badge: 'AI Model',
      accentColor: 'rgba(59,130,246,0.15)',
      badgeColor: '#60a5fa',
      features: ['Voice translation overlay', 'Speaker timing matching', 'Ambient sound retention'],
    },
    {
      id: 'ai-motion-tracking',
      title: 'AI Motion Tracking',
      category: '🔥 Trending AI Features',
      description: 'Track visual subject coordinates to overlay stickers/texts on paths.',
      icon: '🎯',
      active: true,
      link: '/tools/ai-motion-tracking',
      badge: 'AI Model',
      accentColor: 'rgba(16,185,129,0.15)',
      badgeColor: '#34d399',
      features: ['Coordinate motion paths tracking', 'Object anchors lock', 'Fast keyframe generation'],
    },
  ];

  // Group by category for rendering
  const categories = [...new Set(tools.map(t => t.category))];

  // Category filters
  const CATEGORY_FILTERS = [
    { id: 'all', label: 'All Tools', match: null },
    { id: 'image', label: 'Image', match: '🖼️ Image Tools' },
    { id: 'pdf', label: 'PDF', match: '📄 PDF Tools' },
    { id: 'video', label: 'Video', match: '🎬' },
    { id: 'ai', label: 'AI Tools', match: ['🤖 AI Tools', '🔥 Trending AI Features'] },
    { id: 'audio', label: 'Audio', match: '🎵' },
    { id: 'recording', label: 'Recording', match: '📹 Recording Tools' },
    { id: 'converter', label: 'Converter', match: '🔄' },
    { id: 'developer', label: 'Developer', match: '💻 Developer Tools' },
    { id: 'writing', label: 'Writing', match: '✍️' },
    { id: 'social', label: 'Social Media', match: ['📱 Social Media Tools', '📱 Mobile Optimization'] },
    { id: 'gif', label: 'GIF', match: '🎞️' },
    { id: 'youtube', label: 'YouTube', match: '📺' },
    { id: 'streaming', label: 'Streaming', match: '🎥' },
    { id: 'optimization', label: 'Optimize', match: '⚙️' },
    { id: 'professional', label: 'Pro Tools', match: '💼' },
    { id: 'utilities', label: 'Utilities', match: '🛠️' },
    { id: 'upscaler', label: 'Upscaler', match: null, keyword: 'upscal' },
    { id: 'resizer', label: 'Resizer', match: null, keyword: 'resiz' },
    { id: 'watermark', label: 'Watermark', match: null, keyword: 'watermark' },
    { id: 'compressor', label: 'Compressor', match: null, keyword: 'compress' },
    { id: 'downloader', label: 'Downloader', match: null, keyword: 'download' },
  ];

  // Group filtered tools
  const filteredTools = tools.filter(tool => {
    const textMatch =
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.category.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());

    if (!textMatch) return false;
    if (activeCategories.length === 0) return true;

    return activeCategories.some(activeCatId => {
      const catDef = CATEGORY_FILTERS.find(c => c.id === activeCatId);
      if (!catDef) return false;
      if (catDef.keyword) {
        return (
          tool.title.toLowerCase().includes(catDef.keyword) ||
          tool.description.toLowerCase().includes(catDef.keyword) ||
          tool.id.toLowerCase().includes(catDef.keyword)
        );
      }
      if (!catDef.match) return false;
      const matchArr = Array.isArray(catDef.match) ? catDef.match : [catDef.match];
      return matchArr.some(m => tool.category.startsWith(m) || tool.category.includes(m.replace(/[^a-zA-Z ]/g, '').trim()));
    });
  });

  const toggleCategory = (id) => {
    if (id === 'all') {
      setActiveCategories([]);
      return;
    }
    setActiveCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <>
      <style>{`
        .cat-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 13px; border-radius: 10px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          border: 1px solid rgba(167,139,250,0.18);
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          transition: all 0.18s ease;
          white-space: nowrap;
          user-select: none;
        }
        .cat-chip:hover {
          border-color: rgba(167,139,250,0.5);
          color: #c084fc;
          background: rgba(124,58,237,0.15);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124,58,237,0.2);
        }
        .cat-chip.active {
          background: linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.25));
          border-color: rgba(167,139,250,0.7);
          color: #e879f9;
          box-shadow: 0 0 16px rgba(124,58,237,0.3);
        }
      `}</style>
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid" aria-hidden="true" />

      {/* ─── FULL-WIDTH HEADER ─── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 28px', height: '58px',
        background: 'rgba(5,3,14,0.92)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 24px 0 rgba(0,0,0,0.4)',
      }}>
        {!isScrolled ? (
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* LEFT: brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '17px', fontWeight: '900', background: 'linear-gradient(135deg, #fff 30%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
                MindSuite AI
              </span>
              <span className="header-hub-badge" style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                Productivity Hub
              </span>
            </div>

            {/* RIGHT: version */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '100px', background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(167,139,250,0.18)', fontSize: '12px', fontWeight: '700', color: '#a78bfa', letterSpacing: '0.2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', display: 'inline-block', boxShadow: '0 0 6px #a78bfa' }} />
              v2.1.0
            </div>
          </div>
        ) : (
          /* SEARCH BAR MODE WHEN SCROLLED */
          <div style={{ width: '100%', maxWidth: '700px', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.2s ease-in-out' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search tools..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  boxSizing: 'border-box',
                  padding: '8px 36px 8px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1.5px solid rgba(167, 139, 250, 0.4)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', zIndex: 2
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Header Filter button — icon-only on mobile */}
            <button
              onClick={() => setShowCategoryPanel(v => !v)}
              className="header-filter-btn"
              style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '8px 14px',
                height: '38px',
                boxSizing: 'border-box',
                borderRadius: '10px',
                background: showCategoryPanel || activeCategories.length > 0
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.3))'
                  : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${showCategoryPanel || activeCategories.length > 0 ? 'rgba(167,139,250,0.7)' : 'rgba(167,139,250,0.3)'}`,
                color: showCategoryPanel || activeCategories.length > 0 ? '#c084fc' : '#94a3b8',
                fontSize: '12px', fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: showCategoryPanel ? '0 0 14px rgba(124,58,237,0.3)' : 'none',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <span className="filter-btn-text">Filter</span>
              {activeCategories.length > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: 'rgba(167,139,250,0.35)', fontSize: '9px', color: '#fff', fontWeight: '900'
                }}>{activeCategories.length}</span>
              )}
              <span className="filter-chevron" style={{ fontSize: '9px', transition: 'transform 0.2s', display: 'inline-block', transform: showCategoryPanel ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
            </button>

            {/* Header dropdown panel — fixed just below sticky header, scrolls with page */}
            {showCategoryPanel && isScrolled && (
              <div
                style={{
                  position: 'fixed',
                  top: '58px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  maxWidth: '700px',
                  zIndex: 200,
                  background: 'rgba(5, 3, 14, 0.97)',
                  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(167,139,250,0.25)',
                  borderTop: 'none',
                  borderRadius: '0 0 18px 18px',
                  padding: '16px 20px 20px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                  animation: 'headerFilterPanelIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Browse by Category</span>
                    {activeCategories.length > 0 && (
                      <button onClick={() => setActiveCategories([])} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '10px', cursor: 'pointer', textDecoration: 'underline' }}>Clear all</button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCategoryPanel(false)}
                    style={{ background: 'none', border: 'none', color: '#475569', fontSize: '15px', cursor: 'pointer', lineHeight: 1 }}
                  >✕</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {CATEGORY_FILTERS.map(cat => (
                    <button
                      key={cat.id}
                      className={`cat-chip${(cat.id === 'all' ? activeCategories.length === 0 : activeCategories.includes(cat.id)) ? ' active' : ''}`}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Popular Shortcuts</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['upscaler', 'resizer', 'watermark', 'compressor', 'downloader'].map(id => {
                      const c = CATEGORY_FILTERS.find(x => x.id === id);
                      return (
                        <button
                          key={id}
                          className={`cat-chip${activeCategories.includes(id) ? ' active' : ''}`}
                          onClick={() => toggleCategory(id)}
                        >
                          {c?.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main ref={mainRef} className="chat-area" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
          {/* Hero */}
          <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: 'linear-gradient(90deg, rgba(167,139,250,0.1), rgba(192,132,252,0.1))', border: '1px solid rgba(167,139,250,0.2)', color: '#c084fc', fontSize: '13px', fontWeight: '600', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Unified Productivity Suite
            </div>

            <h1 className="welcome-title" style={{ fontSize: '3rem', lineHeight: '1.2', background: 'linear-gradient(135deg, #fff 30%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              One Workspace.<br />Infinite Utilities.
            </h1>

            {/* Desktop subtitle */}
            <p className="welcome-subtitle hero-desktop-text" style={{ fontSize: '1.1rem', color: '#94a3b8', marginTop: '16px', lineHeight: '1.6' }}>
              Convert images, compress files, split PDFs, transform documents, generate code all running privately in your browser.
            </p>

            {/* Mobile stats — shown only on small screens */}
            <div className="hero-mobile-stats">
              <div className="hero-stat-chip">
                <span className="hero-stat-num">{tools.length}</span>
                <span className="hero-stat-label">Tools</span>
              </div>
              <div className="hero-stat-chip">
                <span className="hero-stat-num">100%</span>
                <span className="hero-stat-label">Private</span>
              </div>
              <div className="hero-stat-chip">
                <span className="hero-stat-num">Free</span>
                <span className="hero-stat-label">Always</span>
              </div>
            </div>
          </div>

          {/* Search Box + Filter */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            marginBottom: '40px',
            position: 'relative',
            opacity: isScrolled ? 0 : 1,
            visibility: isScrolled ? 'hidden' : 'visible',
            transition: 'opacity 0.25s ease, visibility 0.25s ease',
          }}>
            <style>{`
              .filter-btn-text { display: inline; }
              .filter-chevron { display: inline-block; }
              .hero-filter-btn { padding: 14px 18px; min-width: unset; }
              .header-filter-btn { padding: 8px 14px; min-width: unset; }
              @keyframes heroFilterPanelIn {
                from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes headerFilterPanelIn {
                from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.98); }
                to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
              }
              @media (max-width: 600px) {
                .filter-btn-text { display: none !important; }
                .filter-chevron { display: none !important; }
                .hero-filter-btn {
                  padding: 0 !important;
                  width: 54px !important;
                  height: 54px !important;
                  min-width: 54px !important;
                  border-radius: 14px !important;
                  justify-content: center !important;
                  gap: 0 !important;
                }
                .header-filter-btn {
                  padding: 0 !important;
                  width: 38px !important;
                  height: 38px !important;
                  min-width: 38px !important;
                  border-radius: 10px !important;
                  justify-content: center !important;
                  gap: 0 !important;
                }
                .clear-x-btn { right: 60px !important; }
              }
            `}</style>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  className="dashboard-search-input"
                  placeholder="Search tools : PDF, Image, AI, QR Code, Converter..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    height: '54px',
                    boxSizing: 'border-box',
                    padding: '16px 44px 16px 20px',
                    borderRadius: '14px',
                    background: 'rgba(10, 8, 28, 0.75)',
                    border: '1.5px solid rgba(167, 139, 250, 0.3)',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    boxShadow: '0 8px 32px 0 rgba(167, 139, 250, 0.05)',
                    transition: 'all 0.3s',
                    minWidth: 0,
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(167, 139, 250, 0.8)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(167, 139, 250, 0.3)'}
                />
                {search && (
                  <button
                    className="clear-x-btn"
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer', zIndex: 2
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter button */}
              <button
                id="category-filter-btn"
                className="hero-filter-btn"
                onClick={() => setShowCategoryPanel(v => !v)}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  height: '54px',
                  boxSizing: 'border-box',
                  borderRadius: '14px',
                  background: showCategoryPanel || activeCategories.length > 0
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.25))'
                    : 'rgba(10, 8, 28, 0.75)',
                  border: `1.5px solid ${showCategoryPanel || activeCategories.length > 0 ? 'rgba(167,139,250,0.7)' : 'rgba(167,139,250,0.3)'}`,
                  color: showCategoryPanel || activeCategories.length > 0 ? '#c084fc' : '#94a3b8',
                  fontSize: '13px', fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: showCategoryPanel ? '0 0 18px rgba(124,58,237,0.35)' : 'none',
                  letterSpacing: '0.3px',
                  position: 'relative',
                }}
              >
                {/* Funnel icon — always visible */}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                <span className="filter-btn-text">Filter</span>
                {activeCategories.length > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'rgba(167,139,250,0.3)', fontSize: '10px', color: '#fff', fontWeight: '900'
                  }}>{activeCategories.length}</span>
                )}
                <span className="filter-chevron" style={{ fontSize: '10px', marginLeft: '2px', transition: 'transform 0.25s', display: 'inline-block', transform: showCategoryPanel ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>
            </div>

            {/* Active category pills */}
            {activeCategories.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Filtering by:</span>
                {activeCategories.map(id => {
                  const catDef = CATEGORY_FILTERS.find(c => c.id === id);
                  return (
                    <span key={id} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px 4px 8px', borderRadius: '20px',
                      background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(167,139,250,0.35)',
                      color: '#c084fc', fontSize: '12px', fontWeight: '700',
                    }}>
                      {catDef?.label}
                      <button onClick={() => toggleCategory(id)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', padding: '0 0 0 4px', lineHeight: 1 }}>✕</button>
                    </span>
                  );
                })}
                <button onClick={() => setActiveCategories([])} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>Clear all</button>
                <span style={{ fontSize: '12px', color: '#475569' }}>{filteredTools.length} tools</span>
              </div>
            )}

            {/* Category Panel */}
            {showCategoryPanel && !isScrolled && (
              <div
                ref={filterPanelRef}
                style={{
                  position: 'absolute', top: 'calc(100% + 12px)', left: 0, right: 0,
                  zIndex: 100,
                  background: 'rgba(5, 3, 14, 0.96)',
                  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(167,139,250,0.25)',
                  borderRadius: '18px',
                  padding: '20px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(167,139,250,0.08)',
                  animation: 'heroFilterPanelIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >

                <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Browse by Category</span>
                    {activeCategories.length > 0 && (
                      <button onClick={() => setActiveCategories([])} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>Clear all</button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCategoryPanel(false)}
                    style={{ background: 'none', border: 'none', color: '#475569', fontSize: '16px', cursor: 'pointer', lineHeight: 1 }}
                  >✕</button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CATEGORY_FILTERS.map(cat => (
                    <button
                      key={cat.id}
                      className={`cat-chip${(cat.id === 'all' ? activeCategories.length === 0 : activeCategories.includes(cat.id)) ? ' active' : ''}`}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Popular Shortcuts */}
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '10px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Popular Shortcuts</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['upscaler', 'resizer', 'watermark', 'compressor', 'downloader'].map(id => {
                      const c = CATEGORY_FILTERS.find(x => x.id === id);
                      return (
                        <button
                          key={id}
                          className={`cat-chip${activeCategories.includes(id) ? ' active' : ''}`}
                          onClick={() => toggleCategory(id)}
                        >
                          {c?.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Render Sections */}
          {categories.map(cat => {
            const catTools = filteredTools.filter(t => t.category === cat);
            if (catTools.length === 0) return null;
            return (
              <div key={cat} style={{ width: '100%', maxWidth: '1400px', marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#e2e8f0', letterSpacing: '0.5px', whiteSpace: 'nowrap', margin: 0 }}>
                    {cat.replace(/[^\w\s]/g, '').trim()} <span style={{ color: '#64748b', fontWeight: '500' }}>({catTools.length})</span>
                  </h2>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.35), transparent)' }} />
                </div>

                <div className="tools-grid">
                  {catTools.map((tool) => {
                      const isExpanded = !!expandedTools[tool.id];
                      const isWorking = WORKING_TOOLS.has(tool.id) || WORKING_TOOLS.has(tool.link.split('/').pop());
                      return (
                        <div
                          key={tool.id}
                          className={`dashboard-card-active${isExpanded ? ' card-expanded' : ''}`}
                          style={{
                            position: 'relative', borderRadius: '16px',
                            background: 'rgba(10, 8, 28, 0.55)',
                            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                            border: `1px solid ${isExpanded ? 'rgba(167,139,250,0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                            padding: '0',
                            display: 'flex', flexDirection: 'column',
                            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: isExpanded ? '0 16px 40px 0 rgba(124,58,237,0.2)' : '0 4px 24px 0 rgba(0,0,0,0.25)',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Accent glow */}
                          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: `radial-gradient(circle, ${tool.accentColor} 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />

                          {/* COLLAPSED HEADER ROW — always visible, clickable on mobile */}
                          <div
                            className="card-header-row"
                            onClick={() => toggleExpand(tool.id)}
                            style={{
                              display: 'flex', flexDirection: 'column', gap: '8px',
                              padding: '14px 16px', cursor: 'pointer', position: 'relative', zIndex: 1,
                            }}
                          >
                            {/* Top row: badge left, chevron right */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ display: 'inline-block', fontSize: '8px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                {tool.badge}
                              </span>
                              {!isWorking ? (
                                <span className="card-chevron" style={{ fontSize: '11px', color: '#64748b', flexShrink: 0 }}>🔒</span>
                              ) : (
                                <span className="card-chevron" style={{ fontSize: '13px', color: '#a78bfa', flexShrink: 0, transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                              )}
                            </div>

                            {/* Bottom row: title + subtext */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f1f5f9', lineHeight: '1.3' }}>{tool.title}</div>
                                <div style={{ fontSize: '9px', color: tool.badgeColor, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                                  {tool.category.replace(/[^\w\s]|_/g, '').trim()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* EXPANDABLE BODY — always visible on desktop, toggled on mobile */}
                          <div className={`card-body${isExpanded ? ' card-body-open' : ''}`} style={{ padding: '0 20px', position: 'relative', zIndex: 1 }}>
                            <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.55', marginBottom: '14px' }}>{tool.description}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                              {tool.features.map((feature, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', color: '#cbd5e1' }}>
                                  <span style={{ color: tool.badgeColor, fontSize: '10px' }}>✓</span>
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                            {isWorking ? (
                              <a
                                href={tool.link}
                                onClick={(e) => e.stopPropagation()}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.25s ease', cursor: 'pointer', marginBottom: '20px' }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                              >
                                Open Tool →
                              </a>
                            ) : (
                              <a
                                href={tool.link}
                                onClick={(e) => e.stopPropagation()}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#4b5563', fontSize: '13px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.25s ease', cursor: 'pointer', marginBottom: '20px' }}
                                onMouseOver={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                              >
                                🔒 Locked
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}

          {filteredTools.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', margin: '40px 0' }}>
              <span style={{ fontSize: '3rem' }}>🔍</span>
              <h3 style={{ marginTop: '12px' }}>No utilities matching "{search}"</h3>
              <p style={{ fontSize: '14px', color: '#64748b' }}>Try looking for generic names like PDF, image, AI or converter.</p>
            </div>
          )}

          <footer style={{ marginTop: '60px', paddingBottom: '48px', textAlign: 'center', padding: '0 16px 48px' }}>
            {/* Responsive footer styles */}
            <style>{`
              .footer-portfolio-card {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                padding: 12px 24px;
                border-radius: 100px;
                background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08));
                border: 1px solid rgba(167,139,250,0.25);
                text-decoration: none;
                transition: all 0.25s ease;
                max-width: 100%;
              }
              .footer-portfolio-card:hover {
                background: linear-gradient(135deg,rgba(124,58,237,0.25),rgba(6,182,212,0.15));
                border-color: rgba(167,139,250,0.55);
                box-shadow: 0 4px 24px rgba(124,58,237,0.3);
              }
              .footer-dev-name {
                font-weight: 700;
                font-size: 15px;
                background: linear-gradient(135deg, #fff 30%, #a78bfa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                white-space: nowrap;
              }
              .footer-dev-role {
                font-size: 11px;
                color: #64748b;
                font-weight: 500;
                white-space: nowrap;
              }
              .footer-portfolio-badge {
                font-size: 10px;
                padding: 3px 9px;
                border-radius: 6px;
                background: rgba(6,182,212,0.1);
                border: 1px solid rgba(6,182,212,0.25);
                color: #06b6d4;
                font-weight: 700;
                letter-spacing: 0.5px;
                white-space: nowrap;
              }
              @media (max-width: 480px) {
                .footer-portfolio-card {
                  flex-direction: column;
                  align-items: center;
                  border-radius: 20px;
                  padding: 20px 28px;
                  gap: 10px;
                  width: 100%;
                  max-width: 280px;
                }
                .footer-dev-name { font-size: 17px; }
                .footer-dev-role { font-size: 12px; }
                .footer-portfolio-badge {
                  font-size: 11px;
                  padding: 5px 16px;
                  border-radius: 8px;
                  width: 100%;
                  text-align: center;
                }
              }
            `}</style>

            {/* Divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.25), transparent)', marginBottom: '32px' }} />

            {/* Label */}
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '11px', color: '#475569', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '600' }}>
                Designed &amp; Built by
              </span>
            </div>

            {/* Portfolio card */}
            <a
              href="https://portfolio-harsh-vashishth.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-portfolio-card"
            >
              {/* Avatar */}
              <span style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0,
                boxShadow: '0 0 14px rgba(124,58,237,0.5)',
              }}>⚡</span>

              {/* Text group */}
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <span className="footer-dev-name">Harsh Vashishth</span>
                <span className="footer-dev-role">Full-Stack Developer</span>
              </span>

              {/* CTA badge */}
              <span className="footer-portfolio-badge">Portfolio ↗</span>
            </a>

            <p style={{ marginTop: '24px', color: '#334155', fontSize: '12px', lineHeight: '1.6' }}>
              MindSuite AI · Local Intelligent Workspace<br />
              Built for Developers &amp; Creators
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
