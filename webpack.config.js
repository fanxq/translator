const path = require('path');
const { resolve } = path;
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: {
        popup: path.resolve(__dirname, './src/popup/index.ts'),
        contentScript: path.resolve(__dirname, './src/contentScripts/index.ts'),
        background: path.resolve(__dirname, './src/background/index.ts')
    },
    target: 'web',
    output: {
         clean: true,
        filename: (pathData) => {
            return pathData.chunk.name !== 'popup' ? '[name].js' : '[name]/index.js';
        },
        path: path.resolve(__dirname, './dist'),
    },
    module: {
        rules: [
             // 处理vue
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.(t|j)s$/,
                exclude: /node_modules/,
                use: [
                  {
                    loader: 'babel-loader',
                  },
                ],
              },
              {
                  test: /\.css$/,
                  use: [
                    {
                        loader: 'style-loader',
                        options: {
                            attributes: { 'data-tag': "mystyle" }
                        //   insert: '#styleHost',
                        //   styleTagTransform: function(css, style) {
                        //     css = css.replace(/:root/igm, ':host');
                        //     style.innerHTML = `${css}`;
                        //     return style;
                        //     //document.head.appendChild(style);
                        //   }
                        }
                      },
                      'css-loader'
                  ]
              },
              {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            attributes: { 'data-tag': "mystyle" }
                        }
                      },
                    'css-loader',
                    'less-loader'
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, './src/popup/index.html'),
          filename: 'popup/index.html',
          chunks: ['popup']
        }),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
        new CopyWebpackPlugin({
            patterns: [
                    {
                        from: path.resolve(__dirname, './src/manifest.json'),
                        to: path.resolve(__dirname, './dist/manifest.json')
                    }, {
                        from: path.resolve(__dirname, './src/assets'),
                        to: path.resolve(__dirname, './dist'),
                        globOptions: {
                            ignore: ['images/*.gif', 'config/**/*', 'scss/**/*']
                        }
                    }
                ]
            }
        )
    ],
    resolve: {
        extensions: ['.js', '.vue', '.ts', '.tsx'],
        alias: {
            '@': resolve('src'),
        },
    },
}