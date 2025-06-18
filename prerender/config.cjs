const fs = require('fs');
const path = require('path');

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';
const outputDir = isProduction ? 'dist' : 'public';

console.log(`🔧 Prerender mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`📁 Output directory: ${outputDir}`);

// Function to get webpack entrypoints for production
const getWebpackEntrypoints = () => {
  if (!isProduction) return { js: [], css: [] };
  
  const distPath = path.resolve(__dirname, '..', 'dist');
  const entrypoints = { js: [], css: [] };
  
  try {
    // Look for the main HTML file to extract script and link tags
    const htmlPath = path.join(distPath, 'index.html');
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Extract script tags
      const scriptMatches = htmlContent.match(/<script[^>]*src="([^"]*)"[^>]*><\/script>/g) || [];
      scriptMatches.forEach(match => {
        const srcMatch = match.match(/src="([^"]*)"/);
        if (srcMatch) {
          entrypoints.js.push(srcMatch[1]);
        }
      });
      
      // Extract CSS link tags
      const linkMatches = htmlContent.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
      linkMatches.forEach(match => {
        const hrefMatch = match.match(/href="([^"]*)"/);
        if (hrefMatch) {
          entrypoints.css.push(hrefMatch[1]);
        }
      });
      
      console.log(`📦 Found webpack entrypoints:`);
      console.log(`   JS files: ${entrypoints.js.length} files`);
      console.log(`   CSS files: ${entrypoints.css.length} files`);
    }
  } catch (error) {
    console.warn(`⚠️ Could not read webpack entrypoints: ${error.message}`);
  }
  
  return entrypoints;
};

// Read global CSS styles and fix font paths for prerender
let globalCss = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.css'), 'utf8');
// Fix relative font paths for prerendered HTML (remove ../public to make them relative to public root)
globalCss = globalCss.replace(/url\('\.\.\/public/g, "url('");

// Global CSS collection
const globalCssCollection = new Set();

// Get webpack entrypoints
const webpackEntrypoints = getWebpackEntrypoints();

module.exports = {
  isProduction,
  outputDir,
  getWebpackEntrypoints,
  globalCss,
  globalCssCollection,
  webpackEntrypoints
}; 