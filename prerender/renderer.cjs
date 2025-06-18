const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { StaticRouter } = require('react-router');
const { CacheProvider } = require('@emotion/react');
const { ThemeProvider } = require('@mui/material/styles');
const createEmotionCache = require('../createEmotionCache.js').default;
const theme = require('../src/theme.js').default;
const createEmotionServer = require('@emotion/server/create-instance').default;

const renderPage = (component, location, filename, description, metaTags = '', needsRouter = false, config) => {
  const { isProduction, outputDir, globalCss, globalCssCollection, webpackEntrypoints } = config;
  const { writeCombinedCssFile } = require('./utils.cjs');
  
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
        writeCombinedCssFile(globalCssCollection, outputDir);
      }
    }
  } catch (error) {
    console.error(`❌ Rendering failed for ${filename}:`, error);
    return false;
  }

  // Use appropriate template path based on mode
  const templatePath = isProduction 
    ? path.resolve(__dirname, '..', 'dist', 'index_template.html')
    : path.resolve(__dirname, '..', 'public', 'index.html');
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

  const outputPath = path.resolve(outputDir, filename);
  
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

module.exports = {
  renderPage
}; 