'use client';
import { useState } from 'react';

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [expandedTools, setExpandedTools] = useState({});

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
  ];

  // Group filtered tools
  const filteredTools = tools.filter(tool =>
    tool.title.toLowerCase().includes(search.toLowerCase()) ||
    tool.category.toLowerCase().includes(search.toLowerCase()) ||
    tool.description.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category for rendering
  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <>
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
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', height: '58px',
        background: 'rgba(5,3,14,0.92)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 24px 0 rgba(0,0,0,0.4)',
      }}>
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
      </header>

      <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="chat-area" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
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
              Convert images, compress files, split PDFs, transform documents, generate code — all running privately in your browser.
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

          {/* Search Box */}
          <div style={{ width: '100%', maxWidth: '600px', marginBottom: '40px', position: 'relative' }}>
            <input
              type="text"
              className="dashboard-search-input"
              placeholder="Search tools — PDF, Image, AI, QR Code, Converter..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'rgba(10, 8, 28, 0.75)',
                border: '1.5px solid rgba(167, 139, 250, 0.3)',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                boxShadow: '0 8px 32px 0 rgba(167, 139, 250, 0.05)',
                transition: 'all 0.3s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(167, 139, 250, 0.8)'}
              onBlur={e => e.target.style.borderColor = 'rgba(167, 139, 250, 0.3)'}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer'
                }}
              >
                ✕
              </button>
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
                              {/* Chevron — only shown on mobile via CSS */}
                              <span className="card-chevron" style={{ fontSize: '13px', color: '#a78bfa', flexShrink: 0, transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
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
                            <a
                              href={tool.link}
                              onClick={(e) => e.stopPropagation()}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.25s ease', cursor: 'pointer', marginBottom: '20px' }}
                              onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                              Open Tool →
                            </a>
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

          <footer style={{ marginTop: '40px', color: '#64748b', fontSize: '13px', textAlign: 'center', paddingBottom: '32px' }}>
            MindSuite AI · Local Intelligent Workspace · Built for Developers & Creators
          </footer>
        </main>
      </div>
    </>
  );
}
