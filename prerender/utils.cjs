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

const writeCombinedCssFile = (globalCssCollection, outputDir) => {
  const combinedCss = Array.from(globalCssCollection).join('\n');
  const cssFilePath = path.resolve(__dirname, '..', outputDir, 'prerender.css');
  fs.writeFileSync(cssFilePath, combinedCss);
  
  console.log(`✅ Combined CSS file written to ${cssFilePath}`);
  console.log(`   - Total CSS rules: ${globalCssCollection.size}`);
  console.log(`   - Total CSS size: ${combinedCss.length} characters`);
};

module.exports = {
  collectAllCategories,
  writeCombinedCssFile
}; 