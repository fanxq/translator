const path = require('path');
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
  plugins: [
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