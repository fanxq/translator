const { merge } = require('webpack-merge');
const WebpackChromeReloaderPlugin = require('webpack-chrome-extension-reloader');
const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
  mode: 'development',
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
}); 