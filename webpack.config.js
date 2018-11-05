const path = require('path');
module.exports = {
    mode: 'production',
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'out'),
      filename: 'main.js'
    }
}