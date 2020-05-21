const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackChromeReloaderPlugin = require('webpack-chrome-extension-reloader');
module.exports = {
  mode: 'production',
  entry: {
    main: './src/main.js',
    background: './src/background.js'
  },
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, './out/**/*')]
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, './src/manifest.json'),
        to: path.resolve(__dirname, './out/manifest.json')
      }, {
        from: path.resolve(__dirname, './src/images'),
        to: path.resolve(__dirname, './out'),
        ignore: ['*.gif']
      }, {
        from: path.resolve(__dirname, './src/popup.js'),
        to: path.resolve(__dirname, './out/popup.js')
      }, {
        from: path.resolve(__dirname, './src/page/popup.html'),
        to: path.resolve(__dirname, './out/popup.html')
      }
    ]),
    new WebpackChromeReloaderPlugin({
      port: 9091,
      reloadPage: true,
      entries: {
        contentScript: 'main',
        background: 'background'
      }
    }),
  ]
}