const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace absolute paths with relative paths
  content = content.replace(/href="\/_next/g, 'href="./_next');
  content = content.replace(/src="\/_next/g, 'src="./_next');
  content = content.replace(/file:\/\/\/_next/g, 'file://_next');

  // Remove crossorigin attribute from font preloads (not needed for local files)
  content = content.replace(/crossorigin=""/g, '');
  content = content.replace(/crossOrigin=""/g, '');

  // Add a style tag to ensure initial visibility
  // Override Framer Motion's initial hidden state for Electron
  const visibilityFix = `<style>
    /* Ensure content is visible in Electron */
    body { opacity: 1 !important; }
    [style*="opacity:0"], [style*="opacity: 0"] { 
      opacity: 1 !important; 
      transform: none !important;
    }
  </style></head>`;
  content = content.replace('</head>', visibilityFix);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed paths in: ${filePath}`);
}

function fixCSSFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix paths in CSS files (url() references)
  content = content.replace(/url\(\/_next/g, 'url(../_next');
  content = content.replace(/url\("\/_next/g, 'url("../_next');
  content = content.replace(/url\('\/_next/g, "url('../_next");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed CSS paths in: ${filePath}`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.html')) {
      replaceInFile(filePath);
    } else if (file.endsWith('.css')) {
      fixCSSFile(filePath);
    }
  });
}

// Process the out directory
const outDir = path.join(__dirname, '../out');
if (fs.existsSync(outDir)) {
  console.log('Fixing paths for Electron...');
  processDirectory(outDir);
  console.log('Done!');
} else {
  console.error('Out directory not found!');
  process.exit(1);
}
