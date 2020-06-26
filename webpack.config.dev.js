const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackChromeReloaderPlugin = require('webpack-chrome-extension-reloader');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/content_scripts/main.js',
    background: './src/background/background.js'
  },
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'lazyStyleTag',
              insert: function insertAtTop(element) {
                var parent = document.querySelector('#TX_SH_0001').shadowRoot;
                // eslint-disable-next-line no-underscore-dangle
                var lastInsertedElement =
                  window._lastElementInsertedByStyleLoader;

                if (!lastInsertedElement) {
                  parent.insertBefore(element, parent.firstChild);
                } else if (lastInsertedElement.nextSibling) {
                  parent.insertBefore(element, lastInsertedElement.nextSibling);
                } else {
                  parent.appendChild(element);
                }

                // eslint-disable-next-line no-underscore-dangle
                window._lastElementInsertedByStyleLoader = element;
              }
            }
          },
          'css-loader',
          'sass-loader'
        ],
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, './src/manifest.json'),
        to: path.resolve(__dirname, './out/manifest.json')
      }, {
        from: path.resolve(__dirname, './src/assets'),
        to: path.resolve(__dirname, './out'),
        ignore: ['images/*.gif', 'config/**/*', 'scss/**/*']
      }, {
        from: path.resolve(__dirname, './src/browser_action_popup'),
        to: path.resolve(__dirname, './out/browser_action_popup')
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