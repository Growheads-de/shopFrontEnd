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
    compiler.hooks.afterEmit.tap('GitHashJsonPlugin', (compilation) => {
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
    splitChunks: {
      chunks: chunk => chunk.name !== 'main',
      maxInitialRequests: Infinity,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.${packageName.replace('@', '')}`;
          }
        },
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `muivendor.${packageName.replace('@', '')}`;
          },
          priority: 10,
          enforce: true,
          maxSize: 200000,
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
    isDevelopment && new ReactRefreshWebpackPlugin(),
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
  ].filter(Boolean),
  devServer: {
    allowedHosts: 'all',
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
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) throw new Error('webpack-dev-server is not defined');
      devServer.app.use((req, res, next) => {
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
      webSocketURL: 'wss://dev.seedheads.de/ws',
      logging: 'verbose',
      overlay: {
        errors: true,
        warnings: true,
      },
    },
  },
};
