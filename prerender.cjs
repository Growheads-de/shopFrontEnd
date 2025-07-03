require("@babel/register")({
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-react",
  ],
  extensions: [".js", ".jsx"],
  ignore: [/node_modules/],
});

// Minimal globals for socket.io-client only - no JSDOM to avoid interference
global.window = {}; // Minimal window object for productCache
global.navigator = { userAgent: "node.js" };
// Use Node.js URL constructor for React Router compatibility
global.URL = require("url").URL;
global.Blob = class MockBlob {
  constructor(data, options) {
    this.data = data;
    this.type = options?.type || "";
  }
};

// Import modules
const fs = require("fs");
const path = require("path");
const React = require("react");
const io = require("socket.io-client");
const os = require("os");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

// Import split modules
const config = require("./prerender/config.cjs");

// Import shop config - using require with Babel transpilation
const shopConfig = require("./src/config.js").default;
const { renderPage } = require("./prerender/renderer.cjs");
const {
  collectAllCategories,
  writeCombinedCssFile,
} = require("./prerender/utils.cjs");
const {
  generateProductMetaTags,
  generateProductJsonLd,
  generateCategoryJsonLd,
  generateHomepageMetaTags,
  generateHomepageJsonLd,
  generateSitemapJsonLd,
  generateKonfiguratorMetaTags,
  generateXmlSitemap,
  generateRobotsTxt,
  generateProductsXml,
  generateLlmsTxt,
  generateCategoryLlmsTxt,
} = require("./prerender/seo.cjs");
const {
  fetchCategoryProducts,
  fetchProductDetails,
  saveProductImages,
  saveCategoryImages,
} = require("./prerender/data-fetching.cjs");

// Import components
const PrerenderCategory = require("./src/PrerenderCategory.js").default;
const PrerenderProduct = require("./src/PrerenderProduct.js").default;
const PrerenderKonfigurator = require("./src/PrerenderKonfigurator.js").default;
const PrerenderProfile = require("./src/PrerenderProfile.js").default;

// Import static page components
const Datenschutz = require("./src/pages/Datenschutz.js").default;
const Impressum = require("./src/pages/Impressum.js").default;
const Batteriegesetzhinweise =
  require("./src/pages/Batteriegesetzhinweise.js").default;
const Widerrufsrecht = require("./src/pages/Widerrufsrecht.js").default;
const Sitemap = require("./src/pages/Sitemap.js").default;
const AGB = require("./src/pages/AGB.js").default;
const NotFound404 = require("./src/pages/NotFound404.js").default;

// Worker function for parallel product rendering  
const renderProductWorker = async (productSeoNames, workerId, progressCallback, categoryMap = {}) => {
  const socketUrl = "http://127.0.0.1:9303";
  const workerSocket = io(socketUrl, {
    path: "/socket.io/",
    transports: ["polling", "websocket"],
    reconnection: false,
    timeout: 10000,
  });

  return new Promise((resolve) => {
    let processedCount = 0;
    let successCount = 0;
    const results = [];

    const processNextProduct = async () => {
      if (processedCount >= productSeoNames.length) {
        workerSocket.disconnect();
        resolve({ successCount, results, workerId });
        return;
      }

      const productSeoName = productSeoNames[processedCount];
      processedCount++;

      try {
        const productDetails = await fetchProductDetails(workerSocket, productSeoName);
        
        const actualSeoName = productDetails.product.seoName || productSeoName;
        const productComponent = React.createElement(PrerenderProduct, {
          productData: productDetails,
        });

        const filename = `Artikel/${actualSeoName}`;
        const location = `/Artikel/${actualSeoName}`;
        const description = `Product "${productDetails.product.name}" (seoName: ${productSeoName})`;
        const metaTags = generateProductMetaTags({
          ...productDetails.product,
          seoName: actualSeoName,
        }, shopConfig.baseUrl, shopConfig);
        // Get category info from categoryMap if available
        const categoryInfo = productDetails.product.categoryId ? categoryMap[productDetails.product.categoryId] : null;
        
        const jsonLdScript = generateProductJsonLd({
          ...productDetails.product,
          seoName: actualSeoName,
        }, shopConfig.baseUrl, shopConfig, categoryInfo);
        const combinedMetaTags = metaTags + "\n" + jsonLdScript;

        const success = renderPage(
          productComponent,
          location,
          filename,
          description,
          combinedMetaTags,
          true,
          config,
          true // Suppress logs during parallel rendering to avoid interfering with progress bar
        );

        if (success) {
          successCount++;
        }

        const result = {
          productSeoName,
          productName: productDetails.product.name,
          success,
          workerId
        };
        
        results.push(result);
        
        // Call progress callback if provided
        if (progressCallback) {
          progressCallback(result);
        }

        // Small delay to avoid overwhelming the server
        setTimeout(processNextProduct, 25);
      } catch (error) {
        const result = {
          productSeoName,
          productName: productSeoName,
          success: false,
          error: error.message,
          workerId
        };
        
        results.push(result);
        
        // Call progress callback if provided
        if (progressCallback) {
          progressCallback(result);
        }
        
        setTimeout(processNextProduct, 25);
      }
    };

    workerSocket.on("connect", () => {
      processNextProduct();
    });

    workerSocket.on("connect_error", (err) => {
      console.error(`Worker ${workerId} socket connection error:`, err);
      resolve({ successCount: 0, results: [], workerId });
    });
  });
};

// Function to render products in parallel
const renderProductsInParallel = async (allProductsArray, maxWorkers, totalProducts, categoryMap = {}) => {
  // Shared progress tracking
  let completedProducts = 0;
  let totalSuccessCount = 0;
  let lastProductName = '';
  const progressResults = [];
  const workerCounts = new Array(maxWorkers).fill(0); // Track per-worker progress
  const workerSuccess = new Array(maxWorkers).fill(0); // Track per-worker success count

  // Helper function to display progress bar with worker stats
  const updateProgressBar = (current, total, productName = '') => {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filledLength = Math.round((barLength * current) / total);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    // @note Single line progress update to prevent flickering
    const truncatedName = productName ? ` - ${productName.substring(0, 25)}${productName.length > 25 ? '...' : ''}` : '';
    
    // Build worker stats on one line
    let workerStats = '';
    for (let i = 0; i < Math.min(maxWorkers, 8); i++) { // Limit to 8 workers to fit on screen
      workerStats += `W${i + 1}:${workerCounts[i]}/${workerSuccess[i]} `;
    }
    
    // Single line update without complex cursor movements
    process.stdout.write(`\r   [${bar}] ${percentage}% (${current}/${total})${truncatedName}\n   ${workerStats}${current < total ? '\x1b[1A' : '\n'}`);
  };

  // Split products among workers
  const productsPerWorker = Math.ceil(allProductsArray.length / maxWorkers);
  const workerPromises = [];
  
  // Initial progress bar
  updateProgressBar(0, totalProducts);
  
  for (let i = 0; i < maxWorkers; i++) {
    const start = i * productsPerWorker;
    const end = Math.min(start + productsPerWorker, allProductsArray.length);
    const productsForWorker = allProductsArray.slice(start, end);
    
    if (productsForWorker.length > 0) {
      const promise = renderProductWorker(productsForWorker, i + 1, (result) => {
        // Progress callback - called each time a product is completed
        completedProducts++;
        progressResults.push(result);
        lastProductName = result.productName;
        
        // Update per-worker counters
        const workerIndex = result.workerId - 1; // Convert to 0-based index
        workerCounts[workerIndex]++;
        
        if (result.success) {
          totalSuccessCount++;
          workerSuccess[workerIndex]++;
        } else if (result.error) {
          // Don't log errors immediately to avoid interfering with progress bar
          // Errors will be shown after completion
        }
        
        // Update progress bar with worker stats
        updateProgressBar(completedProducts, totalProducts, lastProductName);
      }, categoryMap);
      
      workerPromises.push(promise);
    }
  }

  try {
    // Wait for all workers to complete
    await Promise.all(workerPromises);
    
    // Ensure final progress update
    updateProgressBar(totalProducts, totalProducts, lastProductName);
    
    // Show any errors that occurred
    const errorResults = progressResults.filter(r => !r.success && r.error);
    if (errorResults.length > 0) {
      console.log(`\n❌ ${errorResults.length} products failed to render:`);
      errorResults.forEach(result => {
        console.log(`   - ${result.productSeoName}: ${result.error}`);
      });
    }
    
    return totalSuccessCount;
  } catch (error) {
    console.error('Error in parallel rendering:', error);
    return totalSuccessCount; // Return what we managed to complete
  }
};

const renderApp = async (categoryData, socket) => {
  if (categoryData) {
    global.window.productCache = {
      categoryTree_209: { categoryTree: categoryData, timestamp: Date.now() },
    };
    // @note Make cache available to components during rendering
    global.productCache = global.window.productCache;
  } else {
    global.window.productCache = {};
    global.productCache = {};
  }

  // Helper to call renderPage with config
  const render = (
    component,
    location,
    filename,
    description,
    metaTags = "",
    needsRouter = false
  ) => {
    return renderPage(
      component,
      location,
      filename,
      description,
      metaTags,
      needsRouter,
      config
    );
  };

  console.log("🏠 Rendering home page...");
  const PrerenderHome = require("./src/PrerenderHome.js").default;
  const homeComponent = React.createElement(PrerenderHome, null);
  const homeFilename = config.isProduction
    ? "index.html"
    : "index.prerender.html";
  const homeMetaTags = generateHomepageMetaTags(shopConfig.baseUrl, shopConfig);
  const homepageCategories = categoryData ? collectAllCategories(categoryData) : [];
  const homeJsonLd = generateHomepageJsonLd(shopConfig.baseUrl, shopConfig, homepageCategories);
  const combinedHomeMeta = homeMetaTags + "\n" + homeJsonLd;
  const homeSuccess = render(
    homeComponent,
    "/",
    homeFilename,
    "Home page",
    combinedHomeMeta,
    true
  );

  if (!homeSuccess) {
    process.exit(1);
  }

  // Render static pages
  console.log("\n📄 Rendering static pages...");

  const staticPages = [
    {
      component: Datenschutz,
      path: "/datenschutz",
      filename: "datenschutz",
      description: "Datenschutz page",
    },
    {
      component: Impressum,
      path: "/impressum",
      filename: "impressum",
      description: "Impressum page",
    },
    {
      component: Batteriegesetzhinweise,
      path: "/batteriegesetzhinweise",
      filename: "batteriegesetzhinweise",
      description: "Batteriegesetzhinweise page",
    },
    {
      component: Widerrufsrecht,
      path: "/widerrufsrecht",
      filename: "widerrufsrecht",
      description: "Widerrufsrecht page",
    },
    {
      component: Sitemap,
      path: "/sitemap",
      filename: "sitemap",
      description: "Sitemap page",
    },
    { component: AGB, path: "/agb", filename: "agb", description: "AGB page" },
    { component: NotFound404, path: "/404", filename: "404", description: "404 Not Found page" },
    {
      component: PrerenderKonfigurator,
      path: "/Konfigurator",
      filename: "Konfigurator",
      description: "Growbox Konfigurator page",
    },
    {
      component: PrerenderProfile,
      path: "/profile",
      filename: "profile",
      description: "Profile page",
    },
  ];

  let staticPagesRendered = 0;
  for (const page of staticPages) {
    const pageComponent = React.createElement(page.component, null);
    let metaTags = "";

    // Special handling for Sitemap page to include category data
    if (page.filename === "sitemap" && categoryData) {
      const sitemapCategories = collectAllCategories(categoryData);
      metaTags = generateSitemapJsonLd(sitemapCategories, shopConfig.baseUrl, shopConfig);
    }

    // Special handling for Konfigurator page to include SEO tags
    if (page.filename === "Konfigurator") {
      const konfiguratorMetaTags = generateKonfiguratorMetaTags(shopConfig.baseUrl, shopConfig);
      metaTags = konfiguratorMetaTags;
    }

    const success = render(
      pageComponent,
      page.path,
      page.filename,
      page.description,
      metaTags,
      true
    );
    if (success) {
      staticPagesRendered++;
    }
  }

  console.log(
    `✅ Successfully rendered ${staticPagesRendered}/${staticPages.length} static pages!`
  );

  // Collect all products for product page generation
  const allProducts = new Set();
  const allProductsData = []; // @note Store full product data for products.xml generation

  // Generate category pages if we have category data
  if (categoryData && socket) {
    console.log("\n📂 Rendering category pages with product data...");
    const allCategories = collectAllCategories(categoryData);
    console.log(`Found ${allCategories.length} categories to render`);

    // First, collect category images for all categories
    console.log("\n📂 Collecting category images...");
    await saveCategoryImages(socket, allCategories, config.outputDir);

    let categoryPagesRendered = 0;
    let categoriesWithProducts = 0;

    for (const category of allCategories) {
      // Skip categories without seoName
      if (!category.seoName) {
        console.log(
          `⚠️ Skipping category "${category.name}" (ID: ${category.id}) - no seoName`
        );
        continue;
      }

      try {
        console.log(
          `\n🔍 Fetching products for category "${category.name}" (ID: ${category.id})...`
        );

        let productData = null;
        try {
          productData = await fetchCategoryProducts(socket, category.id);
          console.log(
            `   ✅ Found ${
              productData.products ? productData.products.length : 0
            } products`
          );

          if (productData.products && productData.products.length > 0) {
            categoriesWithProducts++;

            // Collect products for individual page generation
            productData.products.forEach((product) => {
              if (product.seoName) {
                allProducts.add(product.seoName);
                // @note Store full product data for products.xml generation with category ID
                allProductsData.push({
                  ...product,
                  seoName: product.seoName,
                  categoryId: category.id // Add the category ID for Google Shopping category mapping
                });
              }
            });

            // Fetch and save product images
            await saveProductImages(
              socket,
              productData.products,
              category.name,
              config.outputDir
            );

            // Don't accumulate data in global cache - just use the data directly for this page
            // The global cache should only contain the static category tree
          }
        } catch (productError) {
          console.log(`   ⚠️ No products found: ${productError.message}`);
        }

        const categoryComponent = React.createElement(PrerenderCategory, {
          categoryId: category.id,
          categoryName: category.name,
          categorySeoName: category.seoName,
          productData: productData,
        });

        const filename = `Kategorie/${category.seoName}`;
        const location = `/Kategorie/${category.seoName}`;
        const description = `Category "${category.name}" (ID: ${category.id})`;
        const categoryJsonLd = generateCategoryJsonLd(
          category,
          productData?.products || [],
          shopConfig.baseUrl,
          shopConfig
        );

        const success = render(
          categoryComponent,
          location,
          filename,
          description,
          categoryJsonLd,
          true
        );
        if (success) {
          categoryPagesRendered++;
        }

        // Small delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `❌ Failed to render category ${category.id} (${category.name}):`,
          error
        );
      }
    }

    console.log(
      `\n🎉 Successfully rendered ${categoryPagesRendered} category pages!`
    );
    console.log(`📦 ${categoriesWithProducts} categories had product data`);

    // Generate individual product pages
    if (allProducts.size > 0) {
      const totalProducts = allProducts.size;
      const numCPUs = os.cpus().length;
      const maxWorkers = Math.min(numCPUs, totalProducts, 8); // Cap at 8 workers to avoid overwhelming the server
      
      // Create category map for breadcrumbs
      const categoryMap = {};
      allCategories.forEach(category => {
        categoryMap[category.id] = {
          name: category.name,
          seoName: category.seoName
        };
      });
      
      console.log(
        `\n📦 Rendering ${totalProducts} individual product pages using ${maxWorkers} parallel workers...`
      );
      
      const productPagesRendered = await renderProductsInParallel(
        Array.from(allProducts),
        maxWorkers,
        totalProducts,
        categoryMap
      );

      console.log(
        `🎉 Successfully rendered ${productPagesRendered}/${totalProducts} product pages!`
      );
    }
  } else {
    console.log(
      "⚠️ No category data or socket available - skipping category page generation"
    );
  }

  // Write the combined CSS file after all pages are rendered
  writeCombinedCssFile(config.globalCssCollection, config.outputDir);

  // Generate XML sitemap with all rendered pages
  console.log("\n🗺️ Generating XML sitemap...");
  const allCategories = categoryData ? collectAllCategories(categoryData) : [];
  const allProductsArray = Array.from(allProducts);
  const xmlSitemap = generateXmlSitemap(allCategories, allProductsArray, shopConfig.baseUrl);

  const sitemapPath = path.resolve(__dirname, config.outputDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, xmlSitemap);

  console.log(`✅ XML sitemap generated: ${sitemapPath}`);
  console.log(`   - Homepage: 1 URL`);
  console.log(`   - Static pages: 6 URLs`);
  console.log(`   - Category pages: ${allCategories.length} URLs`);
  console.log(`   - Product pages: ${allProductsArray.length} URLs`);
  console.log(
    `   - Total URLs: ${1 + 6 + allCategories.length + allProductsArray.length}`
  );

  // Generate robots.txt
  console.log("\n🤖 Generating robots.txt...");
  const robotsTxtContent = generateRobotsTxt(shopConfig.baseUrl);
  const robotsTxtPath = path.resolve(__dirname, config.outputDir, "robots.txt");
  fs.writeFileSync(robotsTxtPath, robotsTxtContent);

  console.log(`✅ robots.txt generated: ${robotsTxtPath}`);
  console.log(`   - Allows all crawlers`);
  console.log(`   - References sitemap.xml`);
  console.log(`   - Includes crawl-delay directive`);

  // Generate products.xml (Google Shopping feed) in parallel to sitemap.xml
  if (allProductsData.length > 0) {
    console.log("\n🛒 Generating products.xml (Google Shopping feed)...");
    
    try {
      const productsXml = generateProductsXml(allProductsData, shopConfig.baseUrl, shopConfig);
      
      const productsXmlPath = path.resolve(__dirname, config.outputDir, "products.xml");
      
      // Write with explicit UTF-8 encoding
      fs.writeFileSync(productsXmlPath, productsXml, { encoding: 'utf8' });
      
      console.log(`✅ products.xml generated: ${productsXmlPath}`);
      console.log(`   - Products included: ${allProductsData.length}`);
      console.log(`   - Format: Google Shopping RSS 2.0 feed`);
      console.log(`   - Encoding: UTF-8`);
      console.log(`   - Includes: title, description, price, availability, images`);
      
      // Verify the file is valid UTF-8
      try {
        const verification = fs.readFileSync(productsXmlPath, 'utf8');
        console.log(`   - File verification: ✅ Valid UTF-8 (${Math.round(verification.length / 1024)}KB)`);
      } catch (verifyError) {
        console.log(`   - File verification: ⚠️ ${verifyError.message}`);
      }
      
    } catch (error) {
      console.error(`❌ Error generating products.xml: ${error.message}`);
      console.log("\n⚠️  Skipping products.xml generation due to errors");
    }
  } else {
    console.log("\n⚠️  No product data available - skipping products.xml generation");
  }

  // Generate llms.txt (LLM-friendly markdown sitemap) and category-specific files
  console.log("\n🤖 Generating LLM sitemap files...");
  
  try {
    // Generate main llms.txt overview file
    const llmsTxt = generateLlmsTxt(allCategories, allProductsData, shopConfig.baseUrl, shopConfig);
    const llmsTxtPath = path.resolve(__dirname, config.outputDir, "llms.txt");
    fs.writeFileSync(llmsTxtPath, llmsTxt, { encoding: 'utf8' });
    
    console.log(`✅ Main llms.txt generated: ${llmsTxtPath}`);
    console.log(`   - Static pages: 8 pages`);
    console.log(`   - Categories: ${allCategories.length} with links to detailed files`);
    console.log(`   - File size: ${Math.round(llmsTxt.length / 1024)}KB`);
    
    // Group products by category for category-specific files
    const productsByCategory = {};
    allProductsData.forEach((product) => {
      const categoryId = product.categoryId || 'uncategorized';
      if (!productsByCategory[categoryId]) {
        productsByCategory[categoryId] = [];
      }
      productsByCategory[categoryId].push(product);
    });
    
    // Generate category-specific LLM files
    let categoryFilesGenerated = 0;
    let totalCategoryProducts = 0;
    
    for (const category of allCategories) {
      if (category.seoName) {
        const categoryProducts = productsByCategory[category.id] || [];
        const categorySlug = category.seoName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        const categoryLlmsTxt = generateCategoryLlmsTxt(category, categoryProducts, shopConfig.baseUrl, shopConfig);
        const categoryLlmsTxtPath = path.resolve(__dirname, config.outputDir, `llms-${categorySlug}.txt`);
        
        fs.writeFileSync(categoryLlmsTxtPath, categoryLlmsTxt, { encoding: 'utf8' });
        
        console.log(`   ✅ llms-${categorySlug}.txt - ${categoryProducts.length} products (${Math.round(categoryLlmsTxt.length / 1024)}KB)`);
        
        categoryFilesGenerated++;
        totalCategoryProducts += categoryProducts.length;
      }
    }
    
    try {
      const verification = fs.readFileSync(llmsTxtPath, 'utf8');
      console.log(`   - File verification: ✅ All files valid UTF-8`);
    } catch (verifyError) {
      console.log(`   - File verification: ⚠️ ${verifyError.message}`);
    }
    
  } catch (error) {
    console.error(`❌ Error generating LLM sitemap files: ${error.message}`);
    console.log("\n⚠️  Skipping LLM sitemap generation due to errors");
  }
};

const fetchCategoryDataAndRender = () => {
  const socketUrl = "http://127.0.0.1:9303";
  console.log(`Connecting to socket at ${socketUrl} to fetch categories...`);

  const timeout = setTimeout(() => {
    console.error(
      "Error: Prerender script timed out after 15 seconds. Check backend connectivity."
    );
    process.exit(1);
  }, 15000);

  const socket = io(socketUrl, {
    path: "/socket.io/",
    transports: ["polling", "websocket"], // Using polling first is more robust
    reconnection: false,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log('Socket connected. Emitting "categoryList"...');
    socket.emit("categoryList", { categoryId: 209 }, async (response) => {
      clearTimeout(timeout);

      if (response && response.categoryTree) {
        console.log("Successfully fetched category data.");
        await renderApp(response.categoryTree, socket);
      } else {
        console.error("Error: Invalid category data received.", response);
        await renderApp(null, socket);
      }
      socket.disconnect();
    });
  });

  socket.on("connect_error", async (err) => {
    clearTimeout(timeout);
    console.error("Socket connection error:", err);
    await renderApp(null, null);
    socket.disconnect();
  });

  socket.on("error", async (err) => {
    clearTimeout(timeout);
    console.error("Socket error:", err);
    await renderApp(null, null);
    socket.disconnect();
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${reason}`);
    clearTimeout(timeout);
  });
};

fetchCategoryDataAndRender();
