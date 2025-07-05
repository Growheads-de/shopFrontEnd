// Import all SEO functions from their respective modules
const {
  generateProductMetaTags,
  generateProductJsonLd,
} = require('./product.cjs');

const {
  generateCategoryJsonLd,
} = require('./category.cjs');

const {
  generateHomepageMetaTags,
  generateHomepageJsonLd,
} = require('./homepage.cjs');

const {
  generateSitemapJsonLd,
  generateXmlSitemap,
} = require('./sitemap.cjs');

const {
  generateKonfiguratorMetaTags,
} = require('./konfigurator.cjs');

const {
  generateRobotsTxt,
  generateProductsXml,
} = require('./feeds.cjs');

const {
  generateLlmsTxt,
  generateCategoryLlmsTxt,
  generateAllCategoryLlmsPages,
} = require('./llms.cjs');

// Export all functions for use in the main application
module.exports = {
  // Product functions
  generateProductMetaTags,
  generateProductJsonLd,
  
  // Category functions
  generateCategoryJsonLd,
  
  // Homepage functions
  generateHomepageMetaTags,
  generateHomepageJsonLd,
  
  // Sitemap functions
  generateSitemapJsonLd,
  generateXmlSitemap,
  
  // Konfigurator functions
  generateKonfiguratorMetaTags,
  
  // Feed/Export functions
  generateRobotsTxt,
  generateProductsXml,
  
  // LLMs/AI functions
  generateLlmsTxt,
  generateCategoryLlmsTxt,
  generateAllCategoryLlmsPages,
}; 