const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin(['index.html', 'index.css', '404.html', '50x.html', 'favicon.ico', 'firasans-light-webfont.woff', 'firasans-light-webfont.woff2', 'robots.txt', {from: 'pdfs/cv.pdf', to: 'pdfs/cv.pdf'}])
  ]
};
