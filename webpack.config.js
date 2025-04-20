import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import { cpSync } from 'fs';

// Custom plugin to copy assets
const CopyAssetsPlugin = {
  apply: (compiler) => {
    compiler.hooks.afterEmit.tap('CopyAssetsPlugin', () => {
      const src = path.resolve(__dirname, 'public/assets');
      const dest = path.resolve(__dirname, 'dist/assets');
      try {
        cpSync(src, dest, { recursive: true });
        console.log('Assets copied successfully');
      } catch (err) {
        console.error('Error copying assets:', err);
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
      overlay: {
        errors: true,
        warnings: true,
      },
    },
  },
};
