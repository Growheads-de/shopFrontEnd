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

      return middlewares;
    },
    hot: true,
    port: 9500,
    open: false,
    historyApiFallback: true,
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
