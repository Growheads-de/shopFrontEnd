import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import { cpSync } from 'fs';
import { execSync } from 'child_process';
import webpack from 'webpack';
import fs from 'fs';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// Get git commit hash
const getGitCommitHash = () => {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (e) {
    console.error('Failed to get git commit hash:', e);
    return 'unknown';
  }
};

const GIT_COMMIT_HASH = getGitCommitHash();

// Create a plugin to add the git commit hash directly to the HTML
class GitCommitPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('GitCommitPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'GitCommitPlugin',
        (data, cb) => {
          // Add a meta tag for the git commit hash
          const metaTag = `<meta name="git-commit" content="${GIT_COMMIT_HASH}">`;
          data.html = data.html.replace('</head>', `${metaTag}\n</head>`);
          cb(null, data);
        }
      );
    });
  }
}

// Plugin to generate currentHash.json file
class GitHashJsonPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('GitHashJsonPlugin', (_compilation) => {
      const outputPath = path.join(compiler.options.output.path, 'currentHash.json');
      const content = JSON.stringify({
        gitCommit: GIT_COMMIT_HASH,
        buildTime: new Date().toISOString()
      }, null, 2);
      
      try {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, content);
        console.log('Generated currentHash.json');
      } catch (err) {
        console.error('Error creating currentHash.json:', err);
      }
    });
  }
}

// Custom plugin to copy assets
const CopyAssetsPlugin = {
  apply: (compiler) => {
    compiler.hooks.afterEmit.tap('CopyAssetsPlugin', () => {
      // Copy assets directory
      const assetsSrc = path.resolve(__dirname, 'public/assets');
      const assetsDest = path.resolve(__dirname, 'dist/assets');
      try {
        cpSync(assetsSrc, assetsDest, { recursive: true });
        console.log('Assets copied successfully');
      } catch (err) {
        console.error('Error copying assets:', err);
      }
      
      // Copy favicon.ico
      const faviconSrc = path.resolve(__dirname, 'public/favicon.ico');
      const faviconDest = path.resolve(__dirname, 'dist/favicon.ico');
      try {
        cpSync(faviconSrc, faviconDest);
        console.log('Favicon copied successfully');
      } catch (err) {
        console.error('Error copying favicon:', err);
      }
    });
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDevelopment = process.env.NODE_ENV !== 'production';
const isAnalyze = process.env.ANALYZE === 'true';
const proxyTarget = process.env.PROXY_TARGET || 'http://localhost:9303';

export default {
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    main: './src/index.js'
  },
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment ? 'js/[name].[contenthash].bundle.js' : 'js/[name].[contenthash].js',
    chunkFilename: isDevelopment ? 'js/[name].[contenthash].chunk.js' : 'js/[name].[contenthash].chunk.js',
    clean: isDevelopment ? true : false,
    publicPath: '/'
  },
  devtool: isDevelopment ? 'source-map' : false,
  optimization: {
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
    sideEffects: false,
    usedExports: true,
    minimize: !isDevelopment,
    minimizer: !isDevelopment ? [
      // Use default minimizers (terser-webpack-plugin for JS)
      '...',
    ] : [],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 30,
      maxAsyncRequests: 30,
      minSize: 20000,
      cacheGroups: {
        // Split React and React DOM into separate chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: 'react',
          priority: 30,
          reuseExistingChunk: true,
        },
        // Split commonly used MUI icons (used in main bundle and immediate-loading components)
        muiIconsCommon: {
          test: /[\\/]node_modules[\\/]@mui[\\/]icons-material[\\/].*(SmartToy|Palette|Search|Home|ShoppingCart|Close|ChevronLeft|ChevronRight|Person|Google|Add|Remove|Delete|KeyboardArrowUp|ZoomIn|Loupe|ExpandMore|ExpandLess|Mic|Stop|PhotoCamera).*\.js$/,
          name: 'mui-icons-common',
          priority: 29,
          reuseExistingChunk: true,
          enforce: true,
        },
        // Split remaining MUI icons into separate chunk (for lazy-loaded components only)
        muiIcons: {
          test: /[\\/]node_modules[\\/]@mui[\\/]icons-material[\\/]/,
          name: 'mui-icons', 
          priority: 28,
          reuseExistingChunk: true,
          chunks: 'async', // Only split icons used in lazy-loaded chunks
          enforce: true, // Ensure this rule is applied
        },
        // Split MUI core (styles + components)
        muiCore: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui-core',
          priority: 26,
          reuseExistingChunk: true,
        },
        // Split emotion (MUI's styling dependency)
        emotion: {
          test: /[\\/]node_modules[\\/]@emotion[\\/]/,
          name: 'emotion',
          priority: 24,
          reuseExistingChunk: true,
        },
        // Split chart.js into separate chunk (only loaded when needed)
        charts: {
          test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
          name: 'charts',
          priority: 20,
          reuseExistingChunk: true,
        },
        // Other vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
          reuseExistingChunk: true,
        },
        // Common modules used across the app
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true,
      scriptLoading: 'blocking',
    }),
    new GitCommitPlugin(),
    new GitHashJsonPlugin(),
    new webpack.DefinePlugin({
      'process.env.GIT_COMMIT_HASH': JSON.stringify(GIT_COMMIT_HASH)
    }),
    isDevelopment && new ReactRefreshWebpackPlugin({
      overlay: false, // Disable React Refresh overlay to prevent conflicts
    }),
    !isDevelopment && new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].[contenthash].css',
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx'],
      emitWarning: true,
      emitError: true,
      failOnError: false,
      failOnWarning: false,
      quiet: false,
      eslintPath: 'eslint/use-at-your-own-risk'
    }),
    !isDevelopment && CopyAssetsPlugin,
    isAnalyze && new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: true,
      generateStatsFile: true,
      statsFilename: 'bundle-stats.json',
    }),
  ].filter(Boolean),
  devServer: {
    allowedHosts: 'all',
    compress: true,
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
    static: [
      {
        directory: path.resolve(__dirname, 'dist'),
      },
      {
        directory: path.resolve(__dirname, 'public'),
        publicPath: '/',
      }
    ],
    // Add proxy configuration for socket.io and API
    proxy: [
      {
        context: ['/socket.io'],
        target: proxyTarget,
        changeOrigin: true,
        ws: true,
        logLevel: 'debug',
        secure: proxyTarget.startsWith('https')
      },
      {
        context: ['/api'],
        target: proxyTarget,
        changeOrigin: true,
        logLevel: 'debug',
        secure: proxyTarget.startsWith('https')
      }
    ],
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) throw new Error('webpack-dev-server is not defined');
      
      // Middleware to serve prerendered files as HTML
      devServer.app.use((req, res, next) => {
        // Check if this is a request for a prerendered file
        if (req.url.startsWith('/Kategorie/') || req.url.startsWith('/Artikel/')) {
          const filePath = path.resolve(__dirname, 'public', req.url.slice(1));
          
          // Check if the prerendered file exists
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.sendFile(filePath);
          }
        }
        
        // Handle root index file
        if (req.url === '/' || req.url.startsWith('/index.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
        
        next();
      });

      // Add middleware to handle /404 route BEFORE webpack-dev-server processing
      middlewares.unshift({
        name: 'handle-404-route',
        middleware: async (req, res, next) => {
          if (req.url === '/404') {
            // Set up prerender environment
            const { createRequire } = await import('module');
            const require = createRequire(import.meta.url);
            
            require('@babel/register')({
              presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                '@babel/preset-react'
              ],
              extensions: ['.js', '.jsx'],
              ignore: [/node_modules/]
            });
            
            // Import React first and make it globally available
            const React = require('react');
            global.React = React; // Make React available globally for components that don't import it
            
            // Set up minimal globals for prerender
            if (!global.window) {
              global.window = {};
            }
            if (!global.navigator) {
              global.navigator = { userAgent: 'node.js' };
            }
            if (!global.URL) {
              global.URL = require('url').URL;
            }
            if (!global.Blob) {
              global.Blob = class MockBlob {
                constructor(data, options) {
                  this.data = data;
                  this.type = options?.type || '';
                }
              };
            }
            
            // Mock browser storage APIs
            const mockStorage = {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
              clear: () => {},
              key: () => null,
              length: 0
            };
            
            if (!global.localStorage) {
              global.localStorage = mockStorage;
            }
            if (!global.sessionStorage) {
              global.sessionStorage = mockStorage;
            }
            
            // Also add to window object for components that access it via window
            global.window.localStorage = mockStorage;
            global.window.sessionStorage = mockStorage;
            
            // Import the dedicated prerender component
            const PrerenderNotFound = require('./src/PrerenderNotFound.js').default;
            
            // Create the prerender component
            const component = React.createElement(PrerenderNotFound);
            
            // Get only the essential bundles (not lazy-loaded chunks)
            let jsBundles = [];
            try {
              const outputFileSystem = devServer.compiler.outputFileSystem;
              const outputPath = devServer.compiler.outputPath;
              const jsPath = path.join(outputPath, 'js');
              
              if (outputFileSystem.existsSync && outputFileSystem.existsSync(jsPath)) {
                const jsFiles = outputFileSystem.readdirSync(jsPath);
                
                // Only include essential bundles in correct dependency order
                const essentialBundles = [];
                
                // 1. Runtime bundle (webpack runtime - must be first)
                const runtimeFile = jsFiles.find(f => f.startsWith('runtime.') && f.endsWith('.bundle.js'));
                if (runtimeFile) essentialBundles.push('/js/' + runtimeFile);
                
                // 2. Vendor bundles (libraries that main depends on)
                const reactFile = jsFiles.find(f => f.startsWith('react.') && f.endsWith('.bundle.js'));
                if (reactFile) essentialBundles.push('/js/' + reactFile);
                
                const emotionFile = jsFiles.find(f => f.startsWith('emotion.') && f.endsWith('.bundle.js'));
                if (emotionFile) essentialBundles.push('/js/' + emotionFile);
                
                const muiIconsCommonFile = jsFiles.find(f => f.startsWith('mui-icons-common.') && f.endsWith('.bundle.js'));
                if (muiIconsCommonFile) essentialBundles.push('/js/' + muiIconsCommonFile);
                
                const muiCoreFile = jsFiles.find(f => f.startsWith('mui-core.') && f.endsWith('.bundle.js'));
                if (muiCoreFile) essentialBundles.push('/js/' + muiCoreFile);
                
                const vendorFile = jsFiles.find(f => f.startsWith('vendor.') && f.endsWith('.bundle.js'));
                if (vendorFile) essentialBundles.push('/js/' + vendorFile);
                
                // 3. Common shared code
                const commonFile = jsFiles.find(f => f.startsWith('common.') && f.endsWith('.chunk.js'));
                if (commonFile) essentialBundles.push('/js/' + commonFile);
                
                // 4. Main bundle (your app code - must be last)
                const mainFile = jsFiles.find(f => f.startsWith('main.') && f.endsWith('.bundle.js'));
                if (mainFile) essentialBundles.push('/js/' + mainFile);
                
                jsBundles = essentialBundles;
              }
            } catch (error) {
              console.warn('Could not read webpack output filesystem:', error.message);
            }
            
            // Fallback if we can't read the filesystem
            if (jsBundles.length === 0) {
              jsBundles = ['/js/runtime.bundle.js', '/js/main.bundle.js'];
            }
            
            // Render the page in memory only (no file writing in dev mode)
            const ReactDOMServer = require('react-dom/server');
            const { StaticRouter } = require('react-router');
            const { CacheProvider } = require('@emotion/react');
            const { ThemeProvider } = require('@mui/material/styles');
            const createEmotionCache = require('./createEmotionCache.js').default;
            const theme = require('./src/theme.js').default;
            const createEmotionServer = require('@emotion/server/create-instance').default;
            
            // Create fresh Emotion cache for this page
            const cache = createEmotionCache();
            const { extractCriticalToChunks } = createEmotionServer(cache);
            
            // Wrap with StaticRouter to provide React Router context for Logo's Link components
            const routedComponent = React.createElement(
              StaticRouter,
              { location: '/404' },
              component
            );
            
            const pageElement = React.createElement(
              CacheProvider,
              { value: cache },
              React.createElement(ThemeProvider, { theme: theme }, routedComponent)
            );
            
            // Render to string
            const renderedMarkup = ReactDOMServer.renderToString(pageElement);
            const emotionChunks = extractCriticalToChunks(renderedMarkup);
            
            // Build the full HTML page
            const templatePath = path.resolve(__dirname, 'public', 'index.html');
            let template = fs.readFileSync(templatePath, 'utf8');
            
            // Add JavaScript bundles
            let scriptTags = '';
            jsBundles.forEach(jsFile => {
              scriptTags += `<script src="${jsFile}"></script>`;
            });
            
            // Add global CSS from src/index.css
            let globalCss = '';
            try {
              globalCss = fs.readFileSync(path.resolve(__dirname, 'src', 'index.css'), 'utf8');
              // Fix relative font paths for prerendered HTML (remove ../public to make them relative to public root)
              globalCss = globalCss.replace(/url\('\.\.\/public/g, "url('");
            } catch (error) {
              console.warn('Could not read src/index.css:', error.message);
            }
            
            // Add inline CSS from emotion
            let emotionCss = '';
            if (emotionChunks.styles.length > 0) {
              emotionChunks.styles.forEach(style => {
                if (style.css) {
                  emotionCss += style.css;
                }
              });
            }
            
            // Combine all CSS
            const inlineCss = globalCss + emotionCss;
            
            // Use the rendered markup as-is (no regex replacements)
            let processedMarkup = renderedMarkup;
            
            // Replace placeholders in template
            const finalHtml = template
              .replace('<div id="root"></div>', `<div id="root">${processedMarkup}</div>`)
              .replace('</head>', `<style>${inlineCss}</style></head>`)
              .replace('</body>', `
                <script>
                  window.__PRERENDER_FALLBACK__ = {path: '/404', content: ${JSON.stringify(processedMarkup)}, timestamp: ${Date.now()}};
                </script>
                ${scriptTags}
              </body>`);
            
            // Serve the prerendered HTML with 404 status
            res.status(404);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            return res.send(finalHtml);
            
            // If we get here, prerender failed - let the error bubble up
            throw new Error('404 prerender failed completely');
          } else {
            next();
          }
        }
      });

      return middlewares;
    },
    hot: true,
    port: 9500,
    open: false,
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
      rewrites: [
        // Exclude prerendered routes from SPA fallback
        { from: /^\/Kategorie\//, to: function(context) {
          return context.parsedUrl.pathname;
        }},
        { from: /^\/Artikel\//, to: function(context) {
          return context.parsedUrl.pathname;
        }},
        // All other routes should fallback to React SPA
        { from: /^\/(?!api|socket\.io|assets|js|css|favicon\.ico).*$/, to: '/index.html' }
      ]
    },
    client: {
      logging: 'verbose',
      overlay: {
        errors: true,
        warnings: true, // Disable warnings overlay to reduce noise
        runtimeErrors: true,
      },
    },
  },
};
