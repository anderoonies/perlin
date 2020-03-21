const path = require("path");
const glob = require("glob");

module.exports = {
  entry: {
    "bundle.js": "./src/index.js"
  },
  output: {
    filename: "build/static/js/bundle.min.js"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"]
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: []
};
