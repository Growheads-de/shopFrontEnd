const fs = require("fs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { StaticRouter } = require("react-router");
const { CacheProvider } = require("@emotion/react");
const { ThemeProvider } = require("@mui/material/styles");
const createEmotionCache = require("../createEmotionCache.js").default;
const theme = require("../src/theme.js").default;
const createEmotionServer = require("@emotion/server/create-instance").default;

const renderPage = (
  component,
  location,
  filename,
  description,
  metaTags = "",
  needsRouter = false,
  config,
  suppressLogs = false
) => {
  const {
    isProduction,
    outputDir,
    globalCss,
    globalCssCollection,
    webpackEntrypoints,
  } = config;
  const { writeCombinedCssFile, optimizeCss } = require("./utils.cjs");

  // @note Set prerender fallback flag in global environment for CategoryBox during SSR
  if (typeof global !== "undefined" && global.window) {
    global.window.__PRERENDER_FALLBACK__ = {
      path: location,
      timestamp: Date.now()
    };
  }

  // Create fresh Emotion cache for each page
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  const wrappedComponent = needsRouter
    ? React.createElement(StaticRouter, { location: location }, component)
    : component;

  const pageElement = React.createElement(
    CacheProvider,
    { value: cache },
    React.createElement(ThemeProvider, { theme: theme }, wrappedComponent)
  );

  let renderedMarkup;

  try {
    renderedMarkup = ReactDOMServer.renderToString(pageElement);
    const emotionChunks = extractCriticalToChunks(renderedMarkup);

    // Collect CSS from this page
    if (emotionChunks.styles.length > 0) {
      const oldSize = globalCssCollection.size;

      emotionChunks.styles.forEach((style) => {
        if (style.css) {
          globalCssCollection.add(style.css);
        }
      });

      // Check if new styles were added
      if (globalCssCollection.size > oldSize) {
        // Write CSS file immediately when new styles are added
        writeCombinedCssFile(globalCssCollection, outputDir);
      }
    }
  } catch (error) {
    console.error(`❌ Rendering failed for ${filename}:`, error);
    return false;
  }

  // Use appropriate template path based on mode
  // In production, use a clean template file, not the already-rendered index.html
  const templatePath = isProduction
    ? path.resolve(__dirname, "..", "dist", "index_template.html")
    : path.resolve(__dirname, "..", "public", "index.html");
  let template = fs.readFileSync(templatePath, "utf8");

  // Build CSS and JS tags with optimized CSS loading
  let additionalTags = "";
  let inlinedCss = "";

  if (isProduction) {
    // Check if scripts are already present in template to avoid duplication
    const existingScripts =
      template.match(/<script[^>]*src="([^"]*)"[^>]*><\/script>/g) || [];
    const existingScriptSrcs = existingScripts
      .map((script) => {
        const match = script.match(/src="([^"]*)"/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    // OPTIMIZATION: Inline critical CSS instead of loading externally
    // Read and inline webpack CSS files to eliminate render-blocking requests
    webpackEntrypoints.css.forEach((cssFile) => {
      if (!template.includes(`href="${cssFile}"`)) {
        try {
          const cssPath = path.resolve(__dirname, "..", "dist", cssFile.replace(/^\//, ""));
          if (fs.existsSync(cssPath)) {
            const cssContent = fs.readFileSync(cssPath, "utf8");
            // Use advanced CSS optimization
            const optimizedCss = optimizeCss(cssContent);
            inlinedCss += optimizedCss;
            if (!suppressLogs) console.log(`   ✅ Inlined CSS: ${cssFile} (${Math.round(optimizedCss.length / 1024)}KB)`);
          } else {
            // Fallback to external loading if file not found
            additionalTags += `<link rel="preload" href="${cssFile}" as="style" onload="this.onload=null;this.rel='stylesheet'">`;
            additionalTags += `<noscript><link rel="stylesheet" href="${cssFile}"></noscript>`;
            if (!suppressLogs) console.log(`   ⚠️ CSS file not found for inlining: ${cssPath}, using async loading`);
          }
        } catch (error) {
          // Fallback to external loading if reading fails
          additionalTags += `<link rel="preload" href="${cssFile}" as="style" onload="this.onload=null;this.rel='stylesheet'">`;
          additionalTags += `<noscript><link rel="stylesheet" href="${cssFile}"></noscript>`;
          if (!suppressLogs) console.log(`   ⚠️ Error reading CSS file ${cssFile}: ${error.message}, using async loading`);
        }
      }
    });

    // Read and inline prerender CSS to eliminate render-blocking request
    try {
      const prerenderCssPath = path.resolve(__dirname, "..", outputDir, "prerender.css");
             if (fs.existsSync(prerenderCssPath)) {
         const prerenderCssContent = fs.readFileSync(prerenderCssPath, "utf8");
         // Use advanced CSS optimization
         const optimizedPrerenderCss = optimizeCss(prerenderCssContent);
         inlinedCss += optimizedPrerenderCss;
         if (!suppressLogs) console.log(`   ✅ Inlined prerender CSS (${Math.round(optimizedPrerenderCss.length / 1024)}KB)`);
       } else {
        // Fallback to external loading if prerender.css doesn't exist yet
        additionalTags += `<link rel="preload" href="/prerender.css" as="style" onload="this.onload=null;this.rel='stylesheet'">`;
        additionalTags += `<noscript><link rel="stylesheet" href="/prerender.css"></noscript>`;
        if (!suppressLogs) console.log(`   ⚠️ prerender.css not found for inlining, using async loading`);
      }
    } catch (error) {
      // Fallback to external loading
      additionalTags += `<link rel="preload" href="/prerender.css" as="style" onload="this.onload=null;this.rel='stylesheet'">`;
      additionalTags += `<noscript><link rel="stylesheet" href="/prerender.css"></noscript>`;
      if (!suppressLogs) console.log(`   ⚠️ Error reading prerender.css: ${error.message}, using async loading`);
    }

    // Add JavaScript files
    webpackEntrypoints.js.forEach((jsFile) => {
      if (!existingScriptSrcs.includes(jsFile)) {
        additionalTags += `<script src="${jsFile}"></script>`;
      }
    });
  } else {
    // In development, try to inline prerender CSS as well
    try {
      const prerenderCssPath = path.resolve(__dirname, "..", outputDir, "prerender.css");
             if (fs.existsSync(prerenderCssPath)) {
         const prerenderCssContent = fs.readFileSync(prerenderCssPath, "utf8");
         const optimizedCss = optimizeCss(prerenderCssContent);
         inlinedCss += optimizedCss;
         if (!suppressLogs) console.log(`   ✅ Inlined prerender CSS in development (${Math.round(optimizedCss.length / 1024)}KB)`);
       } else {
        // Fallback to external loading
        additionalTags += `<link rel="stylesheet" href="/prerender.css">`;
      }
    } catch (error) {
      // Fallback to external loading
      additionalTags += `<link rel="stylesheet" href="/prerender.css">`;
    }
  }

  // Create script to save prerendered content to window object for fallback use
  const prerenderFallbackScript = `
    <script>
      // Save prerendered content to window object for SocketProvider fallback
      window.__PRERENDER_FALLBACK__ = {
        path: '${location}',
        content: ${JSON.stringify(renderedMarkup)},
        timestamp: ${Date.now()}
      };
    </script>
  `;

  // @note Create script to populate window.productCache with ONLY the static category tree
  let productCacheScript = '';
  if (typeof global !== "undefined" && global.window && global.window.productCache) {
    // Only include the static categoryTree_209, not any dynamic data that gets added during rendering
    const staticCache = {};
    if (global.window.productCache.categoryTree_209) {
      staticCache.categoryTree_209 = global.window.productCache.categoryTree_209;
    }
    
    const staticCacheData = JSON.stringify(staticCache);
    productCacheScript = `
    <script>
      // Populate window.productCache with static category tree only
      window.productCache = ${staticCacheData};
    </script>
    `;
  }

  // Combine all CSS (global + inlined) into a single optimized style tag
  const combinedCss = globalCss + (inlinedCss ? '\n' + inlinedCss : '');
  const combinedCssTag = combinedCss ? `<style type="text/css">${combinedCss}</style>` : '';
  
  // Add resource hints for better performance
  const resourceHints = `
    <meta name="viewport" content="width=device-width, initial-scale=1">
  `;
  
  template = template.replace(
    "</head>",
    `${resourceHints}${combinedCssTag}${additionalTags}${metaTags}${prerenderFallbackScript}${productCacheScript}</head>`
  );

  const rootDivRegex = /<div id="root"[\s\S]*?>[\s\S]*?<\/div>/;
  const replacementHtml = `<div id="root">${renderedMarkup}</div>`;

  let newHtml;
  if (rootDivRegex.test(template)) {
    newHtml = template.replace(rootDivRegex, replacementHtml);
  } else {
    newHtml = template.replace("<body>", `<body>${replacementHtml}`);
  }

  const outputPath = path.resolve(__dirname, "..", outputDir, filename);

  // Ensure directory exists for nested paths
  const outputDirPath = path.dirname(outputPath);
  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  fs.writeFileSync(outputPath, newHtml);

  if (!suppressLogs) {
    console.log(`✅ ${description} prerendered to ${outputPath}`);
    console.log(`   - Markup length: ${renderedMarkup.length} characters`);
    console.log(`   - CSS rules: ${Object.keys(cache.inserted).length}`);
    console.log(`   - Total inlined CSS: ${Math.round(combinedCss.length / 1024)}KB`);
    console.log(`   - Render-blocking CSS eliminated: ${inlinedCss ? 'YES' : 'NO'}`);
    console.log(`   - Fallback content saved to window.__PRERENDER_FALLBACK__`);
  }

  return true;
};

module.exports = {
  renderPage,
};
