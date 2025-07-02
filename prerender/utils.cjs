const fs = require('fs');
const path = require('path');

// Helper function to collect all categories from the tree
const collectAllCategories = (categoryNode, categories = []) => {
  if (!categoryNode) return categories;
  
  // Add current category (skip root category 209)
  if (categoryNode.id !== 209) {
    categories.push({
      id: categoryNode.id,
      name: categoryNode.name,
      seoName: categoryNode.seoName,
      parentId: categoryNode.parentId
    });
  }
  
  // Recursively add children
  if (categoryNode.children) {
    for (const child of categoryNode.children) {
      collectAllCategories(child, categories);
    }
  }
  
  return categories;
};

// Advanced CSS minification and optimization
const optimizeCss = (cssContent) => {
  if (!cssContent || typeof cssContent !== 'string') {
    return '';
  }

  try {
    let optimized = cssContent
      // Remove comments (/* ... */)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove unnecessary whitespace but preserve structure
      .replace(/\s*{\s*/g, '{')
      .replace(/;\s*}/g, '}')
      .replace(/}\s*/g, '}')
      .replace(/,\s*/g, ',')
      .replace(/:\s*/g, ':')
      .replace(/;\s*/g, ';')
      // Remove empty rules
      .replace(/[^}]*\{\s*\}/g, '')
      // Normalize multiple spaces/tabs/newlines
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim();

    // Remove redundant semicolons before closing braces
    optimized = optimized.replace(/;+}/g, '}');
    
    // Remove empty media queries
    optimized = optimized.replace(/@media[^{]*\{\s*\}/g, '');
    
    return optimized;
  } catch (error) {
    console.warn(`⚠️ CSS optimization failed: ${error.message}`);
    return cssContent; // Return original if optimization fails
  }
};

// Extract critical CSS selectors (basic implementation)
const extractCriticalCss = (cssContent, criticalSelectors = []) => {
  if (!cssContent || !criticalSelectors.length) {
    return { critical: '', nonCritical: cssContent };
  }

  try {
    const rules = cssContent.match(/[^{}]+\{[^{}]*\}/g) || [];
    let critical = '';
    let nonCritical = '';

    rules.forEach(rule => {
      const selector = rule.split('{')[0].trim();
      const isCritical = criticalSelectors.some(criticalSel => {
        return selector.includes(criticalSel) || 
               selector.includes('body') || 
               selector.includes('html') ||
               selector.includes(':root') ||
               selector.includes('@font-face') ||
               selector.includes('@import');
      });

      if (isCritical) {
        critical += rule;
      } else {
        nonCritical += rule;
      }
    });

    return {
      critical: optimizeCss(critical),
      nonCritical: optimizeCss(nonCritical)
    };
  } catch (error) {
    console.warn(`⚠️ Critical CSS extraction failed: ${error.message}`);
    return { critical: cssContent, nonCritical: '' };
  }
};

const writeCombinedCssFile = (globalCssCollection, outputDir) => {
  const combinedCss = Array.from(globalCssCollection).join('\n');
  
  // Optimize the combined CSS
  const optimizedCss = optimizeCss(combinedCss);
  
  const cssFilePath = path.resolve(__dirname, '..', outputDir, 'prerender.css');
  fs.writeFileSync(cssFilePath, optimizedCss);
  
  const originalSize = combinedCss.length;
  const optimizedSize = optimizedCss.length;
  const savings = originalSize - optimizedSize;
  const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;
  
  console.log(`✅ Combined CSS file written to ${cssFilePath}`);
  console.log(`   - Total CSS rules: ${globalCssCollection.size}`);
  console.log(`   - Original size: ${Math.round(originalSize / 1024)}KB`);
  console.log(`   - Optimized size: ${Math.round(optimizedSize / 1024)}KB`);
  console.log(`   - Space saved: ${Math.round(savings / 1024)}KB (${savingsPercent}%)`);
};

module.exports = {
  collectAllCategories,
  writeCombinedCssFile,
  optimizeCss,
  extractCriticalCss
}; 