const path = require('path');

module.exports = {
  entry: './app.js', // Entry file
  output: {
    filename: 'bundle.js', // Output file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  mode: 'production',
};