/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';

// This script compiles the built Vite app into a single, self-contained HTML file for Google Apps Script.
const distPath = path.join(process.cwd(), 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log("Starting GAS compiler shell...");

if (!fs.existsSync(indexPath)) {
  console.error("Error: dist/index.html not found! Please run 'npm run build' first.");
  process.exit(1);
}

let htmlContent = fs.readFileSync(indexPath, 'utf-8');

// Find all compiled JS files in dist/assets/
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const files = fs.readdirSync(assetsPath);
  
  // Find JS and CSS files
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  console.log(`Found built bundle files: ${jsFiles.length} JS, ${cssFiles.length} CSS`);

  // Inline CSS
  let inlineCss = '';
  for (const cssFile of cssFiles) {
    const cssContent = fs.readFileSync(path.join(assetsPath, cssFile), 'utf-8');
    inlineCss += `\n/* ${cssFile} */\n${cssContent}`;
  }

  // Inline JS
  let inlineJs = '';
  for (const jsFile of jsFiles) {
    const jsContent = fs.readFileSync(path.join(assetsPath, jsFile), 'utf-8');
    // Remove source mapping URLs so script doesn't try to load them in GAS
    const cleanJs = jsContent.replace(/\/\/# sourceMappingURL=.*/g, '');
    inlineJs += `\n// ${jsFile}\n${cleanJs}`;
  }

  // Remove the module script tags and css link tags
  htmlContent = htmlContent.replace(/<link[^>]*rel="stylesheet"[^>]*href="[^"]*(?:\/assets\/[^"]*|\.css)"[^>]*>/gi, '');
  htmlContent = htmlContent.replace(/<script[^>]*type="module"[^>]*src="[^"]*(?:\/assets\/[^"]*|\.js)"[^>]*><\/script>/gi, '');

  // Inject CSS inside head
  if (inlineCss) {
    htmlContent = htmlContent.replace('</head>', `<style>${inlineCss}</style>\n</head>`);
  }

  // Inject JS inside body
  if (inlineJs) {
    htmlContent = htmlContent.replace('</body>', `<script type="module">${inlineJs}</script>\n</body>`);
  }

  // Write compiled single file to root
  fs.writeFileSync(path.join(process.cwd(), 'Index.html'), htmlContent);
  console.log("=========================================================");
  console.log("SUCCESS: Single-file bundle compiled and saved to: /Index.html");
  console.log("You can copy this file directly into the Google Apps Script Index.html tab!");
  console.log("=========================================================");
} else {
  console.error("Error: dist/assets folder not found!");
  process.exit(1);
}
