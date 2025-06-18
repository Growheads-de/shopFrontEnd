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

const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { StaticRouter } = require('react-router');

const PrerenderCategory = require('./src/PrerenderCategory.js').default;
const PrerenderProduct = require('./src/PrerenderProduct.js').default;
const createEmotionCache = require('./createEmotionCache.js').default;
const { CacheProvider } = require('@emotion/react');
const { ThemeProvider } = require('@mui/material/styles');
const theme = require('./src/theme.js').default;
const createEmotionServer = require('@emotion/server/create-instance').default;

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';
const outputDir = isProduction ? 'dist' : 'public';

console.log(`🔧 Prerender mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`📁 Output directory: ${outputDir}`);

// Function to get webpack entrypoints for production
const getWebpackEntrypoints = () => {
  if (!isProduction) return { js: [], css: [] };
  
  const distPath = path.resolve(__dirname, 'dist');
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
let globalCss = fs.readFileSync(path.resolve(__dirname, 'src', 'index.css'), 'utf8');
// Fix relative font paths for prerendered HTML (remove ../public to make them relative to public root)
globalCss = globalCss.replace(/url\('\.\.\/public/g, "url('");

// The require for socket.io-client MUST be after JSDOM setup
const io = require('socket.io-client');

// Global CSS collection
const globalCssCollection = new Set();

// Get webpack entrypoints
const webpackEntrypoints = getWebpackEntrypoints();

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

const renderPage = (component, location, filename, description, metaTags = '', needsRouter = false) => {
  // Create fresh Emotion cache for each page
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);
  
  const wrappedComponent = needsRouter 
    ? React.createElement(
        StaticRouter,
        { location: location },
        component
      )
    : component;
  
  const pageElement = React.createElement(
    CacheProvider,
    { value: cache },
    React.createElement(
      ThemeProvider,
      { theme: theme },
      wrappedComponent
    )
  );

  let renderedMarkup;
  
  try {
    renderedMarkup = ReactDOMServer.renderToString(pageElement);
    const emotionChunks = extractCriticalToChunks(renderedMarkup);
    
    // Collect CSS from this page
    if (emotionChunks.styles.length > 0) {
      const oldSize = globalCssCollection.size;
      
      emotionChunks.styles.forEach(style => {
        if (style.css) {
          globalCssCollection.add(style.css);
        }
      });
      
      // Check if new styles were added
      if (globalCssCollection.size > oldSize) {
        // Write CSS file immediately when new styles are added
        writeCombinedCssFile();
      }
    }
  } catch (error) {
    console.error(`❌ Rendering failed for ${filename}:`, error);
    return false;
  }

  // Use appropriate template path based on mode
  const templatePath = isProduction 
    ? path.resolve(__dirname, 'dist', 'index.html')
    : path.resolve(__dirname, 'public', 'index.html');
  let template = fs.readFileSync(templatePath, 'utf8');

  // Build CSS and JS tags
  let additionalTags = '';
  
  if (isProduction) {
    // In production, include webpack entrypoints
    webpackEntrypoints.css.forEach(cssFile => {
      additionalTags += `<link rel="stylesheet" href="${cssFile}">`;
    });
    webpackEntrypoints.js.forEach(jsFile => {
      additionalTags += `<script src="${jsFile}"></script>`;
    });
    // Also include prerender CSS in production
    additionalTags += `<link rel="stylesheet" href="/prerender.css">`;
  } else {
    // In development, include prerender CSS
    additionalTags += `<link rel="stylesheet" href="/prerender.css">`;
  }
  
  const globalCssTag = `<style type="text/css">${globalCss}</style>`;
  template = template.replace('</head>', `${globalCssTag}${additionalTags}${metaTags}</head>`);

  const rootDivRegex = /<div id="root"[\s\S]*?>[\s\S]*?<\/div>/;
  const replacementHtml = `<div id="root">${renderedMarkup}</div>`;
  
  let newHtml;
  if (rootDivRegex.test(template)) {
    newHtml = template.replace(rootDivRegex, replacementHtml);
  } else {
    newHtml = template.replace('<body>', `<body>${replacementHtml}`);
  }

  const outputPath = path.resolve(__dirname, outputDir, filename);
  
  // Ensure directory exists for nested paths
  const outputDirPath = path.dirname(outputPath);
  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, newHtml);
  
  console.log(`✅ ${description} prerendered to ${outputPath}`);
  console.log(`   - Markup length: ${renderedMarkup.length} characters`);
  console.log(`   - CSS rules: ${Object.keys(cache.inserted).length}`);
  
  return true;
};

const generateProductMetaTags = (product) => {
  const baseUrl = 'https://seedheads.de'; // Replace with your actual domain
  const productUrl = `${baseUrl}/Artikel/${product.seoName}`;
  const imageUrl = product.pictureList && product.pictureList.trim() 
    ? `${baseUrl}/assets/images/prod${product.pictureList.split(',')[0].trim()}.jpg`
    : `${baseUrl}/assets/images/nopicture.jpg`;
  
  // Clean description for meta (remove HTML tags and limit length)
  const cleanDescription = product.description 
    ? product.description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').substring(0, 160)
    : `${product.name} - Art.-Nr.: ${product.articleNumber}`;

  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${cleanDescription}">
    <meta name="keywords" content="${product.name}, ${product.manufacturer || ''}, ${product.articleNumber}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${product.name}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${productUrl}">
    <meta property="og:type" content="product">
    <meta property="og:site_name" content="SeedHeads.de">
    <meta property="product:price:amount" content="${product.price}">
    <meta property="product:price:currency" content="EUR">
    <meta property="product:availability" content="${product.available ? 'in stock' : 'out of stock'}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${product.name}">
    <meta name="twitter:description" content="${cleanDescription}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${productUrl}">
  `;
};

const writeCombinedCssFile = () => {
  const combinedCss = Array.from(globalCssCollection).join('\n');
  const cssFilePath = path.resolve(__dirname, outputDir, 'prerender.css');
  fs.writeFileSync(cssFilePath, combinedCss);
  
  console.log(`✅ Combined CSS file written to ${cssFilePath}`);
  console.log(`   - Total CSS rules: ${globalCssCollection.size}`);
  console.log(`   - Total CSS size: ${combinedCss.length} characters`);
};

const fetchCategoryProducts = (socket, categoryId) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching products for category ${categoryId}`));
    }, 5000);

    socket.emit("getCategoryProducts", { categoryId: parseInt(categoryId) }, (response) => {
      clearTimeout(timeout);
      if (response && response.products !== undefined) {
        resolve(response);
      } else {
        reject(new Error(`Invalid response for category ${categoryId}: ${JSON.stringify(response)}`));
      }
    });
  });
};

const fetchProductDetails = (socket, productSeoName) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching product details for product ${productSeoName}`));
    }, 5000);

    socket.emit('getProductView', { seoName: productSeoName }, (response) => {
      clearTimeout(timeout);
      if (response && response.product) {
        resolve(response);
      } else {
        reject(new Error(`Invalid product response for product ${productSeoName}: ${JSON.stringify(response)}`));
      }
    });
  });
};

const fetchProductImage = (socket, bildId) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching image ${bildId}`));
    }, 10000);

    socket.emit('getPic', { bildId, size: 'medium' }, (res) => {
      clearTimeout(timeout);
      if (res.success && res.imageBuffer) {
        resolve(res.imageBuffer);
      } else {
        reject(new Error(`Failed to fetch image ${bildId}: ${JSON.stringify(res)}`));
      }
    });
  });
};

const saveProductImages = async (socket, products, categoryName) => {
  if (!products || products.length === 0) return;

  const assetsPath = path.resolve(__dirname, outputDir, 'assets', 'images');
  
  // Ensure assets/images directory exists
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }

  let imagesSaved = 0;
  let imagesSkipped = 0;

  console.log(`   📷 Fetching images for ${products.length} products in "${categoryName}"...`);

  for (const product of products) {
    if (product.pictureList && product.pictureList.trim()) {
      // Parse pictureList string to get image IDs
      const imageIds = product.pictureList.split(',').map(id => id.trim()).filter(id => id);
      
      if (imageIds.length > 0) {
        // Process first image for each product
        const bildId = parseInt(imageIds[0]);
        const estimatedFilename = `prod${bildId}.jpg`; // We'll generate a filename based on the ID
        
        const imagePath = path.join(assetsPath, estimatedFilename);
        
        // Skip if image already exists
        if (fs.existsSync(imagePath)) {
          imagesSkipped++;
          continue;
        }

        try {
          const imageBuffer = await fetchProductImage(socket, bildId);
          fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
          imagesSaved++;
          
          // Small delay to avoid overwhelming server
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.log(`     ⚠️ Failed to fetch image ${estimatedFilename} (ID: ${bildId}): ${error.message}`);
        }
      }
    }
  }

  if (imagesSaved > 0 || imagesSkipped > 0) {
    console.log(`   📷 Images: ${imagesSaved} saved, ${imagesSkipped} already exist`);
  }
};

const renderApp = async (categoryData, socket) => {
  if (categoryData) {
    global.window.productCache = { 'categoryTree_209': { categoryTree: categoryData, timestamp: Date.now() } };
  } else {
    global.window.productCache = {};
  }

  console.log('🏠 Rendering home page...');
  const PrerenderHome = require('./src/PrerenderHome.js').default;
  const homeComponent = React.createElement(PrerenderHome, null);
  const homeSuccess = renderPage(homeComponent, '/', 'index.prerender.html', 'Home page', '', true);

  if (!homeSuccess) {
    process.exit(1);
  }

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
            await saveProductImages(socket, productData.products, category.name);
            
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
        
        const success = renderPage(categoryComponent, location, filename, description, '', true);
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
          
          const success = renderPage(productComponent, location, filename, description, metaTags, true);
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
  writeCombinedCssFile();
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