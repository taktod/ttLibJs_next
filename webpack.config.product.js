var webpack = require("webpack");
var Copy = require("copy-webpack-plugin");
var BrowserSync = require("browser-sync-webpack-plugin");

module.exports = {
  entry:  __dirname + "/src/ts/ttLibJs.ts",
  output: {
    path: __dirname + "/",
    filename: "ttLibJs.js",
    library: ["tt"]
  },
  resolve: {
    extensions: ["", ".js", ".ts"]
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: "awesome-typescript-loader"}
    ]
  }
}