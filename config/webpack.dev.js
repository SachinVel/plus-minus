const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const path = require('path');
const webpack = require('webpack');

let webpackConfig = {
  entry: {
    'import-file': './app/renderer/windows/import-file/import-file.js',
    'bank-stmt-preview': './app/renderer/windows/bank-statement-preview/bank-stmt-preview.js',
    'consolidation-viewer': './app/renderer/windows/consolidation-viewer/consolidation-viewer.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist/')
  },

  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "fs": false
    }
  },

  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new HtmlWebpackPlugin({
      template: './app/renderer/windows/import-file/import-file.html',
      inject: true,
      chunks: ['import-file'],
      filename: 'import-file.html'
    }),
    new HtmlWebpackPlugin({
      template: './app/renderer/windows/bank-statement-preview/bank-stmt-preview.html',
      inject: true,
      chunks: ['bank-stmt-preview'],
      filename: 'bank-stmt-preview.html'
    }),
    new HtmlWebpackPlugin({
      template: './app/renderer/windows/consolidation-viewer/consolidation-viewer.html',
      inject: true,
      chunks: ['consolidation-viewer'],
      filename: 'consolidation-viewer.html'
    }),
  ],

  target: 'electron-main',

  node: {
    __dirname: false
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }, {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ]
      }, {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
      }, {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ]
  },
};

if (process.env.NODE_ENV === 'production') {
  webpackConfig.module.rules.push(
    {
      test: /\.js$/,
      enforce: 'post',
      use: {
        loader: WebpackObfuscator.loader,
        options: {
          rotateStringArray: true
        }
      }
    }
  )
} else {
  webpackConfig.devtool = 'eval-cheap-source-map';
}

module.exports = webpackConfig;