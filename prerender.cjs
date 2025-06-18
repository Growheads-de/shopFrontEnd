require('@babel/register')({
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react'
  ],
  extensions: ['.js', '.jsx'],
  ignore: [/node_modules/]
});

// Minimal globals for socket.io-client only - no JSDOM to avoid interference
global.window = {}; // Minimal window object for productCache
global.navigator = { userAgent: 'node.js' };
// Use Node.js URL constructor for React Router compatibility
global.URL = require('url').URL;
global.Blob = class MockBlob { constructor(data, options) { this.data = data; this.type = options?.type || ''; } };

// Import modules
const fs = require('fs');
const path = require('path');
const React = require('react');
const io = require('socket.io-client');

// Import split modules
const config = require('./prerender/config.cjs');
const { renderPage } = require('./prerender/renderer.cjs');
const { collectAllCategories, writeCombinedCssFile } = require('./prerender/utils.cjs');
const { 
  generateProductMetaTags, 
  generateProductJsonLd,
  generateCategoryJsonLd,
  generateHomepageJsonLd,
  generateSitemapJsonLd,
  generateXmlSitemap,
  generateRobotsTxt
} = require('./prerender/seo.cjs');
const {
  fetchCategoryProducts,
  fetchProductDetails,
  saveProductImages
} = require('./prerender/data-fetching.cjs');

// Import components
const PrerenderCategory = require('./src/PrerenderCategory.js').default;
const PrerenderProduct = require('./src/PrerenderProduct.js').default;

// Import static page components
const Datenschutz = require('./src/pages/Datenschutz.js').default;
const Impressum = require('./src/pages/Impressum.js').default;
const Batteriegesetzhinweise = require('./src/pages/Batteriegesetzhinweise.js').default;
const Widerrufsrecht = require('./src/pages/Widerrufsrecht.js').default;
const Sitemap = require('./src/pages/Sitemap.js').default;
const AGB = require('./src/pages/AGB.js').default;

const renderApp = async (categoryData, socket) => {
  if (categoryData) {
    global.window.productCache = { 'categoryTree_209': { categoryTree: categoryData, timestamp: Date.now() } };
  } else {
    global.window.productCache = {};
  }

  // Helper to call renderPage with config
  const render = (component, location, filename, description, metaTags = '', needsRouter = false) => {
    return renderPage(component, location, filename, description, metaTags, needsRouter, config);
  };

  console.log('🏠 Rendering home page...');
  const PrerenderHome = require('./src/PrerenderHome.js').default;
  const homeComponent = React.createElement(PrerenderHome, null);
  const homeFilename = config.isProduction ? 'index.html' : 'index.prerender.html';
  const homeJsonLd = generateHomepageJsonLd();
  const homeSuccess = render(homeComponent, '/', homeFilename, 'Home page', homeJsonLd, true);

  if (!homeSuccess) {
    process.exit(1);
  }

  // Render static pages
  console.log('\n📄 Rendering static pages...');
  
  const staticPages = [
    { component: Datenschutz, path: '/datenschutz', filename: 'datenschutz', description: 'Datenschutz page' },
    { component: Impressum, path: '/impressum', filename: 'impressum', description: 'Impressum page' },
    { component: Batteriegesetzhinweise, path: '/batteriegesetzhinweise', filename: 'batteriegesetzhinweise', description: 'Batteriegesetzhinweise page' },
    { component: Widerrufsrecht, path: '/widerrufsrecht', filename: 'widerrufsrecht', description: 'Widerrufsrecht page' },
    { component: Sitemap, path: '/sitemap', filename: 'sitemap', description: 'Sitemap page' },
    { component: AGB, path: '/agb', filename: 'agb', description: 'AGB page' }
  ];

  let staticPagesRendered = 0;
  for (const page of staticPages) {
    const pageComponent = React.createElement(page.component, null);
    let metaTags = '';
    
    // Special handling for Sitemap page to include category data
    if (page.filename === 'sitemap' && categoryData) {
      const allCategories = collectAllCategories(categoryData);
      metaTags = generateSitemapJsonLd(allCategories);
    }
    
    const success = render(pageComponent, page.path, page.filename, page.description, metaTags, true);
    if (success) {
      staticPagesRendered++;
    }
  }
  
  console.log(`✅ Successfully rendered ${staticPagesRendered}/${staticPages.length} static pages!`);

  // Collect all products for product page generation
  const allProducts = new Set();

  // Generate category pages if we have category data
  if (categoryData && socket) {
    console.log('\n📂 Rendering category pages with product data...');
    const allCategories = collectAllCategories(categoryData);
    console.log(`Found ${allCategories.length} categories to render`);

    let categoryPagesRendered = 0;
    let categoriesWithProducts = 0;
    
    for (const category of allCategories) {
      // Skip categories without seoName
      if (!category.seoName) {
        console.log(`⚠️ Skipping category "${category.name}" (ID: ${category.id}) - no seoName`);
        continue;
      }
      
      try {
        console.log(`\n🔍 Fetching products for category "${category.name}" (ID: ${category.id})...`);
        
        let productData = null;
        try {
          productData = await fetchCategoryProducts(socket, category.id);
          console.log(`   ✅ Found ${productData.products ? productData.products.length : 0} products`);
          
          if (productData.products && productData.products.length > 0) {
            categoriesWithProducts++;
            
            // Collect products for individual page generation
            productData.products.forEach(product => {
              if (product.seoName) {
                allProducts.add(product.seoName);
              }
            });
            
            // Fetch and save product images
            await saveProductImages(socket, productData.products, category.name, config.outputDir);
            
            // Cache the product data for this category
            const cacheKey = `categoryProducts_${category.id}`;
            global.window.productCache[cacheKey] = {
              categoryData: productData,
              timestamp: Date.now()
            };
          }
        } catch (productError) {
          console.log(`   ⚠️ No products found: ${productError.message}`);
        }

        const categoryComponent = React.createElement(PrerenderCategory, {
          categoryId: category.id,
          categoryName: category.name,
          categorySeoName: category.seoName,
          productData: productData
        });
        
        const filename = `Kategorie/${category.seoName}`;
        const location = `/Kategorie/${category.seoName}`;
        const description = `Category "${category.name}" (ID: ${category.id})`;
        const categoryJsonLd = generateCategoryJsonLd(category, productData?.products || []);
        
        const success = render(categoryComponent, location, filename, description, categoryJsonLd, true);
        if (success) {
          categoryPagesRendered++;
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to render category ${category.id} (${category.name}):`, error);
      }
    }
    
    console.log(`\n🎉 Successfully rendered ${categoryPagesRendered} category pages!`);
    console.log(`📦 ${categoriesWithProducts} categories had product data`);

    // Generate individual product pages
    if (allProducts.size > 0) {
      console.log(`\n📦 Rendering ${allProducts.size} individual product pages...`);
      let productPagesRendered = 0;
      
      for (const productSeoName of allProducts) {
        try {
          console.log(`🔍 Fetching product details for product ${productSeoName}...`);
          
          const productDetails = await fetchProductDetails(socket, productSeoName);
          console.log(`   ✅ Product: ${productDetails.product.name}`);
          console.log(`   📝 Product seoName from response: ${productDetails.product.seoName}`);
          console.log(`   📝 Original seoName: ${productSeoName}`);
          
          // Use the original seoName if the product response doesn't have it
          const actualSeoName = productDetails.product.seoName || productSeoName;
          
          const productComponent = React.createElement(PrerenderProduct, {
            productData: productDetails
          });
          
          const filename = `Artikel/${actualSeoName}`;
          const location = `/Artikel/${actualSeoName}`;
          const description = `Product "${productDetails.product.name}" (seoName: ${productSeoName})`;
          const metaTags = generateProductMetaTags({
            ...productDetails.product, 
            seoName: actualSeoName
          });
          const jsonLdScript = generateProductJsonLd({
            ...productDetails.product, 
            seoName: actualSeoName
          });
          const combinedMetaTags = metaTags + '\n' + jsonLdScript;
          
          const success = render(productComponent, location, filename, description, combinedMetaTags, true);
          if (success) {
            productPagesRendered++;
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error) {
          console.error(`❌ Failed to render product ${productSeoName}:`, error);
        }
      }
      
      console.log(`\n🎉 Successfully rendered ${productPagesRendered} product pages!`);
    }
  } else {
    console.log('⚠️ No category data or socket available - skipping category page generation');
  }

  // Write the combined CSS file after all pages are rendered
  writeCombinedCssFile(config.globalCssCollection, config.outputDir);

  // Generate XML sitemap with all rendered pages
  console.log('\n🗺️ Generating XML sitemap...');
  const allCategories = categoryData ? collectAllCategories(categoryData) : [];
  const allProductsArray = Array.from(allProducts);
  const xmlSitemap = generateXmlSitemap(allCategories, allProductsArray);
  
  const sitemapPath = path.resolve(__dirname, config.outputDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xmlSitemap);
  
  console.log(`✅ XML sitemap generated: ${sitemapPath}`);
  console.log(`   - Homepage: 1 URL`);
  console.log(`   - Static pages: 6 URLs`);
  console.log(`   - Category pages: ${allCategories.length} URLs`);
  console.log(`   - Product pages: ${allProductsArray.length} URLs`);
  console.log(`   - Total URLs: ${1 + 6 + allCategories.length + allProductsArray.length}`);

  // Generate robots.txt
  console.log('\n🤖 Generating robots.txt...');
  const robotsTxtContent = generateRobotsTxt();
  const robotsTxtPath = path.resolve(__dirname, config.outputDir, 'robots.txt');
  fs.writeFileSync(robotsTxtPath, robotsTxtContent);
  
  console.log(`✅ robots.txt generated: ${robotsTxtPath}`);
  console.log(`   - Allows all crawlers`);
  console.log(`   - References sitemap.xml`);
  console.log(`   - Includes crawl-delay directive`);
};

const fetchCategoryDataAndRender = () => {
  const socketUrl = "http://127.0.0.1:9303";
  console.log(`Connecting to socket at ${socketUrl} to fetch categories...`);
  
  const timeout = setTimeout(() => {
    console.error('Error: Prerender script timed out after 15 seconds. Check backend connectivity.');
    process.exit(1);
  }, 15000);

  const socket = io(socketUrl, {
    path: '/socket.io/',
    transports: ['polling', 'websocket'], // Using polling first is more robust
    reconnection: false,
    timeout: 10000
  });

  socket.on('connect', () => {
    console.log('Socket connected. Emitting "categoryList"...');
    socket.emit('categoryList', { categoryId: 209 }, async (response) => {
      clearTimeout(timeout);
      if (response && response.categoryTree) {
        console.log('Successfully fetched category data.');
        await renderApp(response.categoryTree, socket);
      } else {
        console.error('Error: Invalid category data received.', response);
        await renderApp(null, socket);
      }
      socket.disconnect();
    });
  });

  socket.on('connect_error', async (err) => {
    clearTimeout(timeout);
    console.error('Socket connection error:', err);
    await renderApp(null, null);
    socket.disconnect();
  });

  socket.on('error', async (err) => {
    clearTimeout(timeout);
    console.error('Socket error:', err);
    await renderApp(null, null);
    socket.disconnect();
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${reason}`);
    clearTimeout(timeout); 
  });
};

fetchCategoryDataAndRender(); 