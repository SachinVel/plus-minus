const WebpackObfuscator = require('webpack-obfuscator');
const path = require('path');
const webpack = require('webpack');

let webpackConfig = {
  entry: {
    'application-index': './app/renderer/application-index.js',
    'authentication-index': './app/renderer/authentication-index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist/'),
    assetModuleFilename: 'resources/[hash][ext][query]'
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
      {
        test: /\.html$/i,
        loader: 'html-loader',
      }
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